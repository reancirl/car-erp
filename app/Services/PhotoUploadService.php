<?php

namespace App\Services;

use App\Models\WorkOrder;
use App\Models\WorkOrderPhoto;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PhotoUploadService
{
    /**
     * Upload and process a photo with EXIF metadata extraction.
     *
     * @param WorkOrder $workOrder
     * @param UploadedFile $photo
     * @param string $photoType
     * @param string|null $notes
     * @return WorkOrderPhoto
     */
    public function uploadPhoto(
        WorkOrder $workOrder,
        UploadedFile $photo,
        string $photoType = 'during',
        ?string $notes = null
    ): WorkOrderPhoto {
        // Store the photo
        $path = $photo->store(
            'work_orders/' . $workOrder->id . '/photos',
            'public'
        );

        // Extract EXIF data
        $exifData = $this->extractExifData($photo);

        // Create photo record
        $photoRecord = WorkOrderPhoto::create([
            'work_order_id' => $workOrder->id,
            'file_path' => $path,
            'file_name' => $photo->getClientOriginalName(),
            'file_size' => $photo->getSize(),
            'mime_type' => $photo->getMimeType(),
            'photo_type' => $photoType,
            'latitude' => $exifData['latitude'] ?? null,
            'longitude' => $exifData['longitude'] ?? null,
            'photo_taken_at' => $exifData['datetime'] ?? null,
            'camera_make' => $exifData['make'] ?? null,
            'camera_model' => $exifData['model'] ?? null,
            'uploaded_ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'uploaded_by' => auth()->id(),
            'has_gps_data' => isset($exifData['latitude']) && isset($exifData['longitude']),
            'has_exif_data' => !empty($exifData),
            'notes' => $notes,
        ]);

        // Update work order photo count
        $this->updateWorkOrderPhotoStatus($workOrder);

        // Verify location if GPS data is available
        if ($photoRecord->has_gps_data && $workOrder->service_location_lat && $workOrder->service_location_lng) {
            $this->verifyPhotoLocation($workOrder, $photoRecord);
        }

        return $photoRecord;
    }

    /**
     * Upload multiple photos at once.
     *
     * @param WorkOrder $workOrder
     * @param array $photos Array of UploadedFile
     * @param string $photoType
     * @return array Array of WorkOrderPhoto models
     */
    public function uploadMultiplePhotos(
        WorkOrder $workOrder,
        array $photos,
        string $photoType = 'during'
    ): array {
        $uploadedPhotos = [];

        foreach ($photos as $photo) {
            if ($photo instanceof UploadedFile) {
                $uploadedPhotos[] = $this->uploadPhoto($workOrder, $photo, $photoType);
            }
        }

        return $uploadedPhotos;
    }

    /**
     * Extract EXIF metadata from photo.
     *
     * @param UploadedFile $photo
     * @return array
     */
    private function extractExifData(UploadedFile $photo): array
    {
        $data = [];

        try {
            // Check if file is an image
            if (!in_array($photo->getMimeType(), ['image/jpeg', 'image/jpg', 'image/png'])) {
                return $data;
            }

            // Read EXIF data (only works with JPEG/JPG)
            if (in_array($photo->getMimeType(), ['image/jpeg', 'image/jpg'])) {
                $exif = @exif_read_data($photo->getRealPath());

                if ($exif !== false) {
                    // Extract camera info
                    $data['make'] = $exif['Make'] ?? null;
                    $data['model'] = $exif['Model'] ?? null;

                    // Extract datetime
                    if (isset($exif['DateTimeOriginal'])) {
                        try {
                            $data['datetime'] = \DateTime::createFromFormat('Y:m:d H:i:s', $exif['DateTimeOriginal']);
                        } catch (\Exception $e) {
                            $data['datetime'] = null;
                        }
                    }

                    // Extract GPS coordinates
                    if (isset($exif['GPSLatitude']) && isset($exif['GPSLongitude'])) {
                        $data['latitude'] = $this->getGps(
                            $exif['GPSLatitude'],
                            $exif['GPSLatitudeRef'] ?? 'N'
                        );
                        $data['longitude'] = $this->getGps(
                            $exif['GPSLongitude'],
                            $exif['GPSLongitudeRef'] ?? 'E'
                        );
                    }
                }
            }
        } catch (\Exception $e) {
            // Log error but don't fail upload
            \Log::warning('EXIF extraction failed', [
                'file' => $photo->getClientOriginalName(),
                'error' => $e->getMessage(),
            ]);
        }

        return $data;
    }

    /**
     * Convert GPS coordinates to decimal degrees.
     *
     * @param array $coordinate
     * @param string $hemisphere
     * @return float
     */
    private function getGps(array $coordinate, string $hemisphere): float
    {
        if (!is_array($coordinate) || count($coordinate) < 3) {
            return 0.0;
        }

        // Parse degrees, minutes, seconds
        $degrees = $this->parseGpsValue($coordinate[0]);
        $minutes = $this->parseGpsValue($coordinate[1]);
        $seconds = $this->parseGpsValue($coordinate[2]);

        // Convert to decimal degrees
        $decimal = $degrees + ($minutes / 60) + ($seconds / 3600);

        // Apply hemisphere
        if (in_array($hemisphere, ['S', 'W'])) {
            $decimal *= -1;
        }

        return round($decimal, 7);
    }

    /**
     * Parse GPS value from EXIF fraction format.
     *
     * @param mixed $value
     * @return float
     */
    private function parseGpsValue($value): float
    {
        if (is_numeric($value)) {
            return (float) $value;
        }

        if (is_string($value) && strpos($value, '/') !== false) {
            $parts = explode('/', $value);
            if (count($parts) === 2 && $parts[1] != 0) {
                return (float) $parts[0] / (float) $parts[1];
            }
        }

        return 0.0;
    }

    /**
     * Update work order photo status flags.
     *
     * @param WorkOrder $workOrder
     * @return void
     */
    private function updateWorkOrderPhotoStatus(WorkOrder $workOrder): void
    {
        $photoCount = $workOrder->photos()->count();
        $hasBefore = $workOrder->photos()->where('photo_type', 'before')->exists();
        $hasAfter = $workOrder->photos()->where('photo_type', 'after')->exists();

        $workOrder->update([
            'photos_uploaded' => $photoCount > 0,
        ]);

        // Get existing fraud alerts
        $alerts = $workOrder->fraud_alerts ?? [];

        // Remove existing photo-related alerts
        $alerts = array_filter($alerts, function($alert) {
            return !in_array($alert['type'], ['missing_photos', 'missing_before_after']);
        });

        // Check if required photos are met
        if ($photoCount < $workOrder->minimum_photos_required) {
            $alerts[] = [
                'type' => 'missing_photos',
                'message' => "Only {$photoCount} photo(s) uploaded. Minimum required: {$workOrder->minimum_photos_required}",
                'data' => ['photo_count' => $photoCount],
                'detected_at' => now()->toDateTimeString(),
            ];
        }

        // Check for before/after photos
        if ($workOrder->requires_photo_verification && (!$hasBefore || !$hasAfter)) {
            $alerts[] = [
                'type' => 'missing_before_after',
                'message' => 'Missing required before/after photos',
                'data' => ['has_before' => $hasBefore, 'has_after' => $hasAfter],
                'detected_at' => now()->toDateTimeString(),
            ];
        }

        // Update fraud alerts
        $workOrder->fraud_alerts = array_values($alerts); // Re-index array
        $workOrder->has_fraud_alerts = count($alerts) > 0;

        // Update verification status
        if (count($alerts) === 0 && $workOrder->verification_status === 'flagged') {
            $workOrder->verification_status = 'pending';
        } elseif (count($alerts) > 0 && $workOrder->verification_status !== 'rejected') {
            $workOrder->verification_status = 'flagged';
        }

        $workOrder->save();
    }

    /**
     * Verify photo location against service center location.
     *
     * @param WorkOrder $workOrder
     * @param WorkOrderPhoto $photo
     * @return void
     */
    private function verifyPhotoLocation(WorkOrder $workOrder, WorkOrderPhoto $photo): void
    {
        if (!$photo->latitude || !$photo->longitude) {
            return;
        }

        // Calculate distance (using Haversine formula in WorkOrder model)
        $earthRadius = 6371; // km
        $lat1 = deg2rad($workOrder->service_location_lat);
        $lng1 = deg2rad($workOrder->service_location_lng);
        $lat2 = deg2rad($photo->latitude);
        $lng2 = deg2rad($photo->longitude);

        $latDiff = $lat2 - $lat1;
        $lngDiff = $lng2 - $lng1;

        $a = sin($latDiff / 2) * sin($latDiff / 2) +
            cos($lat1) * cos($lat2) *
            sin($lngDiff / 2) * sin($lngDiff / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distance = $earthRadius * $c;

        // Flag if photo was taken more than 1km away from service center
        if ($distance > 1.0) {
            $workOrder->addFraudAlert(
                'location_mismatch',
                "Photo taken {$distance} km away from service center",
                [
                    'distance_km' => round($distance, 2),
                    'photo_id' => $photo->id,
                    'photo_location' => [
                        'lat' => $photo->latitude,
                        'lng' => $photo->longitude,
                    ],
                    'service_location' => [
                        'lat' => $workOrder->service_location_lat,
                        'lng' => $workOrder->service_location_lng,
                    ],
                ]
            );
        } else {
            // Location verified
            $workOrder->update(['location_verified' => true]);
        }
    }

    /**
     * Delete a photo.
     *
     * @param WorkOrderPhoto $photo
     * @return bool
     */
    public function deletePhoto(WorkOrderPhoto $photo): bool
    {
        // Delete physical file
        Storage::disk('public')->delete($photo->file_path);

        // Delete database record
        $deleted = $photo->delete();

        // Update work order status
        $this->updateWorkOrderPhotoStatus($photo->workOrder);

        return $deleted;
    }

    /**
     * Get photo statistics for a work order.
     *
     * @param WorkOrder $workOrder
     * @return array
     */
    public function getPhotoStatistics(WorkOrder $workOrder): array
    {
        $photos = $workOrder->photos;

        return [
            'total_count' => $photos->count(),
            'before_count' => $photos->where('photo_type', 'before')->count(),
            'after_count' => $photos->where('photo_type', 'after')->count(),
            'during_count' => $photos->where('photo_type', 'during')->count(),
            'with_gps_count' => $photos->where('has_gps_data', true)->count(),
            'with_exif_count' => $photos->where('has_exif_data', true)->count(),
            'verified_count' => $photos->where('is_verified', true)->count(),
            'has_required_minimum' => $photos->count() >= $workOrder->minimum_photos_required,
            'has_before_after' => $workOrder->hasBeforeAfterPhotos(),
        ];
    }
}

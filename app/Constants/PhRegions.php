<?php

namespace App\Constants;

class PhRegions
{
    public const REGIONS = [
        'ncr' => 'National Capital Region (NCR)',
        'car' => 'Cordillera Administrative Region (CAR)',
        'region_1' => 'Ilocos Region (Region I)',
        'region_2' => 'Cagayan Valley (Region II)',
        'region_3' => 'Central Luzon (Region III)',
        'region_4a' => 'Calabarzon (Region IV-A)',
        'region_4b' => 'Mimaropa (Region IV-B)',
        'region_5' => 'Bicol Region (Region V)',
        'region_6' => 'Western Visayas (Region VI)',
        'region_7' => 'Central Visayas (Region VII)',
        'region_8' => 'Eastern Visayas (Region VIII)',
        'region_9' => 'Zamboanga Peninsula (Region IX)',
        'region_10' => 'Northern Mindanao (Region X)',
        'region_11' => 'Davao Region (Region XI)',
        'region_12' => 'SOCCSKSARGEN (Region XII)',
        'region_13' => 'Caraga (Region XIII)',
        'barmm' => 'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)',
    ];

    public static function getRegions(): array
    {
        return self::REGIONS;
    }

    public static function getRegionName(string $key): ?string
    {
        return self::REGIONS[$key] ?? null;
    }

    public static function getRegionKeys(): array
    {
        return array_keys(self::REGIONS);
    }
}
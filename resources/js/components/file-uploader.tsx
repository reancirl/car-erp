import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface FileUploaderProps {
    vehicleId: number;
    type: 'photos' | 'documents';
    existingFiles: string[] | Array<{ name: string; url: string }>;
    onUploadComplete?: () => void;
}

export default function FileUploader({ vehicleId, type, existingFiles, onUploadComplete }: FileUploaderProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    const isPhoto = type === 'photos';
    const accept = isPhoto ? 'image/jpeg,image/png,image/jpg,image/webp' : '.pdf,.doc,.docx,.xls,.xlsx';
    const maxSize = isPhoto ? 5 : 10; // MB
    const maxFiles = 10;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        // Validate file count
        if (files.length + selectedFiles.length > maxFiles) {
            alert(`You can only upload up to ${maxFiles} files at a time`);
            return;
        }

        // Validate file sizes
        const oversizedFiles = files.filter(file => file.size > maxSize * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            alert(`Some files exceed the ${maxSize}MB size limit`);
            return;
        }

        setSelectedFiles([...selectedFiles, ...files]);
    };

    const removeSelectedFile = (index: number) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        
        selectedFiles.forEach((file) => {
            formData.append(isPhoto ? 'photos[]' : 'documents[]', file);
        });

        try {
            await fetch(`/inventory/units/${vehicleId}/${isPhoto ? 'upload-photos' : 'upload-documents'}`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            setSelectedFiles([]);
            if (onUploadComplete) onUploadComplete();
            router.reload({ only: ['vehicle'] });
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (fileUrl: string) => {
        if (!confirm('Are you sure you want to delete this file?')) return;

        setDeleting(fileUrl);
        try {
            await fetch(`/inventory/units/${vehicleId}/${isPhoto ? 'delete-photo' : 'delete-document'}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ [isPhoto ? 'photo_url' : 'document_url']: fileUrl }),
            });

            if (onUploadComplete) onUploadComplete();
            router.reload({ only: ['vehicle'] });
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Delete failed. Please try again.');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Upload Section */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block">
                                <span className="sr-only">Choose files</span>
                                <input
                                    type="file"
                                    multiple
                                    accept={accept}
                                    onChange={handleFileSelect}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100
                                        cursor-pointer"
                                />
                            </label>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Selected files ({selectedFiles.length}):</p>
                                <div className="space-y-2">
                                    {selectedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <div className="flex items-center space-x-2">
                                                {isPhoto ? (
                                                    <ImageIcon className="h-4 w-4" />
                                                ) : (
                                                    <FileText className="h-4 w-4" />
                                                )}
                                                <span className="text-sm">{file.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeSelectedFile(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="w-full"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload {selectedFiles.length} file(s)
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Existing Files */}
            {existingFiles && existingFiles.length > 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm font-medium mb-3">
                            Existing {isPhoto ? 'Photos' : 'Documents'} ({existingFiles.length}):
                        </p>
                        <div className={isPhoto ? 'grid grid-cols-2 md:grid-cols-4 gap-4' : 'space-y-2'}>
                            {existingFiles.map((file, index) => {
                                const fileUrl = typeof file === 'string' ? file : file.url;
                                const fileName = typeof file === 'string' ? `File ${index + 1}` : file.name;

                                return (
                                    <div key={index} className={isPhoto ? 'relative group' : 'flex items-center justify-between p-2 border rounded'}>
                                        {isPhoto ? (
                                            <>
                                                <img
                                                    src={fileUrl}
                                                    alt={fileName}
                                                    className="w-full aspect-video object-cover rounded"
                                                />
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDelete(fileUrl)}
                                                    disabled={deleting === fileUrl}
                                                >
                                                    {deleting === fileUrl ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <X className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center space-x-2">
                                                    <FileText className="h-4 w-4" />
                                                    <a
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm hover:underline"
                                                    >
                                                        {fileName}
                                                    </a>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(fileUrl)}
                                                    disabled={deleting === fileUrl}
                                                >
                                                    {deleting === fileUrl ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <X className="h-4 w-4 text-red-600" />
                                                    )}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No {isPhoto ? 'photos' : 'documents'} uploaded yet. Use the form above to upload files.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

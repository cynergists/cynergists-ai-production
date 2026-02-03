import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface ImageUploadProps {
    value: string | null;
    onChange: (url: string | null) => void;
    label?: string;
    folder?: string;
}

export function ImageUpload({
    value,
    onChange,
    label = 'Image',
    folder = 'general',
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const validateAndUpload = async (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Invalid file type',
                description: 'Please select an image file.',
                variant: 'destructive',
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'File too large',
                description: 'Please select an image under 5MB.',
                variant: 'destructive',
            });
            return;
        }

        setIsUploading(true);

        try {
            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('plan-product-images')
                .upload(fileName, file);

            if (error) throw error;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('plan-product-images')
                .getPublicUrl(data.path);

            onChange(urlData.publicUrl);
            toast({
                title: 'Image uploaded',
                description: 'Your image has been uploaded successfully.',
            });
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: 'Upload failed',
                description: 'Failed to upload image. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
            // Reset the input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await validateAndUpload(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        await validateAndUpload(file);
    };

    const handleRemove = () => {
        onChange(null);
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex flex-col gap-3">
                {value ? (
                    <div className="relative w-full max-w-xs">
                        <img
                            src={value}
                            alt="Uploaded"
                            className="h-32 w-full rounded-lg border border-border object-cover"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={handleRemove}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ) : (
                    <div
                        className={`flex h-32 w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors ${
                            isDragging
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {isUploading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <span className="px-2 text-center text-sm text-muted-foreground">
                                    {isDragging
                                        ? 'Drop file here'
                                        : 'Drop file here or click to upload'}
                                </span>
                            </>
                        )}
                    </div>
                )}
                <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                {value && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-fit"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Upload className="mr-2 h-4 w-4" />
                        )}
                        Change Image
                    </Button>
                )}
            </div>
        </div>
    );
}

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";

interface ImageUploaderProps {
    dateId: string;
    images: string[];
    onImagesChange: (images: string[]) => void;
}

export const ImageUploader = ({ dateId, images, onImagesChange }: ImageUploaderProps) => {
    const { t } = useTranslation();
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Check max limit
        if (images.length + files.length > 5) {
            toast.error(t("dates.images.max_limit"));
            return;
        }

        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append("images", file);
        });

        setUploading(true);
        try {
            const response = await axiosConfig.post(`/dates/${dateId}/images`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            onImagesChange(response.data.images);
            toast.success(t("dates.images.upload_success"));
        } catch (error: any) {
            toast.error(t(error.response?.data?.error || "dates.images.upload_error"));
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = async (imageUrl: string) => {
        const filename = imageUrl.split("/").pop();
        if (!filename) return;

        setDeleting(imageUrl);
        try {
            const response = await axiosConfig.delete(`/dates/${dateId}/images/${filename}`);
            onImagesChange(response.data.images);
            toast.success(t("dates.images.delete_success"));
        } catch (error: any) {
            toast.error(t(error.response?.data?.error || "dates.images.delete_error"));
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{t("dates.images.title")}</label>
                <span className="text-xs text-muted-foreground">
                    {images.length}/5
                </span>
            </div>

            {/* Image grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {images.map((imageUrl) => (
                        <div key={imageUrl} className="relative aspect-square rounded-lg overflow-hidden group">
                            <img
                                src={imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => handleDelete(imageUrl)}
                                disabled={deleting === imageUrl}
                                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                            >
                                {deleting === imageUrl ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <X className="h-3 w-3" />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload button */}
            {images.length < 5 && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                    {uploading ? (
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>{t("common.loading")}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <ImagePlus className="h-8 w-8" />
                            <span className="text-sm">{t("dates.images.add")}</span>
                            <span className="text-xs">{t("dates.images.hint")}</span>
                        </div>
                    )}
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
};

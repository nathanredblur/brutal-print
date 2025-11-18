// Image upload component - simplified to only handle upload
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Image } from "lucide-react";

interface ImageUploaderProps {
  onImageUploaded?: (imageDataUrl: string) => void;
}

export default function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type", {
          description: "Please select an image file (JPG, PNG, SVG)",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
        // Notify parent with the raw image data
        onImageUploaded?.(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [onImageUploaded, toast]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      ref={dropZoneRef}
      className={`
        border-2 border-dashed rounded-lg cursor-pointer transition-all
        flex items-center justify-center text-center min-h-[200px]
        ${
          preview
            ? "border border-slate-700 p-0"
            : "border-slate-700 p-6 bg-slate-800 hover:border-purple-500 hover:bg-purple-500/5"
        }
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => !preview && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        style={{ display: "none" }}
      />

      {preview ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={preview}
            alt="Preview"
            className="max-w-full max-h-[300px] rounded-md"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Image size={36} className="text-purple-500" />
          <p className="text-sm font-semibold text-slate-200 m-0">
            Drop image here or click to upload
          </p>
          <span className="text-xs text-slate-500">Supports JPG, PNG, SVG</span>
        </div>
      )}
    </div>
  );
}

// Image upload component - simple button
import { useRef, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ImageUploaderProps {
  onImageUploaded?: (imageDataUrl: string) => void;
}

export default function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        onImageUploaded?.(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [onImageUploaded]
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

  return (
    <div className="flex flex-col items-center gap-3 p-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        style={{ display: "none" }}
      />

      <Button
        variant="neuro"
        size="lg"
        onClick={() => fileInputRef.current?.click()}
        className="w-full"
      >
        <Upload size={20} />
        <span>Upload Image</span>
      </Button>

      <p className="text-xs text-slate-500 text-center">
        Supports JPG, PNG, SVG
      </p>
    </div>
  );
}

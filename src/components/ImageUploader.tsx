// Image upload component - simplified to only handle upload
import { useState, useRef, useCallback } from "react";
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
        alert("Please select an image file");
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
    <div className="image-uploader">
      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        className={`drop-zone ${preview ? "has-image" : ""}`}
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
          <div className="preview-container">
            <img src={preview} alt="Preview" className="preview-image" />
          </div>
        ) : (
          <div className="drop-placeholder">
            <Image size={48} />
            <p>Drop image here or click to upload</p>
            <span>Supports JPG, PNG, SVG</span>
          </div>
        )}
      </div>

      <style>{`
        .image-uploader {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .drop-zone {
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-normal);
          background: var(--color-bg-secondary);
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .drop-zone:hover {
          border-color: var(--color-purple-primary);
          background: rgba(167, 139, 250, 0.05);
        }

        .drop-zone.has-image {
          padding: 0;
          border: 1px solid var(--color-border);
        }

        .preview-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-image {
          max-width: 100%;
          max-height: 300px;
          border-radius: var(--radius-sm);
        }

        .drop-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-text-secondary);
        }

        .drop-placeholder svg {
          color: var(--color-purple-primary);
          width: 36px;
          height: 36px;
        }

        .drop-placeholder p {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0;
        }

        .drop-placeholder span {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}

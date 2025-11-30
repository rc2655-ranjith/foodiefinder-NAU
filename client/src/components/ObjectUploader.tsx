import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ObjectUploaderProps {
  maxFileSize?: number;
  onUploadComplete: (objectPath: string) => void;
  children: ReactNode;
}

export function ObjectUploader({
  maxFileSize = 10485760,
  onUploadComplete,
  children,
}: ObjectUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxFileSize) {
      toast({
        title: "Error",
        description: `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Only image files are allowed",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadResponse = await fetch("/api/objects/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadURL } = await uploadResponse.json();

      const uploadFileResponse = await fetch(uploadURL, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadFileResponse.ok) {
        throw new Error("Failed to upload file");
      }

      const normalizeResponse = await fetch("/api/images", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageURL: uploadURL }),
      });

      if (!normalizeResponse.ok) {
        throw new Error("Failed to process image");
      }

      const { objectPath } = await normalizeResponse.json();
      onUploadComplete(objectPath);

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-upload"
      />
      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        data-testid="button-upload-image"
      >
        {isUploading ? "Uploading..." : children}
      </Button>
    </div>
  );
}

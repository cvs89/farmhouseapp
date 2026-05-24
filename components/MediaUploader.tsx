"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage, validateFile } from "@/lib/media-utils";
import { Upload, X, FileText, Film, Image as ImageIcon, Loader2 } from "lucide-react";

interface MediaUploaderProps {
  bucket: "property-media" | "property-documents" | "review-media";
  category: "image" | "video" | "pdf";
  propertyId: string;
  onUploadComplete: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
}

export default function MediaUploader({
  bucket,
  category,
  propertyId,
  onUploadComplete,
  multiple = false,
  maxFiles = 5,
}: MediaUploaderProps) {
  const [files, setFiles] = useState<{ name: string; progress: number; url?: string; error?: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processAndUploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processAndUploadFiles(Array.from(e.target.files));
    }
  };

  const processAndUploadFiles = async (selectedFiles: File[]) => {
    const validFiles: File[] = [];
    const newFilesList = [...files];

    // Filter by max files limit
    const totalCountAfterAddition = files.length + selectedFiles.length;
    if (!multiple && totalCountAfterAddition > 1) {
      alert("Only single file upload is permitted.");
      return;
    }
    if (multiple && totalCountAfterAddition > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files.`);
      return;
    }

    for (const rawFile of selectedFiles) {
      const validation = validateFile(rawFile, category);
      if (!validation.valid) {
        newFilesList.push({
          name: rawFile.name,
          progress: 0,
          error: validation.error,
        });
        setFiles([...newFilesList]);
        continue;
      }

      // Optimize image client-side if it's an image
      let fileToUpload = rawFile;
      if (category === "image") {
        try {
          fileToUpload = await compressImage(rawFile);
        } catch (e) {
          console.warn("Client-side image compression failed, uploading raw file.", e);
        }
      }

      validFiles.push(fileToUpload);
    }

    // Start uploads
    for (const file of validFiles) {
      const fileIndex = newFilesList.length;
      newFilesList.push({
        name: file.name,
        progress: 10, // Indeterminate start
      });
      setFiles([...newFilesList]);

      try {
        // Build file name paths: bucket/propertyId/timestamp_filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${propertyId}/${fileName}`;

        // Upload to Supabase
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        newFilesList[fileIndex] = {
          name: file.name,
          progress: 100,
          url: publicUrl,
        };
        setFiles([...newFilesList]);

        // Trigger callback with completed URLs
        const uploadedUrls = newFilesList
          .filter((f) => f.url)
          .map((f) => f.url as string);
        onUploadComplete(uploadedUrls);

      } catch (err: any) {
        console.error("Upload failed", err);
        newFilesList[fileIndex] = {
          name: file.name,
          progress: 0,
          error: err.message || "Upload failed. Try again.",
        };
        setFiles([...newFilesList]);
      }
    }
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    const remainingUrls = updated.filter((f) => f.url).map((f) => f.url as string);
    onUploadComplete(remainingUrls);
  };

  return (
    <div className="w-full space-y-4">
      
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full py-8 px-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          dragActive
            ? "border-green-800 bg-green-800/5"
            : "border-stone-200/60 dark:border-slate-800/40 hover:border-green-800/50 dark:hover:border-green-800/40 bg-white/40 dark:bg-slate-900/20"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          multiple={multiple}
          accept={
            category === "image"
              ? "image/*"
              : category === "video"
              ? "video/*"
              : "application/pdf"
          }
          className="hidden"
        />

        <div className="p-3 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-500 mb-3">
          <Upload className="w-6 h-6" />
        </div>

        <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
          Drag & drop files here, or <span className="text-green-800 dark:text-green-400 hover:underline">browse</span>
        </p>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
          Supports {category.toUpperCase()} files (Max {category === "image" ? "5MB" : category === "video" ? "50MB" : "10MB"})
        </p>
      </div>

      {/* Upload Progress & Previews */}
      {files.length > 0 && (
        <div className="space-y-2 animate-fade-in">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-xl border border-stone-200/40 dark:border-slate-800/40 bg-stone-50/50 dark:bg-slate-950/20"
            >
              {/* Type Icons */}
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 text-stone-500 shadow-sm border border-stone-200/20">
                {category === "image" ? (
                  <ImageIcon className="w-4 h-4" />
                ) : category === "video" ? (
                  <Film className="w-4 h-4" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
              </div>

              {/* Progress & Name details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-semibold text-stone-700 dark:text-stone-300 truncate">
                    {file.name}
                  </span>
                  <span className="text-stone-400">
                    {file.error ? (
                      <span className="text-destructive font-semibold">Failed</span>
                    ) : file.progress < 100 ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading
                      </span>
                    ) : (
                      <span className="text-green-700 font-semibold">Done</span>
                    )}
                  </span>
                </div>

                {/* Progress bar */}
                {!file.error && file.progress < 100 && (
                  <div className="w-full h-1 bg-stone-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-800 transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}

                {/* Validation Errors */}
                {file.error && (
                  <p className="text-[10px] text-destructive font-medium mt-0.5 leading-none">
                    {file.error}
                  </p>
                )}
              </div>

              {/* Remove Actions */}
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-slate-800 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

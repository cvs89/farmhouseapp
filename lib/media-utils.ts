/**
 * Compresses an image client-side using HTML5 Canvas to optimize upload sizes.
 */
export function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1200,
  quality = 0.82
): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return resolve(file); // Return as is if not an image
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale bounds
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Validates files based on platform rules (images, walkthrough videos, brochures).
 */
export function validateFile(
  file: File,
  category: "image" | "video" | "pdf"
): { valid: boolean; error?: string } {
  const sizeMB = file.size / (1024 * 1024);

  if (category === "image") {
    if (!file.type.startsWith("image/")) {
      return { valid: false, error: "Selected file must be an image." };
    }
    if (sizeMB > 5) {
      return { valid: false, error: "Images must not exceed 5MB." };
    }
  }

  if (category === "video") {
    if (!file.type.startsWith("video/")) {
      return { valid: false, error: "Selected file must be a video." };
    }
    if (sizeMB > 50) {
      return { valid: false, error: "Videos must not exceed 50MB." };
    }
  }

  if (category === "pdf") {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return { valid: false, error: "Selected file must be a PDF document." };
    }
    if (sizeMB > 10) {
      return { valid: false, error: "PDF documents must not exceed 10MB." };
    }
  }

  return { valid: true };
}

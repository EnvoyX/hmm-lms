// ~/lib/file-utils.ts
import { type AttachableType, ResourceCategory } from "@prisma/client";

// Mapped to the new ResourceCategory enum
export const ALLOWED_MIME_TYPES = {
  // Documents
  "application/pdf": { type: ResourceCategory.E_BOOK, ext: "pdf" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    type: ResourceCategory.PRESENTATION,
    ext: "pptx",
  },
  "application/vnd.ms-powerpoint": {
    type: ResourceCategory.PRESENTATION,
    ext: "ppt",
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    type: ResourceCategory.NOTES, // Was DOCUMENT
    ext: "docx",
  },
  "application/msword": { type: ResourceCategory.NOTES, ext: "doc" }, // Was DOCUMENT
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    type: ResourceCategory.OTHER, // Was SPREADSHEET
    ext: "xlsx",
  },
  "application/vnd.ms-excel": { type: ResourceCategory.OTHER, ext: "xls" }, // Was SPREADSHEET
  "text/csv": { type: ResourceCategory.OTHER, ext: "csv" }, // Was SPREADSHEET

  // Images
  "image/jpeg": { type: ResourceCategory.OTHER, ext: "jpg" }, // Was IMAGE
  "image/jpg": { type: ResourceCategory.OTHER, ext: "jpg" }, // Was IMAGE
  "image/png": { type: ResourceCategory.OTHER, ext: "png" }, // Was IMAGE

  // Media
  "video/mp4": { type: ResourceCategory.VIDEO, ext: "mp4" },
  "audio/mpeg": { type: ResourceCategory.OTHER, ext: "mp3" }, // Was AUDIO
  "audio/wav": { type: ResourceCategory.OTHER, ext: "wav" }, // Was AUDIO
} as const;

export const MAX_FILE_SIZE = 250 * 1024 * 1024; // 250MB

export function validateFile(file: File) {
  const errors: string[] = [];

  if (file.size > MAX_FILE_SIZE) {
    errors.push(
      `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    );
  }

  if (!ALLOWED_MIME_TYPES[file.type as keyof typeof ALLOWED_MIME_TYPES]) {
    errors.push(`File type ${file.type} is not supported`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    fileInfo: ALLOWED_MIME_TYPES[file.type as keyof typeof ALLOWED_MIME_TYPES],
  };
}

/**
 * Generates a unique file key for storing in a service like S3.
 * Revised to be polymorphic, matching the new Resource schema.
 * @example
 * generateFileKey('COURSE', 'course_id_123', 'lecture-notes.pdf', ResourceCategory.NOTES)
 * // Returns: 'courses/course_id_123/notes/1672531200000_lecture-notes.pdf'
 */
export function generateFileKey(
  attachableType: AttachableType,
  attachableId: string,
  filename: string,
  category: ResourceCategory,
): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const typePlural = `${attachableType.toLowerCase()}s`; // e.g., COURSE -> courses

  return `${typePlural}/${attachableId}/${category.toLowerCase()}/${timestamp}_${sanitizedFilename}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

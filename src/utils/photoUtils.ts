import { Paths, File, Directory } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { config } from "@/constants/config";
import type { Result } from "@/lib/result";

export interface CompressedPhoto {
  uri: string;
  width: number;
  height: number;
}

/**
 * Compresses and resizes a photo to fit within MAX_PHOTO_SIZE_MB (~1MB).
 * Uses the new object-oriented ImageManipulator API (SDK 55).
 */
export async function compressPhoto(
  sourceUri: string
): Promise<Result<CompressedPhoto>> {
  try {
    const context = ImageManipulator.manipulate(sourceUri);
    const imageRef = await context
      .resize({ width: config.PHOTO_MAX_DIMENSION })
      .renderAsync();

    const result = await imageRef.saveAsync({
      compress: config.PHOTO_COMPRESSION_QUALITY,
      format: SaveFormat.JPEG,
    });

    return {
      success: true,
      data: { uri: result.uri, width: result.width, height: result.height },
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to compress photo",
    };
  }
}

/**
 * Ensures the photos directory exists inside documentDirectory.
 */
function getPhotosDir(): Directory {
  const dir = new Directory(Paths.document, "photos");
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
}

/**
 * Copies a photo from its temporary/cache URI to the app's persistent
 * documentDirectory. Returns the new permanent URI.
 */
export function saveToDocumentDirectory(
  sourceUri: string,
  fileName: string
): Result<string> {
  try {
    const dir = getPhotosDir();
    const dest = new File(dir, `${fileName}.jpg`);
    const source = new File(sourceUri);
    source.copy(dest);

    return { success: true, data: dest.uri };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to save photo to storage",
    };
  }
}

/**
 * Deletes a photo file from the document directory.
 */
export function deletePhotoFile(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // Best-effort deletion — don't throw
  }
}

export interface StorageInfo {
  photoCount: number;
  totalBytes: number;
}

/**
 * Calculates total photo storage usage by scanning the photos directory.
 */
export function getPhotoStorageInfo(): StorageInfo {
  try {
    const dir = new Directory(Paths.document, "photos");
    if (!dir.exists) {
      return { photoCount: 0, totalBytes: 0 };
    }

    const entries = dir.list();
    let totalBytes = 0;
    let photoCount = 0;

    for (const entry of entries) {
      if (entry instanceof File) {
        totalBytes += entry.size;
        photoCount++;
      }
    }

    return { photoCount, totalBytes };
  } catch {
    return { photoCount: 0, totalBytes: 0 };
  }
}

/**
 * Formats bytes into a human-readable string (KB, MB, GB).
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

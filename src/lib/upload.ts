import { formatSize } from "./utils";

/**
 * Per-file upload ceiling.
 *
 * This is the UploadThing plan's limit, not a limit of this app: the route
 * handler happily issues a presigned URL for anything under its own
 * `maxFileSize`, and the upload then fails at the storage ingest step with
 * nothing useful surfaced. Checking here turns that silent failure into a
 * message before a single byte is sent.
 *
 * Raise both this and `maxFileSize` in the uploadthing route together when
 * the plan allows more.
 */
export const MAX_UPLOAD_BYTES = 16 * 1024 * 1024;

/** Same limit in the string form the uploadthing route config expects. */
export const MAX_UPLOAD_SIZE = "16MB";

export interface UploadRejection {
  title: string;
  message: string;
}

/**
 * Splits files into those we can upload and a message describing the rest.
 */
export function checkUploadSizes(files: File[]): {
  allowed: File[];
  rejection: UploadRejection | null;
} {
  const allowed: File[] = [];
  const tooLarge: File[] = [];

  for (const file of files) {
    (file.size > MAX_UPLOAD_BYTES ? tooLarge : allowed).push(file);
  }

  if (tooLarge.length === 0) return { allowed, rejection: null };

  const names = tooLarge
    .slice(0, 3)
    .map((f) => `${f.name} (${formatSize(f.size)})`)
    .join(", ");
  const rest = tooLarge.length > 3 ? ` and ${tooLarge.length - 3} more` : "";

  return {
    allowed,
    rejection: {
      title: tooLarge.length === 1 ? "File is too large" : "Files are too large",
      message:
        `Uploads are currently limited to ${MAX_UPLOAD_SIZE} per file. ` +
        `Skipped ${names}${rest}.` +
        (allowed.length > 0 ? ` The remaining ${allowed.length} will upload.` : ""),
    },
  };
}

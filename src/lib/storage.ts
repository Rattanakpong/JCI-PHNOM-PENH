import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export class UploadError extends Error {}

// Local-disk stand-in for Supabase Storage, used while running on SQLite.
// Shared by /api/uploads (client-side uploads, e.g. payment proofs) and the
// admin content server actions (file inputs submitted straight through
// FormData). Swap the body for Supabase Storage once configured in
// production — every caller goes through this one function.
export async function saveUploadedFile(file: File, scope: string): Promise<string> {
  if (!/^[a-zA-Z0-9_-]+$/.test(scope)) {
    throw new UploadError("Invalid upload scope");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new UploadError("Unsupported file type");
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError("File too large");
  }

  const extension = file.type.split("/")[1] ?? "bin";
  const filename = `${randomUUID()}.${extension}`;
  const dir = path.join(process.cwd(), "public", "uploads", scope);
  await mkdir(dir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), bytes);

  return `/uploads/${scope}/${filename}`;
}

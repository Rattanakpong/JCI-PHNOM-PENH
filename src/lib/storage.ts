import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/upload-limits";

const ALLOWED_TYPES = new Set(ALLOWED_UPLOAD_TYPES);
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "jci-media";

export class UploadError extends Error {}

// Single place every upload goes through: /api/uploads (client-side uploads,
// e.g. payment proofs) and the admin content server actions (file inputs
// submitted straight through FormData). Stores in Supabase Storage when
// SUPABASE_SERVICE_ROLE_KEY is set, otherwise falls back to local disk under
// /public/uploads.
export async function saveUploadedFile(file: File, scope: string): Promise<string> {
  if (!/^[a-zA-Z0-9_-]+$/.test(scope)) {
    throw new UploadError("Invalid upload scope");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new UploadError("Unsupported file type");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(`File too large (max ${MAX_UPLOAD_MB} MB)`);
  }

  const extension = file.type.split("/")[1] ?? "bin";
  const filename = `${randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createSupabaseServiceRoleClient();
    const objectPath = `${scope}/${filename}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, bytes, { contentType: file.type, cacheControl: "3600", upsert: false });
    if (error) throw error;
    return supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
  }

  const dir = path.join(process.cwd(), "public", "uploads", scope);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);

  return `/uploads/${scope}/${filename}`;
}

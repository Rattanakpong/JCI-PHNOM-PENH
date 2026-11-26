import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/upload-limits";

const ALLOWED_TYPES = new Set(ALLOWED_UPLOAD_TYPES);
const SUPABASE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "jci-media";

export class UploadError extends Error {}

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) return null;

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

// Single place every upload goes through: /api/uploads (admin-only client
// uploads) and the admin content server actions (file inputs submitted
// straight through FormData). Storage backend, in priority order:
// Cloudflare R2 (if R2_* vars are set) → Supabase Storage (if
// SUPABASE_SERVICE_ROLE_KEY is set) → local disk under /public/uploads.
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
  const objectPath = `${scope}/${filename}`;

  const r2 = getR2Client();
  if (r2 && process.env.R2_BUCKET_NAME && process.env.R2_PUBLIC_URL) {
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: objectPath,
        Body: bytes,
        ContentType: file.type,
      })
    );
    return `${process.env.R2_PUBLIC_URL}/${objectPath}`;
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createSupabaseServiceRoleClient();
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(objectPath, bytes, { contentType: file.type, cacheControl: "3600", upsert: false });
    if (error) throw error;
    return supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(objectPath).data.publicUrl;
  }

  const dir = path.join(process.cwd(), "public", "uploads", scope);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);

  return `/uploads/${scope}/${filename}`;
}

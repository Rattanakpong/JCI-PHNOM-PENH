// Shared by the server-side check in src/lib/storage.ts and the client-side
// pre-submit check in src/components/admin/admin-form-feedback.tsx. Keep in
// sync with the `jci-media` bucket's file size / MIME type limits in Supabase.
export const MAX_UPLOAD_MB = 20;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
export const ALLOWED_UPLOAD_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"];

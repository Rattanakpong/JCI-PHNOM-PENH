// Single entry point the UI calls to store a user-uploaded file. Posts to
// /api/uploads, which stores it via saveUploadedFile (src/lib/storage.ts) —
// Supabase Storage when configured, local disk otherwise.
export async function uploadPaymentProof(file: File, registrationId: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("scope", `payment-proofs/${registrationId}`.replace(/\//g, "_"));

  const res = await fetch("/api/uploads", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  return data.url;
}

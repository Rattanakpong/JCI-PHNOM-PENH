// Single entry point the UI calls to store a user-uploaded file. Routes to
// the local-disk /api/uploads endpoint for now; swap the body for
// `uploadPaymentProof` from src/lib/supabase/storage.ts once Supabase
// Storage is configured in production.
export async function uploadPaymentProof(file: File, registrationId: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("scope", `payment-proofs/${registrationId}`.replace(/\//g, "_"));

  const res = await fetch("/api/uploads", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  return data.url;
}

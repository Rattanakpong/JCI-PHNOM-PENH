import { createSupabaseBrowserClient } from "./client";

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "jci-media";

// Uploads a payment screenshot to a private-by-default bucket and returns
// its public URL. Pair this with a Storage RLS policy that only lets
// Super/Board/Event Organizer roles read the `payment-proofs/` prefix.
export async function uploadPaymentProof(file: File, registrationId: string) {
  const supabase = createSupabaseBrowserClient();
  const path = `payment-proofs/${registrationId}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/upload-limits";

// Mounted once in the admin layout. Gives every admin form feedback without
// touching each form: blocks oversized/unsupported files before they're sent, shows
// "Saving…" while a submit is in flight, and "Changes saved" when a server
// action redirects back with ?saved=1.
export function AdminFormFeedback() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const saved = searchParams.get("saved") === "1";
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSaving(false);
  }, [pathname, searchParams]);

  // Don't leave "Saving…" up forever if an action fails without navigating.
  useEffect(() => {
    if (!saving) return;
    const timer = setTimeout(() => setSaving(false), 20000);
    return () => clearTimeout(timer);
  }, [saving]);

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => router.replace(pathname, { scroll: false }), 4000);
    return () => clearTimeout(timer);
  }, [saved, pathname, router]);

  useEffect(() => {
    function onSubmit(e: SubmitEvent) {
      const form = e.target as HTMLFormElement;
      const files = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="file"]')).flatMap((input) =>
        Array.from(input.files ?? [])
      );
      const tooBig = files.find((file) => file.size > MAX_UPLOAD_BYTES);
      const wrongType = files.find((file) => !ALLOWED_UPLOAD_TYPES.includes(file.type));

      if (tooBig || wrongType) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (wrongType) {
          setError(`"${wrongType.name}" isn't a supported file type. Use JPG, PNG, WebP, GIF or PDF (iPhone HEIC photos: export as JPEG first).`);
        } else if (tooBig) {
          const sizeMb = (tooBig.size / 1024 / 1024).toFixed(1);
          setError(`"${tooBig.name}" is ${sizeMb} MB — files must be under ${MAX_UPLOAD_MB} MB. Please resize it and try again.`);
        }
        return;
      }

      setError(null);
      // Delete/toggle forms only carry a hidden id and don't navigate afterwards.
      if (form.querySelector('input:not([type="hidden"]), textarea, select')) setSaving(true);
    }

    // Capture phase so the size check runs before React's action handler.
    document.addEventListener("submit", onSubmit, true);
    return () => document.removeEventListener("submit", onSubmit, true);
  }, []);

  if (!error && !saving && !saved) return null;

  const style = error
    ? "border-red-200 bg-red-50 text-red-700"
    : saving
      ? "border-border bg-surface text-brand-navy"
      : "border-green-200 bg-green-50 text-green-700";

  return (
    <div
      role="status"
      className={`fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-card ${style}`}
    >
      <span className="flex-1">{error ?? (saving ? "Saving…" : "Changes saved")}</span>
      {error && (
        <button type="button" onClick={() => setError(null)} className="font-semibold" aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}

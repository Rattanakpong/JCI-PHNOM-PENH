"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Field {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}

export function InquiryForm({
  endpoint,
  fields,
  submitLabel,
  successMessage,
  title,
}: {
  endpoint: string;
  fields: Field[];
  submitLabel: string;
  successMessage: string;
  title?: string;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Please check your details and try again.");
      setIsSubmitting(false);
      return;
    }

    setDone(true);
    setIsSubmitting(false);
  }

  if (done) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle2 className="h-10 w-10 text-brand-blue" />
          <p className="font-semibold text-brand-navy">{successMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? undefined : "pt-6"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          {fields.map((field) => (
            <div key={field.name} className="space-y-1.5">
              <label htmlFor={field.name} className="text-sm font-medium text-brand-navy">
                {field.label}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                required
                value={values[field.name] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-brand-navy placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
              />
            </div>
          ))}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

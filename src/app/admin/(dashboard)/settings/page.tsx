import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { updateSiteSettings } from "@/lib/actions/site-settings-actions";

const FIELDS: Array<{ key: string; label: string; type?: string; span2?: boolean }> = [
  { key: "contactEmail", label: "Contact email", type: "email" },
  { key: "contactPhone", label: "Contact phone (displayed, e.g. +855 61 759 269)" },
  { key: "contactAddress", label: "Office address", span2: true },
  { key: "contactMapUrl", label: "Map link (Google Maps URL)", span2: true },
  { key: "facebookUrl", label: "Facebook page URL", span2: true },
  { key: "telegramUrl", label: "Telegram group/channel URL", span2: true },
];

export default async function AdminSettingsPage() {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "BOARD_ADMIN"])) notFound();

  const settings = await getSiteSettings();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy">Site Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Contact Info & Social Links</CardTitle>
          <CardDescription>
            Shown on the public Contact page (/contact) — email, phone, address, map link, and
            social links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateSiteSettings} className="grid gap-3 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <label
                key={field.key}
                className={`space-y-1 text-sm text-brand-navy/70 ${field.span2 ? "sm:col-span-2" : ""}`}
              >
                {field.label}
                <input
                  name={field.key}
                  type={field.type ?? "text"}
                  defaultValue={settings[field.key as keyof typeof settings]}
                  className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                />
              </label>
            ))}
            <div className="sm:col-span-2">
              <Button type="submit">Save Settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireContentEditor, logContentChange } from "@/lib/actions/admin-guards";
import { SITE_SETTING_KEYS } from "@/lib/site-settings";

export async function updateSiteSettings(formData: FormData) {
  const actor = await requireContentEditor();

  for (const key of SITE_SETTING_KEYS) {
    const value = String(formData.get(key) ?? "").trim();
    if (!value) continue;
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  await logContentChange(actor.id, "site_settings.update", "SiteSetting", "all");
  revalidatePath("/en/contact");
  revalidatePath("/km/contact");
  revalidatePath("/admin/settings");
}

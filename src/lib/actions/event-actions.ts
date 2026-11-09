"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { toJsonField } from "@/lib/json-field";
import { saveUploadedFile } from "@/lib/storage";
import { requireEventOrganizer, logContentChange } from "@/lib/actions/admin-guards";
import { parseSpeakers, parseAgenda } from "@/lib/actions/event-helpers";

export async function updateEvent(formData: FormData) {
  const actor = await requireEventOrganizer();
  const id = String(formData.get("id") ?? "");
  const event = await prisma.event.findUnique({
    where: { id },
    include: { ticketTiers: { orderBy: { sortOrder: "asc" } } },
  });
  if (!event) throw new Error("Event not found");

  const titleEn = String(formData.get("titleEn") ?? "").trim();
  const descriptionEn = String(formData.get("descriptionEn") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const startAt = String(formData.get("startAt") ?? "");
  const endAt = String(formData.get("endAt") ?? "");
  if (!titleEn || !descriptionEn || !location || !startAt || !endAt) {
    throw new Error("Title, description, location, and schedule are required");
  }

  const mapUrl = String(formData.get("mapUrl") ?? "").trim() || null;
  const telegramGroupUrl = String(formData.get("telegramGroupUrl") ?? "").trim() || null;
  const speakers = parseSpeakers(String(formData.get("speakers") ?? ""));
  const agenda = parseAgenda(String(formData.get("agenda") ?? ""));

  const banner = formData.get("banner");
  const bannerUrl =
    banner instanceof File && banner.size > 0 ? await saveUploadedFile(banner, "events") : event.bannerUrl;

  await prisma.event.update({
    where: { id },
    data: {
      title: toJsonField({ en: titleEn, km: titleEn }),
      description: toJsonField({ en: descriptionEn, km: descriptionEn }),
      location,
      mapUrl,
      bannerUrl,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      telegramGroupUrl,
      speakers: toJsonField(speakers),
      agenda: toJsonField(agenda),
      published: !!formData.get("published"),
    },
  });

  // Tiers follow the same tier1/tier2 convention as createEvent: a filled
  // name updates the tier at that position (creating it if it didn't exist
  // yet), a blank name leaves whatever's already there untouched.
  for (const [i, prefix] of ["tier1", "tier2"].entries()) {
    const name = String(formData.get(`${prefix}Name`) ?? "").trim();
    if (!name) continue;
    const priceUsd = Number(formData.get(`${prefix}Price`) ?? 0) || 0;
    const capacity = Number(formData.get(`${prefix}Capacity`) ?? 0) || 0;
    const saleEndsAtRaw = String(formData.get(`${prefix}SaleEndsAt`) ?? "").trim();
    const saleEndsAt = saleEndsAtRaw ? new Date(saleEndsAtRaw) : null;
    const tierData = { name: toJsonField({ en: name, km: name }), priceUsd, capacity, saleEndsAt, sortOrder: i };

    const existingTier = event.ticketTiers[i];
    if (existingTier) {
      await prisma.ticketTier.update({ where: { id: existingTier.id }, data: tierData });
    } else {
      await prisma.ticketTier.create({ data: { ...tierData, eventId: id } });
    }
  }

  await logContentChange(actor.id, "event.update", "Event", id);
  revalidatePath("/en/events");
  revalidatePath("/km/events");
  revalidatePath(`/en/events/${event.slug}`);
  revalidatePath(`/km/events/${event.slug}`);
  revalidatePath("/admin/events");
}

export async function deleteEvent(formData: FormData) {
  const actor = await requireEventOrganizer();
  const id = String(formData.get("id") ?? "");

  await prisma.event.delete({ where: { id } }); // tiers + registrations cascade

  await logContentChange(actor.id, "event.delete", "Event", id);
  revalidatePath("/en/events");
  revalidatePath("/km/events");
  revalidatePath("/admin/events");
}

export async function toggleEventPublished(formData: FormData) {
  const actor = await requireEventOrganizer();
  const id = String(formData.get("id") ?? "");
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new Error("Event not found");

  await prisma.event.update({ where: { id }, data: { published: !event.published } });

  await logContentChange(actor.id, "event.toggle_published", "Event", id);
  revalidatePath("/en/events");
  revalidatePath("/km/events");
  revalidatePath("/admin/events");
}

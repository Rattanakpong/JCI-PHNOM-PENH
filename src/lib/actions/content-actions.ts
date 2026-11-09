"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { toJsonField, parseStringArray } from "@/lib/json-field";
import { saveUploadedFile } from "@/lib/storage";
import { ProjectPillar } from "@/lib/enums";
import { requireContentEditor, requireEventOrganizer, logContentChange } from "@/lib/actions/admin-guards";
import { parseSpeakers, parseAgenda } from "@/lib/actions/event-helpers";

export async function updateImpactStats(formData: FormData) {
  const actor = await requireContentEditor();
  const keys = ["members", "projects", "events", "beneficiaries"] as const;

  for (const key of keys) {
    const value = Number(formData.get(key));
    if (Number.isFinite(value)) {
      await prisma.impactStat.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
  }

  await logContentChange(actor.id, "impact_stats.update", "ImpactStat", "all");
  revalidatePath("/en");
  revalidatePath("/km");
  revalidatePath("/admin/content");
}

export async function createNewsPost(formData: FormData) {
  const actor = await requireContentEditor();
  const titleEn = String(formData.get("titleEn") ?? "").trim();
  const bodyEn = String(formData.get("bodyEn") ?? "").trim();
  if (!titleEn || !bodyEn) throw new Error("Title and body are required");

  const slug = `${titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}-${Date.now()}`;

  const coverImage = formData.get("coverImage");
  const coverUrl =
    coverImage instanceof File && coverImage.size > 0 ? await saveUploadedFile(coverImage, "news") : null;
  const coverCaption = String(formData.get("coverCaption") ?? "").trim() || null;

  const post = await prisma.newsPost.create({
    data: {
      slug,
      title: toJsonField({ en: titleEn, km: titleEn }),
      body: toJsonField({ en: bodyEn, km: bodyEn }),
      coverUrl,
      coverCaption,
      publishedAt: formData.get("published") ? new Date() : null,
    },
  });

  await logContentChange(actor.id, "news_post.create", "NewsPost", post.id);
  revalidatePath("/en/news");
  revalidatePath("/km/news");
  revalidatePath("/admin/content");
}

// Gallery photos for an article — supports any number of uploads (10+ is
// fine, the file input has no cap). Captions are entered one per line,
// matching the order files were selected in, same convention as the event
// speakers/agenda inputs.
export async function addNewsPhotos(formData: FormData) {
  const actor = await requireContentEditor();
  const newsPostId = String(formData.get("newsPostId") ?? "").trim();
  if (!newsPostId) throw new Error("News post is required");

  const post = await prisma.newsPost.findUnique({ where: { id: newsPostId } });
  if (!post) throw new Error("News post not found");

  const photoFiles = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (photoFiles.length === 0) throw new Error("At least one photo is required");

  const captions = String(formData.get("captions") ?? "").split("\n").map((c) => c.trim());

  const existingCount = await prisma.newsPhoto.count({ where: { newsPostId } });
  const urls = await Promise.all(photoFiles.map((f) => saveUploadedFile(f, "news")));

  await prisma.newsPhoto.createMany({
    data: urls.map((url, i) => ({
      newsPostId,
      url,
      caption: captions[i] || null,
      sortOrder: existingCount + i,
    })),
  });

  await logContentChange(actor.id, "news_post.add_photos", "NewsPost", newsPostId);
  revalidatePath("/en/news");
  revalidatePath("/km/news");
  revalidatePath(`/en/news/${post.slug}`);
  revalidatePath(`/km/news/${post.slug}`);
  revalidatePath("/admin/content");
}

export async function createProject(formData: FormData) {
  const actor = await requireContentEditor();
  const titleEn = String(formData.get("titleEn") ?? "").trim();
  const summaryEn = String(formData.get("summaryEn") ?? "").trim();
  if (!titleEn || !summaryEn) throw new Error("Title and summary are required");

  const slug = `${titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}-${Date.now()}`;

  const logoFiles = formData.getAll("partnerLogos").filter((f): f is File => f instanceof File && f.size > 0);
  const partnerLogos = await Promise.all(logoFiles.map((f) => saveUploadedFile(f, "partners")));

  const reportFile = formData.get("impactReport");
  const impactReportUrl =
    reportFile instanceof File && reportFile.size > 0 ? await saveUploadedFile(reportFile, "reports") : null;

  const pillarInput = String(formData.get("pillar") ?? "");
  const pillar = (Object.values(ProjectPillar) as string[]).includes(pillarInput)
    ? pillarInput
    : ProjectPillar.COMMUNITY_IMPACT;

  const project = await prisma.project.create({
    data: {
      slug,
      title: toJsonField({ en: titleEn, km: titleEn }),
      summary: toJsonField({ en: summaryEn, km: summaryEn }),
      pillar,
      partnerLogos: toJsonField(partnerLogos),
      impactReportUrl,
    },
  });

  await logContentChange(actor.id, "project.create", "Project", project.id);
  revalidatePath("/en/projects");
  revalidatePath("/km/projects");
  revalidatePath("/admin/content");
}

export async function addProjectPhotos(formData: FormData) {
  const actor = await requireContentEditor();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const year = Number(formData.get("year") ?? 0);
  if (!projectId || !year) throw new Error("Project and year are required");

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Project not found");

  const photoFiles = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (photoFiles.length === 0) throw new Error("At least one photo is required");

  const existingCount = await prisma.projectPhoto.count({ where: { projectId, year } });
  const urls = await Promise.all(photoFiles.map((f) => saveUploadedFile(f, "projects")));

  await prisma.projectPhoto.createMany({
    data: urls.map((url, i) => ({
      projectId,
      year,
      url,
      sortOrder: existingCount + i,
    })),
  });

  await logContentChange(actor.id, "project.add_photos", "Project", projectId);
  revalidatePath("/en/projects");
  revalidatePath("/km/projects");
  revalidatePath(`/en/projects/${project.slug}`);
  revalidatePath(`/km/projects/${project.slug}`);
  revalidatePath("/admin/content");
}

export async function createEvent(formData: FormData) {
  const actor = await requireEventOrganizer();
  const titleEn = String(formData.get("titleEn") ?? "").trim();
  const descriptionEn = String(formData.get("descriptionEn") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const startAt = String(formData.get("startAt") ?? "");
  const endAt = String(formData.get("endAt") ?? "");
  if (!titleEn || !descriptionEn || !location || !startAt || !endAt) {
    throw new Error("Title, description, location, and schedule are required");
  }

  const slug = `${titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}-${Date.now()}`;
  const mapUrl = String(formData.get("mapUrl") ?? "").trim() || null;
  const telegramGroupUrl = String(formData.get("telegramGroupUrl") ?? "").trim() || null;
  const speakers = parseSpeakers(String(formData.get("speakers") ?? ""));
  const agenda = parseAgenda(String(formData.get("agenda") ?? ""));

  const banner = formData.get("banner");
  const bannerUrl = banner instanceof File && banner.size > 0 ? await saveUploadedFile(banner, "events") : null;

  const tiers: { name: string; priceUsd: number; capacity: number; saleEndsAt: Date | null; sortOrder: number }[] = [];
  for (const [i, prefix] of ["tier1", "tier2"].entries()) {
    const name = String(formData.get(`${prefix}Name`) ?? "").trim();
    if (!name) continue;
    const priceUsd = Number(formData.get(`${prefix}Price`) ?? 0) || 0;
    const capacity = Number(formData.get(`${prefix}Capacity`) ?? 0) || 0;
    const saleEndsAtRaw = String(formData.get(`${prefix}SaleEndsAt`) ?? "").trim();
    const saleEndsAt = saleEndsAtRaw ? new Date(saleEndsAtRaw) : null;
    tiers.push({ name: toJsonField({ en: name, km: name }), priceUsd, capacity, saleEndsAt, sortOrder: i });
  }
  if (tiers.length === 0) throw new Error("At least one ticket tier is required");

  const event = await prisma.event.create({
    data: {
      slug,
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
      organizerId: actor.id,
      ticketTiers: { create: tiers },
    },
  });

  await logContentChange(actor.id, "event.create", "Event", event.id);
  revalidatePath("/en/events");
  revalidatePath("/km/events");
  revalidatePath("/admin/events");
}

export async function createSlide(formData: FormData) {
  const actor = await requireContentEditor();
  const titleEn = String(formData.get("titleEn") ?? "").trim();
  const descriptionEn = String(formData.get("descriptionEn") ?? "").trim();
  if (!titleEn) throw new Error("Title is required");

  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) throw new Error("Image is required");
  const imageUrl = await saveUploadedFile(image, "slides");

  const linkUrl = String(formData.get("linkUrl") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "NEWS");
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;

  const slide = await prisma.slide.create({
    data: {
      title: toJsonField({ en: titleEn, km: titleEn }),
      description: descriptionEn ? toJsonField({ en: descriptionEn, km: descriptionEn }) : null,
      imageUrl,
      linkUrl,
      category,
      sortOrder,
      isActive: !!formData.get("isActive"),
    },
  });

  await logContentChange(actor.id, "slide.create", "Slide", slide.id);
  revalidatePath("/en");
  revalidatePath("/km");
  revalidatePath("/admin/content");
}

export async function toggleSlideActive(formData: FormData) {
  const actor = await requireContentEditor();
  const id = String(formData.get("id") ?? "");
  const slide = await prisma.slide.findUnique({ where: { id } });
  if (!slide) throw new Error("Slide not found");

  await prisma.slide.update({ where: { id }, data: { isActive: !slide.isActive } });

  await logContentChange(actor.id, "slide.toggle_active", "Slide", id);
  revalidatePath("/en");
  revalidatePath("/km");
  revalidatePath("/admin/content");
}

export async function createBoardMember(formData: FormData) {
  const actor = await requireContentEditor();
  const name = String(formData.get("name") ?? "").trim();
  const titleEn = String(formData.get("titleEn") ?? "").trim();
  if (!name || !titleEn) throw new Error("Name and title are required");

  const committee = String(formData.get("committee") ?? "").trim();
  const photo = formData.get("photo");
  const photoUrl = photo instanceof File && photo.size > 0 ? await saveUploadedFile(photo, "board") : null;

  const member = await prisma.boardMember.create({
    data: {
      name,
      title: toJsonField({ en: titleEn, km: titleEn }),
      committee: committee || null,
      photoUrl,
      sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
    },
  });

  await logContentChange(actor.id, "board_member.create", "BoardMember", member.id);
  revalidatePath("/en/about");
  revalidatePath("/km/about");
  revalidatePath("/admin/content");
}

export async function createMember(formData: FormData) {
  const actor = await requireContentEditor();
  const name = String(formData.get("name") ?? "").trim();
  const joinYear = Number(formData.get("joinYear") ?? 0);
  if (!name || !joinYear) throw new Error("Name and join year are required");

  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}-${Date.now()}`;

  const jobTitleEn = String(formData.get("jobTitleEn") ?? "").trim();
  const bioEn = String(formData.get("bioEn") ?? "").trim();
  const jciExperienceEn = String(formData.get("jciExperienceEn") ?? "").trim();
  const businessName = String(formData.get("businessName") ?? "").trim() || null;
  const industry = String(formData.get("industry") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const socialUrl = String(formData.get("socialUrl") ?? "").trim() || null;

  const photo = formData.get("photo");
  const photoUrl = photo instanceof File && photo.size > 0 ? await saveUploadedFile(photo, "members") : null;

  const member = await prisma.member.create({
    data: {
      slug,
      name,
      photoUrl,
      businessName,
      jobTitle: jobTitleEn ? toJsonField({ en: jobTitleEn, km: jobTitleEn }) : null,
      industry,
      bio: bioEn ? toJsonField({ en: bioEn, km: bioEn }) : null,
      jciExperience: jciExperienceEn ? toJsonField({ en: jciExperienceEn, km: jciExperienceEn }) : null,
      email,
      phone,
      socialUrl,
      joinYear,
    },
  });

  await logContentChange(actor.id, "member.create", "Member", member.id);
  revalidatePath("/en/members");
  revalidatePath("/km/members");
  revalidatePath("/admin/content");
}

// ---------------------------------------------------------------------------
// Edit / delete — same auth + audit-log + revalidate shape as the create
// actions above. File inputs are optional on every edit form: an empty
// (size === 0) file means "keep the existing upload".
// ---------------------------------------------------------------------------

export async function updateSlide(formData: FormData) {
  const actor = await requireContentEditor();
  const id = String(formData.get("id") ?? "");
  const slide = await prisma.slide.findUnique({ where: { id } });
  if (!slide) throw new Error("Slide not found");

  const titleEn = String(formData.get("titleEn") ?? "").trim();
  const descriptionEn = String(formData.get("descriptionEn") ?? "").trim();
  if (!titleEn) throw new Error("Title is required");

  const image = formData.get("image");
  const imageUrl =
    image instanceof File && image.size > 0 ? await saveUploadedFile(image, "slides") : slide.imageUrl;

  const linkUrl = String(formData.get("linkUrl") ?? "").trim() || null;
  const category = String(formData.get("category") ?? slide.category);
  const sortOrder = Number(formData.get("sortOrder") ?? slide.sortOrder) || 0;

  await prisma.slide.update({
    where: { id },
    data: {
      title: toJsonField({ en: titleEn, km: titleEn }),
      description: descriptionEn ? toJsonField({ en: descriptionEn, km: descriptionEn }) : null,
      imageUrl,
      linkUrl,
      category,
      sortOrder,
      isActive: !!formData.get("isActive"),
    },
  });

  await logContentChange(actor.id, "slide.update", "Slide", id);
  revalidatePath("/en");
  revalidatePath("/km");
  revalidatePath("/admin/content/homepage");
}

export async function deleteSlide(formData: FormData) {
  const actor = await requireContentEditor();
  const id = String(formData.get("id") ?? "");

  await prisma.slide.delete({ where: { id } });

  await logContentChange(actor.id, "slide.delete", "Slide", id);
  revalidatePath("/en");
  revalidatePath("/km");
  revalidatePath("/admin/content/homepage");
}

export async function updateNewsPost(formData: FormData) {
  const actor = await requireContentEditor();
  const id = String(formData.get("id") ?? "");
  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) throw new Error("News post not found");

  const titleEn = String(formData.get("titleEn") ?? "").trim();
  const bodyEn = String(formData.get("bodyEn") ?? "").trim();
  if (!titleEn || !bodyEn) throw new Error("Title and body are required");

  const coverImage = formData.get("coverImage");
  const coverUrl =
    coverImage instanceof File && coverImage.size > 0 ? await saveUploadedFile(coverImage, "news") : post.coverUrl;
  const coverCaption = String(formData.get("coverCaption") ?? "").trim() || null;

  const published = !!formData.get("published");
  const publishedAt = published ? post.publishedAt ?? new Date() : null;

  await prisma.newsPost.update({
    where: { id },
    data: {
      title: toJsonField({ en: titleEn, km: titleEn }),
      body: toJsonField({ en: bodyEn, km: bodyEn }),
      coverUrl,
      coverCaption,
      publishedAt,
    },
  });

  await logContentChange(actor.id, "news_post.update", "NewsPost", id);
  revalidatePath("/en/news");
  revalidatePath("/km/news");
  revalidatePath(`/en/news/${post.slug}`);
  revalidatePath(`/km/news/${post.slug}`);
  revalidatePath("/admin/content/news");
}

export async function toggleNewsPostPublished(formData: FormData) {
  const actor = await requireContentEditor();
  const id = String(formData.get("id") ?? "");
  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) throw new Error("News post not found");

  await prisma.newsPost.update({
    where: { id },
    data: { publishedAt: post.publishedAt ? null : new Date() },
  });

  await logContentChange(actor.id, "news_post.toggle_published", "NewsPost", id);
  revalidatePath("/en/news");
  revalidatePath("/km/news");
  revalidatePath(`/en/news/${post.slug}`);
  revalidatePath(`/km/news/${post.slug}`);
  revalidatePath("/admin/content/news");
}

export async function deleteNewsPost(formData: FormData) {
  const actor = await requireContentEditor();
  const id = String(formData.get("id") ?? "");
  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) throw new Error("News post not found");

  await prisma.newsPost.delete({ where: { id } }); // photos cascade

  await logContentChange(actor.id, "news_post.delete", "NewsPost", id);
  revalidatePath("/en/news");
  revalidatePath("/km/news");
  revalidatePath("/admin/content/news");
}

export async function deleteNewsPhoto(formData: FormData) {
  const actor = await requireContentEditor();
  const id = String(formData.get("id") ?? "");
  const photo = await prisma.newsPhoto.findUnique({ where: { id }, include: { newsPost: true } });
  if (!photo) throw new Error("Photo not found");

  await prisma.newsPhoto.delete({ where: { id } });

  await logContentChange(actor.id, "news_post.delete_photo", "NewsPost", photo.newsPostId);
  revalidatePath("/en/news");
  revalidatePath("/km/news");
  revalidatePath(`/en/news/${photo.newsPost.slug}`);
  revalidatePath(`/km/news/${photo.newsPost.slug}`);
  revalidatePath("/admin/content/news");
}

export async function updateProject(formData: FormData) {
  const actor = await requireContentEditor();
  const id = String(formData.get("id") ?? "");
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new Error("Project not found");

  const titleEn = String(formData.get("titleEn") ?? "").trim();
  const summaryEn = String(formData.get("summaryEn") ?? "").trim();
  if (!titleEn || !summaryEn) throw new Error("Title and summary are required");

  const logoFiles = formData.getAll("partnerLogos").filter((f): f is File => f instanceof File && f.size > 0);
  const newLogos = await Promise.all(logoFiles.map((f) => saveUploadedFile(f, "partners")));
  const partnerLogos = [...parseStringArray(project.partnerLogos), ...newLogos];

  const reportFile = formData.get("impactReport");
  const impactReportUrl =
    reportFile instanceof File && reportFile.size > 0
      ? await saveUploadedFile(reportFile, "reports")
      : project.impactReportUrl;

  const pillarInput = String(formData.get("pillar") ?? "");
  const pillar = (Object.values(ProjectPillar) as string[]).includes(pillarInput)
    ? pillarInput
    : project.pillar;

  await prisma.project.update({
    where: { id },
    data: {
      title: toJsonField({ en: titleEn, km: titleEn }),
      summary: toJsonField({ en: summaryEn, km: summaryEn }),
      pillar,
      partnerLogos: toJsonField(partnerLogos),
      impactReportUrl,
    },
  });

  await logContentChange(actor.id, "project.update", "Project", id);
  revalidatePath("/en/projects");
  revalidatePath("/km/projects");
  revalidatePath(`/en/projects/${project.slug}`);
  revalidatePath(`/km/projects/${project.slug}`);
  revalidatePath("/admin/content/projects");
}

export async function deleteProject(formData: FormData) {
  const actor = await requireContentEditor();
  const id = String(formData.get("id") ?? "");

  await prisma.project.delete({ where: { id } }); // photos cascade

  await logContentChange(actor.id, "project.delete", "Project", id);
  revalidatePath("/en/projects");
  revalidatePath("/km/projects");
  revalidatePath("/admin/content/projects");
}

export async function deleteProjectPhoto(formData: FormData) {
  const actor = await requireContentEditor();
  const id = String(formData.get("id") ?? "");
  const photo = await prisma.projectPhoto.findUnique({ where: { id }, include: { project: true } });
  if (!photo) throw new Error("Photo not found");

  await prisma.projectPhoto.delete({ where: { id } });

  await logContentChange(actor.id, "project.delete_photo", "Project", photo.projectId);
  revalidatePath("/en/projects");
  revalidatePath("/km/projects");
  revalidatePath(`/en/projects/${photo.project.slug}`);
  revalidatePath(`/km/projects/${photo.project.slug}`);
  revalidatePath("/admin/content/projects");
}

export async function updateBoardMember(formData: FormData) {
  const actor = await requireContentEditor();
  const id = String(formData.get("id") ?? "");
  const member = await prisma.boardMember.findUnique({ where: { id } });
  if (!member) throw new Error("Board member not found");

  const name = String(formData.get("name") ?? "").trim();
  const titleEn = String(formData.get("titleEn") ?? "").trim();
  if (!name || !titleEn) throw new Error("Name and title are required");

  const committee = String(formData.get("committee") ?? "").trim();
  const photo = formData.get("photo");
  const photoUrl =
    photo instanceof File && photo.size > 0 ? await saveUploadedFile(photo, "board") : member.photoUrl;

  await prisma.boardMember.update({
    where: { id },
    data: {
      name,
      title: toJsonField({ en: titleEn, km: titleEn }),
      committee: committee || null,
      photoUrl,
      sortOrder: Number(formData.get("sortOrder") ?? member.sortOrder) || 0,
    },
  });

  await logContentChange(actor.id, "board_member.update", "BoardMember", id);
  revalidatePath("/en/about");
  revalidatePath("/km/about");
  revalidatePath("/admin/content/people");
}

export async function deleteBoardMember(formData: FormData) {
  const actor = await requireContentEditor();
  const id = String(formData.get("id") ?? "");

  await prisma.boardMember.delete({ where: { id } });

  await logContentChange(actor.id, "board_member.delete", "BoardMember", id);
  revalidatePath("/en/about");
  revalidatePath("/km/about");
  revalidatePath("/admin/content/people");
}

export async function updateMember(formData: FormData) {
  const actor = await requireContentEditor();
  const id = String(formData.get("id") ?? "");
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) throw new Error("Member not found");

  const name = String(formData.get("name") ?? "").trim();
  const joinYear = Number(formData.get("joinYear") ?? 0);
  if (!name || !joinYear) throw new Error("Name and join year are required");

  const jobTitleEn = String(formData.get("jobTitleEn") ?? "").trim();
  const bioEn = String(formData.get("bioEn") ?? "").trim();
  const jciExperienceEn = String(formData.get("jciExperienceEn") ?? "").trim();
  const businessName = String(formData.get("businessName") ?? "").trim() || null;
  const industry = String(formData.get("industry") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const socialUrl = String(formData.get("socialUrl") ?? "").trim() || null;

  const photo = formData.get("photo");
  const photoUrl =
    photo instanceof File && photo.size > 0 ? await saveUploadedFile(photo, "members") : member.photoUrl;

  await prisma.member.update({
    where: { id },
    data: {
      name,
      photoUrl,
      businessName,
      jobTitle: jobTitleEn ? toJsonField({ en: jobTitleEn, km: jobTitleEn }) : null,
      industry,
      bio: bioEn ? toJsonField({ en: bioEn, km: bioEn }) : null,
      jciExperience: jciExperienceEn ? toJsonField({ en: jciExperienceEn, km: jciExperienceEn }) : null,
      email,
      phone,
      socialUrl,
      joinYear,
    },
  });

  await logContentChange(actor.id, "member.update", "Member", id);
  revalidatePath("/en/members");
  revalidatePath("/km/members");
  revalidatePath(`/en/members/${member.slug}`);
  revalidatePath(`/km/members/${member.slug}`);
  revalidatePath("/admin/content/people");
}

export async function deleteMember(formData: FormData) {
  const actor = await requireContentEditor();
  const id = String(formData.get("id") ?? "");

  await prisma.member.delete({ where: { id } });

  await logContentChange(actor.id, "member.delete", "Member", id);
  revalidatePath("/en/members");
  revalidatePath("/km/members");
  revalidatePath("/admin/content/people");
}

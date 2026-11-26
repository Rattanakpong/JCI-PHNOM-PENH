import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { getOrgStructureImageUrl } from "@/lib/site-settings";
import {
  updateOrgStructureImage,
  removeOrgStructureImage,
  createMember,
  deleteMember,
  createPastPresident,
  deletePastPresident,
  createPartner,
  togglePartnerActive,
  deletePartner,
} from "@/lib/actions/content-actions";

export default async function AdminPeoplePage() {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "ADMIN"])) notFound();

  const [president, directoryMembers, orgStructureImageUrl, pastPresidents, partners] = await Promise.all([
    prisma.boardMember.findFirst({ orderBy: { sortOrder: "asc" } }),
    prisma.member.findMany({ orderBy: { name: "asc" } }),
    getOrgStructureImageUrl(),
    prisma.pastPresident.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.partner.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-brand-navy">People</h1>

      <Card>
        <CardHeader>
          <CardTitle>Organization Structure</CardTitle>
          <CardDescription>
            One image shown in the Organizational Structure section of /about. Use a Facebook-cover-sized
            image (1640 × 624 px, or at least 851 × 315 px). It scales to fit desktop, tablet, and mobile screens
            and is never cropped.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orgStructureImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded file
            <img
              src={orgStructureImageUrl}
              alt="Current organization structure"
              className="h-auto w-full rounded-xl border border-border"
            />
          ) : (
            <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-brand-navy/50">
              No organization structure image uploaded yet.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <form action={updateOrgStructureImage} encType="multipart/form-data" className="flex flex-wrap items-center gap-3">
              <input name="image" type="file" accept="image/*" required className="text-sm" />
              <Button type="submit" size="sm">
                {orgStructureImageUrl ? "Replace Image" : "Upload Image"}
              </Button>
            </form>
            {orgStructureImageUrl && (
              <ConfirmDeleteForm
                action={removeOrgStructureImage}
                id="org-structure"
                label="Remove"
                confirmMessage="Remove the organization structure image from the About page?"
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Leader Message</CardTitle>
          <CardDescription>
            The Local President shown with the leader message on the homepage. Click Edit to change
            the name, title, photo, or the quote itself.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {president ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm">
              <div>
                <span className="font-medium text-brand-navy">{president.name}</span>
                <span className="ml-2 text-brand-navy/60">{parseLocalizedText(president.title).en}</span>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/admin/content/people/board/${president.id}/edit`}>Edit</Link>
              </Button>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-brand-navy/50">No Local President set.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5">
              <CardTitle>Members Directory</CardTitle>
              <CardDescription>
                The general membership list shown at /members, separate from the organization structure above.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/api/admin/members/export?format=xlsx">Export .xlsx</a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/api/admin/members/export?format=csv">Export .csv</a>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={createMember} encType="multipart/form-data" className="grid gap-3 sm:grid-cols-3">
            <input
              name="name"
              placeholder="Name"
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="joinYear"
              type="number"
              placeholder="Join year (e.g. 2022)"
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="industry"
              placeholder="Industry (e.g. Finance)"
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="businessName"
              placeholder="Business / company name"
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="jobTitleEn"
              placeholder="Job title (e.g. Managing Director)"
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="email"
              type="email"
              placeholder="Email (optional, public)"
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="phone"
              placeholder="Phone (optional, public)"
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="socialUrl"
              placeholder="Social / website link (optional)"
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <label className="flex h-10 items-center gap-2 text-sm text-brand-navy/70">
              Photo
              <input name="photo" type="file" accept="image/*" className="text-sm" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-brand-navy sm:col-span-3">
              Short bio (optional)
              <textarea name="bioEn" rows={2} className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-normal text-brand-navy" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-brand-navy sm:col-span-3">
              JCI experience (optional)
                <span className="text-xs font-normal text-brand-navy/60">
                  One role per line. Start with a year to show it on the timeline, e.g. &quot;2024 – Vice President&quot;.
                  &quot;Joined JCI Phnom Penh&quot; is added automatically from the join year.
                </span>
              <textarea
                name="jciExperienceEn"
                placeholder={"2024 – Vice President\n2023 – Project Director, Sharing of Smile"}
                rows={4}
                className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-normal text-brand-navy"
              />
            </label>
            <div className="sm:col-span-3">
              <Button type="submit" size="sm">Add Member</Button>
            </div>
          </form>

          <ul className="space-y-2">
            {directoryMembers.map((member) => (
              <li key={member.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm">
                <div>
                  <span className="font-medium text-brand-navy">{member.name}</span>
                  <span className="ml-2 text-brand-navy/60">
                    {member.businessName ?? "—"} · {member.joinYear}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/content/people/members/${member.id}/edit`}>Edit</Link>
                  </Button>
                  <ConfirmDeleteForm
                    action={deleteMember}
                    id={member.id}
                    confirmMessage={`Remove "${member.name}" from the members directory?`}
                  />
                </div>
              </li>
            ))}
            {directoryMembers.length === 0 && (
              <p className="py-4 text-center text-sm text-brand-navy/50">No directory members yet.</p>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past Presidents</CardTitle>
          <CardDescription>
            Photo wall shown on /about, directly above Partners &amp; Sponsors. Leave photo empty to
            show a placeholder until a real photo is uploaded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={createPastPresident} encType="multipart/form-data" className="grid gap-3 sm:grid-cols-2">
            <input
              name="name"
              placeholder="Name"
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              name="year"
              placeholder="Year (e.g. 2019 or 2019–2020)"
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="sortOrder"
              type="number"
              placeholder="Sort order (oldest first)"
              defaultValue={pastPresidents.length}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-brand-navy/70 sm:col-span-2">
              Photo (optional)
              <input name="photo" type="file" accept="image/*" className="text-sm" />
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" size="sm">Add Past President</Button>
            </div>
          </form>

          <ul className="space-y-2">
            {pastPresidents.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 text-sm">
                <div className="flex items-center gap-3">
                  {p.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded file
                    <img src={p.photoUrl} alt={p.name} className="h-10 w-10 rounded-full border border-border object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full border border-dashed border-border" />
                  )}
                  <div>
                    <span className="font-medium text-brand-navy">{p.name}</span>
                    <span className="ml-2 text-brand-navy/60">{p.year}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/content/people/past-presidents/${p.id}/edit`}>Edit</Link>
                  </Button>
                  <ConfirmDeleteForm
                    action={deletePastPresident}
                    id={p.id}
                    confirmMessage={`Remove "${p.name}" from the Past Presidents wall?`}
                  />
                </div>
              </li>
            ))}
            {pastPresidents.length === 0 && (
              <p className="py-4 text-center text-sm text-brand-navy/50">No past presidents added yet.</p>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partners & Sponsors</CardTitle>
          <CardDescription>
            Logo wall shown on /about directly below Past Presidents. Hidden partners stay saved but
            don&apos;t appear on the public page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={createPartner} encType="multipart/form-data" className="grid gap-3 sm:grid-cols-2">
            <input
              name="name"
              placeholder="Partner / sponsor name"
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              name="websiteUrl"
              placeholder="Website link (optional)"
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              name="sortOrder"
              type="number"
              placeholder="Sort order"
              defaultValue={partners.length}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              Logo
              <input name="logo" type="file" accept="image/*" required className="text-sm" />
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              <input type="checkbox" name="isActive" defaultChecked />
              Active
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" size="sm">Add Partner</Button>
            </div>
          </form>

          <ul className="space-y-2">
            {partners.map((partner) => (
              <li key={partner.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 text-sm">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded file */}
                  <img src={partner.logoUrl} alt={partner.name} className="h-10 w-10 rounded-lg border border-border object-contain" />
                  <span className="font-medium text-brand-navy">{partner.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={partner.isActive ? "success" : "outline"}>
                    {partner.isActive ? "Active" : "Hidden"}
                  </Badge>
                  <form action={togglePartnerActive}>
                    <input type="hidden" name="id" value={partner.id} />
                    <Button type="submit" size="sm" variant="outline">
                      {partner.isActive ? "Hide" : "Show"}
                    </Button>
                  </form>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/content/people/partners/${partner.id}/edit`}>Edit</Link>
                  </Button>
                  <ConfirmDeleteForm
                    action={deletePartner}
                    id={partner.id}
                    confirmMessage={`Delete "${partner.name}" from the partners & sponsors list? This cannot be undone.`}
                  />
                </div>
              </li>
            ))}
            {partners.length === 0 && (
              <p className="py-4 text-center text-sm text-brand-navy/50">No partners or sponsors yet.</p>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { updateMember } from "@/lib/actions/content-actions";

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "BOARD_ADMIN"])) notFound();

  const { id } = await params;
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) notFound();

  const jobTitle = member.jobTitle ? parseLocalizedText(member.jobTitle) : null;
  const bio = member.bio ? parseLocalizedText(member.bio) : null;
  const jciExperience = member.jciExperience ? parseLocalizedText(member.jciExperience) : null;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy">Edit Member</h1>

      <Card>
        <CardHeader>
          <CardTitle>{member.name}</CardTitle>
          <CardDescription>Leave the photo field empty to keep the current photo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateMember} encType="multipart/form-data" className="grid gap-3 sm:grid-cols-3">
            <input type="hidden" name="id" value={member.id} />
            <input
              name="name"
              placeholder="Name"
              defaultValue={member.name}
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="joinYear"
              type="number"
              placeholder="Join year (e.g. 2022)"
              defaultValue={member.joinYear}
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="industry"
              placeholder="Industry (e.g. Finance)"
              defaultValue={member.industry ?? ""}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="businessName"
              placeholder="Business / company name"
              defaultValue={member.businessName ?? ""}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="jobTitleEn"
              placeholder="Job title (e.g. Managing Director)"
              defaultValue={jobTitle?.en ?? ""}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="email"
              type="email"
              placeholder="Email (optional, public)"
              defaultValue={member.email ?? ""}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="phone"
              placeholder="Phone (optional, public)"
              defaultValue={member.phone ?? ""}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="socialUrl"
              placeholder="Social / website link (optional)"
              defaultValue={member.socialUrl ?? ""}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <label className="flex h-10 items-center gap-2 text-sm text-brand-navy/70">
              Replace photo (optional)
              <input name="photo" type="file" accept="image/*" className="text-sm" />
            </label>
            <textarea
              name="bioEn"
              placeholder="Short bio (optional)"
              defaultValue={bio?.en ?? ""}
              rows={2}
              className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-3"
            />
            <textarea
              name="jciExperienceEn"
              placeholder="JCI experience (optional)"
              defaultValue={jciExperience?.en ?? ""}
              rows={2}
              className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-3"
            />
            <div className="flex gap-2 sm:col-span-3">
              <Button type="submit" size="sm">Save Changes</Button>
              <Button type="button" size="sm" variant="outline" asChild>
                <a href="/admin/content/people">Cancel</a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

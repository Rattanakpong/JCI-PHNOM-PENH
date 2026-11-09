import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import {
  createBoardMember,
  deleteBoardMember,
  createMember,
  deleteMember,
} from "@/lib/actions/content-actions";

export default async function AdminPeoplePage() {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "BOARD_ADMIN"])) notFound();

  const [boardMembers, directoryMembers] = await Promise.all([
    prisma.boardMember.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.member.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-brand-navy">People</h1>

      <Card>
        <CardHeader>
          <CardTitle>Board Roster</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={createBoardMember} encType="multipart/form-data" className="grid gap-3 sm:grid-cols-3">
            <input
              name="name"
              placeholder="Name"
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="titleEn"
              placeholder="Title (e.g. VP of Projects)"
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="sortOrder"
              type="number"
              placeholder="Sort order"
              defaultValue={boardMembers.length}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="committee"
              placeholder="Committee (blank = Executive Board)"
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <label className="flex h-10 items-center gap-2 text-sm text-brand-navy/70 sm:col-span-2">
              Photo
              <input name="photo" type="file" accept="image/*" className="text-sm" />
            </label>
            <div className="sm:col-span-3">
              <Button type="submit" size="sm">Add Board Member</Button>
            </div>
          </form>

          <ul className="space-y-2">
            {boardMembers.map((member) => {
              const title = parseLocalizedText(member.title);
              return (
                <li key={member.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm">
                  <div>
                    <span className="font-medium text-brand-navy">{member.name}</span>
                    <span className="ml-2 text-brand-navy/60">{title.en}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/content/people/board/${member.id}/edit`}>Edit</Link>
                    </Button>
                    <ConfirmDeleteForm
                      action={deleteBoardMember}
                      id={member.id}
                      confirmMessage={`Remove "${member.name}" from the board roster?`}
                    />
                  </div>
                </li>
              );
            })}
            {boardMembers.length === 0 && (
              <p className="py-4 text-center text-sm text-brand-navy/50">No board members yet.</p>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members Directory</CardTitle>
          <CardDescription>
            The general membership list shown at /members, separate from the executive board above.
          </CardDescription>
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
            <textarea
              name="bioEn"
              placeholder="Short bio (optional)"
              rows={2}
              className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-3"
            />
            <textarea
              name="jciExperienceEn"
              placeholder="JCI experience (optional — past roles, projects led, chapters, awards...)"
              rows={2}
              className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-3"
            />
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
    </div>
  );
}

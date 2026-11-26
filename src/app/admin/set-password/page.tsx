import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SetPasswordForm } from "@/components/admin/set-password-form";

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  const user = token
    ? await prisma.user.findUnique({ where: { passwordResetToken: token } })
    : null;
  const valid = !!user && !!user.passwordResetExpiresAt && user.passwordResetExpiresAt > new Date();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{valid ? "Set Your Password" : "Link Invalid"}</CardTitle>
          <CardDescription>
            {valid
              ? `Choose a password for ${user!.email}.`
              : "This link is invalid or has expired — ask a Super Admin to generate a new one for you."}
          </CardDescription>
        </CardHeader>
        <CardContent>{valid && <SetPasswordForm token={token!} />}</CardContent>
      </Card>
    </div>
  );
}

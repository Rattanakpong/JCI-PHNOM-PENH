import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminFormFeedback } from "@/components/admin/admin-form-feedback";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar user={user} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      <Suspense fallback={null}>
        <AdminFormFeedback />
      </Suspense>
    </div>
  );
}

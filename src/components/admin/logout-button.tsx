"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={handleLogout}>
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  );
}

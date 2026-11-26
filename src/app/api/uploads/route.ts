import { NextResponse } from "next/server";
import { saveUploadedFile, UploadError } from "@/lib/storage";
import { getCurrentUser, hasRole } from "@/lib/auth";

// Admin-only: every current caller is an authenticated admin form. No public
// flow uploads through this route today, so there's no reason to accept
// unauthenticated requests — an open upload endpoint with an arbitrary
// `scope` is just free storage for anyone who finds the URL.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!hasRole(user, ["SUPER_ADMIN", "ADMIN"])) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const scope = formData.get("scope");

  if (!(file instanceof File) || typeof scope !== "string") {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  try {
    const url = await saveUploadedFile(file, scope);
    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}

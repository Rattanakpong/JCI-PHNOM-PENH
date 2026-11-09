import { NextResponse } from "next/server";
import { saveUploadedFile, UploadError } from "@/lib/storage";

export async function POST(request: Request) {
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

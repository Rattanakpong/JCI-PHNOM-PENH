import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { parseLocalizedText } from "@/lib/json-field";
import { addExportSheet, exportResponse, readExportFormat } from "@/lib/spreadsheet-export";

// Exports the public members directory (/members), in the same A–Z order as
// the admin list. Localized fields are exported in English.
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!hasRole(user, ["SUPER_ADMIN", "BOARD_ADMIN"])) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const format = readExportFormat(request);

  const members = await prisma.member.findMany({ orderBy: { name: "asc" } });
  const english = (raw: string | null) => (raw ? parseLocalizedText(raw).en ?? "" : "");

  const rows = members.map((member) => ({
    name: member.name,
    joinYear: member.joinYear,
    jobTitle: english(member.jobTitle),
    businessName: member.businessName ?? "",
    industry: member.industry ?? "",
    email: member.email ?? "",
    phone: member.phone ?? "",
    socialUrl: member.socialUrl ?? "",
    jciExperience: english(member.jciExperience),
    bio: english(member.bio),
  }));

  const workbook = new ExcelJS.Workbook();
  addExportSheet(
    workbook,
    "Members",
    [
      { header: "Name", key: "name", width: 24 },
      { header: "Join Year", key: "joinYear", width: 10 },
      { header: "Job Title", key: "jobTitle", width: 22 },
      { header: "Business", key: "businessName", width: 24 },
      { header: "Industry", key: "industry", width: 18 },
      { header: "Email", key: "email", width: 28 },
      { header: "Phone", key: "phone", width: 16 },
      { header: "Social Link", key: "socialUrl", width: 30 },
      { header: "JCI Experience", key: "jciExperience", width: 40 },
      { header: "Bio", key: "bio", width: 50 },
    ],
    rows,
    format
  );

  return exportResponse(workbook, format, "members");
}

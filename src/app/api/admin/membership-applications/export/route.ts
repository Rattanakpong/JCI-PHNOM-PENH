import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { addExportSheet, exportResponse, readExportFormat } from "@/lib/spreadsheet-export";

// "SOCIAL_MEDIA" -> "Social Media", "MR" -> "Mr"
function humanize(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!hasRole(user, ["SUPER_ADMIN", "BOARD_ADMIN"])) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const format = readExportFormat(request);

  const applications = await prisma.membershipApplication.findMany({ orderBy: { createdAt: "desc" } });

  const rows = applications.map((app) => ({
    submittedAt: app.createdAt.toISOString().slice(0, 10),
    status: humanize(app.status),
    membershipStatus: humanize(app.membershipStatus),
    formerMemberYear: app.formerMemberYear ?? "",
    title: humanize(app.title),
    fullNameEnglish: app.fullNameEnglish,
    fullNameKhmer: app.fullNameKhmer,
    gender: humanize(app.gender),
    // Stored as UTC midnight of the chosen day.
    dateOfBirth: app.dateOfBirth.toISOString().slice(0, 10),
    nationality: app.nationality,
    email: app.email,
    phone: app.phone,
    occupation: humanize(app.occupation),
    schoolName: app.schoolName ?? "",
    companyName: app.companyName ?? "",
    companyIndustry: app.companyIndustry ?? "",
    department: app.department ?? "",
    referralSource: humanize(app.referralSource),
    supportArea: humanize(app.supportArea),
    expectations: app.expectations ?? "",
  }));

  const workbook = new ExcelJS.Workbook();
  addExportSheet(
    workbook,
    "Membership Applications",
    [
      { header: "Submitted", key: "submittedAt", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "New / Former", key: "membershipStatus", width: 14 },
      { header: "Former Member Year", key: "formerMemberYear", width: 12 },
      { header: "Title", key: "title", width: 8 },
      { header: "Full Name (English)", key: "fullNameEnglish", width: 24 },
      { header: "Full Name (Khmer)", key: "fullNameKhmer", width: 24 },
      { header: "Gender", key: "gender", width: 10 },
      { header: "Date of Birth", key: "dateOfBirth", width: 12 },
      { header: "Nationality", key: "nationality", width: 14 },
      { header: "Email", key: "email", width: 28 },
      { header: "Phone", key: "phone", width: 16 },
      { header: "Occupation", key: "occupation", width: 16 },
      { header: "School", key: "schoolName", width: 24 },
      { header: "Company", key: "companyName", width: 24 },
      { header: "Industry", key: "companyIndustry", width: 20 },
      { header: "Department", key: "department", width: 18 },
      { header: "Heard About Us", key: "referralSource", width: 16 },
      { header: "Wants to Help With", key: "supportArea", width: 20 },
      { header: "Expectations", key: "expectations", width: 40 },
    ],
    rows,
    format
  );

  return exportResponse(workbook, format, "membership-applications");
}

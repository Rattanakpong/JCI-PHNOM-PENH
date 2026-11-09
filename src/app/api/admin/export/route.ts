import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { parseLocalizedText } from "@/lib/json-field";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!hasRole(user, ["SUPER_ADMIN", "EVENT_ORGANIZER"])) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const format = new URL(request.url).searchParams.get("format") === "csv" ? "csv" : "xlsx";

  const registrations = await prisma.registration.findMany({
    include: { event: true, ticketTier: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = registrations.map((r) => ({
    name: r.fullName,
    email: r.email,
    phone: r.phone,
    isJciMember: r.isJciMember ? "Yes" : "No",
    jciChapter: r.jciChapter ?? "",
    event: parseLocalizedText(r.event.title).en,
    ticketTier: parseLocalizedText(r.ticketTier.name).en,
    amountUsd: r.payment?.amountUsd ?? 0,
    registrationStatus: r.status,
    paymentStatus: r.payment?.status ?? "PENDING",
    registeredAt: r.createdAt.toISOString(),
  }));

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Registrations");
  sheet.columns = [
    { header: "Name", key: "name", width: 24 },
    { header: "Email", key: "email", width: 28 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "JCI Member", key: "isJciMember", width: 12 },
    { header: "JCI Chapter", key: "jciChapter", width: 18 },
    { header: "Event", key: "event", width: 32 },
    { header: "Ticket Tier", key: "ticketTier", width: 18 },
    { header: "Amount (USD)", key: "amountUsd", width: 14 },
    { header: "Registration Status", key: "registrationStatus", width: 20 },
    { header: "Payment Status", key: "paymentStatus", width: 16 },
    { header: "Registered At", key: "registeredAt", width: 24 },
  ];
  sheet.getRow(1).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));

  const buffer =
    format === "csv" ? await workbook.csv.writeBuffer() : await workbook.xlsx.writeBuffer();

  const filename = `registrations.${format}`;
  const contentType =
    format === "csv"
      ? "text/csv"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

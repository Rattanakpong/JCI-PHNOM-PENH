import { NextResponse } from "next/server";
import type ExcelJS from "exceljs";

export type ExportFormat = "xlsx" | "csv";

export function readExportFormat(request: Request): ExportFormat {
  return new URL(request.url).searchParams.get("format") === "csv" ? "csv" : "xlsx";
}

// Values typed into public or admin forms, like "=HYPERLINK(...)", would run
// as a formula when a CSV is opened in Excel. Prefix those with an
// apostrophe; phone numbers such as "+855 12 345 678" are left alone.
function csvSafe(value: unknown) {
  if (typeof value !== "string") return value;
  return /^[=@\t\r]/.test(value) || /^[+-](?![\d\s()-]*$)/.test(value) ? `'${value}` : value;
}

// Adds one sheet with a bold, frozen header row. For CSV, every cell goes
// through csvSafe; .xlsx stores strings as text, so it needs no escaping.
export function addExportSheet<Row extends Record<string, unknown>>(
  workbook: ExcelJS.Workbook,
  name: string,
  columns: { header: string; key: keyof Row & string; width: number }[],
  rows: Row[],
  format: ExportFormat
) {
  const sheet = workbook.addWorksheet(name);
  sheet.columns = columns;
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  rows.forEach((row) =>
    sheet.addRow(
      format === "csv" ? Object.fromEntries(Object.entries(row).map(([key, value]) => [key, csvSafe(value)])) : row
    )
  );
}

// Downloads as `<basename>-YYYY-MM-DD.<format>`, dated in Phnom Penh time.
export async function exportResponse(workbook: ExcelJS.Workbook, format: ExportFormat, basename: string) {
  // The BOM makes Excel read the CSV as UTF-8, so Khmer text isn't garbled.
  const buffer =
    format === "csv"
      ? Buffer.concat([Buffer.from("﻿"), Buffer.from(await workbook.csv.writeBuffer())])
      : await workbook.xlsx.writeBuffer();

  // en-CA formats as YYYY-MM-DD; use the chapter's local date, not UTC.
  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Phnom_Penh" });
  const contentType =
    format === "csv" ? "text/csv; charset=utf-8" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${basename}-${date}.${format}"`,
    },
  });
}

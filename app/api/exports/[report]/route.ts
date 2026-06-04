import { NextResponse } from "next/server";
import { moduleDefinitions } from "@/features/modules/module-definitions";
import { listModuleRecords } from "@/features/modules/repository";
import { getReportDefinition } from "@/features/reports/report-definitions";
import { rowsToCsv } from "@/lib/export/csv";
import { createSimplePdf } from "@/lib/pdf/simple-pdf";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/features/auth/session";

type RouteContext = {
  params: Promise<{ report: string }>;
};

function filename(text: string, extension: string) {
  return `${text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${new Date().toISOString().slice(0, 10)}.${extension}`;
}

export async function GET(request: Request, context: RouteContext) {
  const { report: reportKey } = await context.params;
  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "pdf" ? "pdf" : "csv";
  const report = getReportDefinition(reportKey);
  const moduleDefinition =
    moduleDefinitions.find((module) => module.exportKey === reportKey) ??
    moduleDefinitions.find((module) => module.key === report?.sourceModuleKey);

  if (!moduleDefinition) {
    return NextResponse.json({ ok: false, message: "Unknown report." }, { status: 404 });
  }

  const title = report?.title ?? moduleDefinition.title;
  const records = await listModuleRecords(moduleDefinition.key, { pageSize: 50 });

  const user = await getCurrentUser();
  if (prisma) {
    await prisma.reportExportLog
      .create({
        data: {
          reportKey,
          reportTitle: title,
          format: format === "pdf" ? "PDF" : "CSV",
          generatedById: user?.id,
          filters: Object.fromEntries(url.searchParams.entries())
        }
      })
      .catch(() => undefined);
  }

  if (format === "pdf") {
    const pdf = createSimplePdf({
      title,
      subtitle: "Generated for Namdhari Swaich Sweets",
      columns: moduleDefinition.columns,
      rows: records.rows
    });
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename(title, "pdf")}"`
      }
    });
  }

  const csv = rowsToCsv(title, moduleDefinition.columns, records.rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename(title, "csv")}"`
    }
  });
}

import { getAuthenticatedUser } from "@/lib/auth/session";
import { parseAdsReport } from "@/lib/ads/parser";
import { getReports, importAdsReport } from "@/lib/ads/repository";

const MAX_FILE_SIZE = 15 * 1024 * 1024;

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ reports: await getReports() });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const notes = formData.get("notes");
    if (!(file instanceof File)) {
      return Response.json({ error: "Choose a CSV or XLSX report." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: "Report files must be 15 MB or smaller." }, { status: 400 });
    }

    const parsed = parseAdsReport(await file.arrayBuffer(), file.name);
    const report = await importAdsReport({
      fileName: file.name,
      rows: parsed.rows,
      notes: typeof notes === "string" ? notes : undefined,
    });

    return Response.json({
      report,
      importedRows: parsed.rows.length,
      skippedRows: parsed.skippedRows,
      errors: parsed.errors,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to import report." },
      { status: 400 },
    );
  }
}

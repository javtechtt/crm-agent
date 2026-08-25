import { answerAdsQuestion, buildAdsAnalysis } from "@/lib/ads/analysis";
import { getInsightRows, saveAnalysis } from "@/lib/ads/repository";
import { getAuthenticatedUser } from "@/lib/auth/session";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") throw new Error("Invalid request.");
    const { question, reportId } = body as { question?: unknown; reportId?: unknown };
    if (typeof question !== "string" || question.trim().length < 3) {
      throw new Error("Ask a business question with at least three characters.");
    }
    const selectedReportId = typeof reportId === "string" && reportId ? reportId : undefined;
    const rows = await getInsightRows(selectedReportId ? [selectedReportId] : undefined);
    if (!rows.length) throw new Error("Upload a Meta Ads report before asking a question.");

    const summary = buildAdsAnalysis(rows);
    const answer = answerAdsQuestion(question.trim(), summary);
    const analysis = await saveAnalysis({
      reportId: selectedReportId,
      question: question.trim(),
      answer,
      summary,
      userId: user.id,
    });
    return Response.json({ analysis, summary });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to analyze reports." },
      { status: 400 },
    );
  }
}

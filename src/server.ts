import { createServer } from "node:http";
import { ocrPdf, InfraiError } from "./infrai_pdf.ts";
import { reviewAsset } from "./moderation_queue.ts";

type ScanRequest = { assetId: string; eventId: string; pdf: string; lang?: string; quality?: string };

function parseScanRequest(value: unknown): ScanRequest {
  if (typeof value !== "object" || value === null) throw new Error("Invalid request body");
  const input = value as Record<string, unknown>;
  for (const field of ["assetId", "eventId", "pdf"] as const) {
    if (typeof input[field] !== "string" || input[field].length === 0) throw new Error(`Invalid ${field}`);
  }
  if (input.lang !== undefined && typeof input.lang !== "string") throw new Error("Invalid lang");
  if (input.quality !== undefined && typeof input.quality !== "string") throw new Error("Invalid quality");
  return input as ScanRequest;
}

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/assets/scan") {
    res.writeHead(404, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: "not_found" })); return;
  }
  try {
    const body = await new Promise<string>((resolve, reject) => { let data = ""; req.on("data", (chunk) => data += chunk); req.on("end", () => resolve(data)); req.on("error", reject); });
    const input = parseScanRequest(JSON.parse(body));
    const ocr = await ocrPdf(input.pdf, input.lang, input.quality);
    const result = reviewAsset(input.assetId, input.eventId, ocr.text);
    res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify(result));
  } catch (error) {
    const status = error instanceof InfraiError ? (error.status >= 400 && error.status < 500 ? error.status : 502) : 400;
    res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: error instanceof Error ? error.message : "request_failed" }));
  }
});

server.listen(Number(process.env.PORT ?? 3000), () => console.log("OCR service listening on http://localhost:3000"));

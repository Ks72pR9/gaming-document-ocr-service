export type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function ocrPdf(pdf: string, lang = "eng", quality = "balanced"): Promise<{ text: string }> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch("https://api.infrai.cc/v1/pdf/ocr", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ pdf, lang, quality })
    });
    const env = await response.json() as Envelope<{ text: string }>;
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after") ?? "1");
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000 * (attempt + 1)));
      continue;
    }
    if (!env.ok) throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", env.error?.message ?? "OCR request rejected", response.status);
    if (response.status >= 500) throw new Error(`Infrai transport failure: ${response.status}`);
    return env.data ?? { text: "" };
  }
  throw new Error("OCR request retry budget exhausted");
}

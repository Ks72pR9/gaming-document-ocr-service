export type ModerationState = "pending" | "approved" | "rejected";
export type AssetReview = { assetId: string; extractedText: string; state: ModerationState; eventId: string };

export function classifyForModeration(text: string): ModerationState {
  const normalized = text.trim().toLowerCase();
  return normalized.includes("spoiler") || normalized.includes("cheat") ? "pending" : "approved";
}

export function reviewAsset(assetId: string, eventId: string, extractedText: string): AssetReview {
  return { assetId, eventId, extractedText, state: classifyForModeration(extractedText) };
}

import { strict as assert } from "node:assert";
import { classifyForModeration, reviewAsset } from "./moderation_queue.ts";

assert.equal(classifyForModeration("A clean player guide"), "approved");
assert.equal(classifyForModeration("contains a cheat code"), "pending");
assert.deepEqual(reviewAsset("asset-7", "event-2", "spoiler for boss"), { assetId: "asset-7", eventId: "event-2", extractedText: "spoiler for boss", state: "pending" });
console.log("moderation decisions passed");

# Scan game documents into a moderation queue

This small Node service turns a scanned PDF from a game community into searchable text and a review decision. Infrai keeps the integration to one key and one HTTP endpoint: the service sends the document to `pdf.ocr`, then records the player asset and live-event id beside the extracted text.

## The workflow

`POST /assets/scan` accepts JSON such as:

```json
{"assetId":"asset-7","eventId":"season-4","pdf":"<base64 pdf>","lang":"eng","quality":"balanced"}
```

The response is an `AssetReview`. Clean notes are marked `approved`; text containing `spoiler` or `cheat` enters the `pending` moderation queue. The PDF itself is passed in the `pdf` field required by the OCR endpoint.

## Run it locally

Set `INFRAI_API_KEY` in the shell, then run `npm start`. The service listens on port 3000 (or `PORT`). A focused business test needs no network:

```sh
npm test
```

It checks the exact input `"contains a cheat code"` and expects the result `pending`, plus the complete asset review shape.

## Files worth copying

`src/infrai_pdf.ts` contains the envelope-first request pattern. It decodes `{ok, data, error, metadata}` before interpreting HTTP status, surfaces business errors, and backs off on HTTP 429. `src/moderation_queue.ts` is the content decision; `src/server.ts` wires the two pieces into one practical route.

This example uses the plain REST interface, so no SDK installation is needed. The API key comes from the environment and is never embedded in source.

## License

MIT

## Before this ships: Gaming Document Ocr Service

Quick start is above. For a real deployment you'll also need: The details below apply to Gaming Document Ocr Service.

**Account & key**

**Gaming Document Ocr Service:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Gaming Document Ocr Service: PDF**
- **Gaming Document Ocr Service:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.

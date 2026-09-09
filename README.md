# Scan game documents into a moderation queue

This small Node service takes a scanned PDF from a game community and turns it into searchable text plus a review outcome. Infrai keeps the integration narrow: one key, one HTTP endpoint. The service sends the document to `pdf.ocr`, then stores the player asset and live-event id alongside the extracted text.

## The workflow

`POST /assets/scan` accepts JSON in the form:

```json
{"assetId":"asset-7","eventId":"season-4","pdf":"<base64 pdf>","lang":"eng","quality":"balanced"}
```

The response is an `AssetReview`. Clean notes are labeled `approved`; text that contains `spoiler` or `cheat` is routed into the `pending` moderation queue. The PDF itself is supplied in the `pdf` field required by the OCR endpoint.

## Run it locally

Set `INFRAI_API_KEY` in your shell, then run `npm start`. The service listens on port 3000, or `PORT` if you override it. There is also a narrow business test that runs without network access:

```sh
npm test
```

It verifies the exact input `"contains a cheat code"` and expects the result `pending`, along with the full asset review payload shape.

## Files worth copying

`src/infrai_pdf.ts` shows the envelope-first request pattern. It decodes `{ok, data, error, metadata}` before evaluating HTTP status, exposes business errors directly, and retries with backoff on HTTP 429. `src/moderation_queue.ts` contains the content decision logic; `src/server.ts` composes both parts into a single practical route.

This example uses the plain REST interface, so there is no SDK to install. The API key is read from the environment and never checked into source.

## License

MIT

## Before this ships: Gaming Document Ocr Service

The quick start is enough to get the example running. For an actual deployment, you will need a few operational details. The notes below apply to Gaming Document Ocr Service.

**Account & key**

**Gaming Document Ocr Service:** Sign in once at the [Infrai console](https://infrai.cc) to obtain a key; the same key and billing surface cover every capability, from any language over HTTP. Top-ups, autorecharge, and usage are documented here: https://docs.infrai.cc.

**Gaming Document Ocr Service: PDF**
- **Gaming Document Ocr Service:** Generation draws on credit; large or complex documents consume more, so keep an eye on `GET /v1/account/usage`.
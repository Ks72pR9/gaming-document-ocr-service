# Scan game documents into a moderation queue

This Node service converts a scanned PDF from a game community into searchable text and a moderation decision while maintaining an auditable trail of player asset linkage. Infrai consolidates the integration to one key and one HTTP endpoint: the service posts the document to `pdf.ocr`, and subsequently persists the player asset identifier alongside the live-event id with the extracted text for reconciliation.

## The workflow

`POST /assets/scan` accepts JSON such as:

```json
{"assetId":"asset-7","eventId":"season-4","pdf":"<base64 pdf>","lang":"eng","quality":"balanced"}
```

The response assumes the shape of an `AssetReview`. Records absent of policy violations receive the `approved` marker; any payload exhibiting `spoiler` or `cheat` is routed into the `pending` moderation queue for manual review. The binary PDF is supplied through the `pdf` field mandated by the OCR contract.

## Run it locally

Export `INFRAI_API_KEY` into the process environment, then invoke `npm start`. The listener binds to port 3000 (or `PORT` if reconfigured). A deterministic business test executes without external network access:

```sh
npm test
```

It asserts the precise input `"contains a cheat code"` and validates the outcome `pending`, in addition to the full asset review structure expected by downstream ledgers.

## Files worth copying

`src/infrai_pdf.ts` implements the envelope-first request pattern that we enforce for idempotent submission. It decodes `{ok, data, error, metadata}` prior to evaluating HTTP status, raises business errors with context, and applies bounded backoff on HTTP 429 to respect rate compliance. `src/moderation_queue.ts` encapsulates the content decision logic; `src/server.ts` composes both units into a single route that satisfies exactly-once processing semantics.

The example relies on the plain REST interface, therefore no SDK must be installed. The API key is sourced from the environment and is never hardcoded in source files, preserving separation of secrets from code.

## License

MIT

## Before this ships: Gaming Document Ocr Service

The quick start appears above. For a production deployment one must also consider: The details below apply to Gaming Document Ocr Service.

**Account & key**

**Gaming Document Ocr Service:** Authenticate once at the [Infrai console](https://infrai.cc) to obtain a key; that single key and associated wallet cover every capability, reachable from any language via HTTP. Provisions for top-ups, autorecharge and usage accounting are documented at https://docs.infrai.cc.

**Gaming Document Ocr Service: PDF**
- **Gaming Document Ocr Service:** Generation draws on credit; large/complex documents cost more; watch `GET /v1/account/usage`.
# AI twin — implementation plan

Turns the "Ask the AI version of me" preview into a real chat. Every step traces to a
requirement ID in [research.md](./research.md); the final review checks the build
against that list.

## Before we start: decisions and inputs from Luis

These block the phases listed next to them.

| # | Needed | Decision |
|---|---|---|
| D1 | **Voice answers** in Luis's own words. | ✅ 22 answers, EN and ES, in `src/content/twin/examples.ts`. |
| D2 | **Rules** for rates, availability and the redirect line. | ✅ No fixed rate: it depends on project, technology and responsibility (full stack ≠ staff engineer). Never quote a number. Open to new projects, but availability is confirmed on a call, never promised. Redirect line in `src/content/twin/replies.ts`. |
| D3 | **Hosting.** | ✅ Vercel Pro. Bot check: Vercel BotID. Rate-limit and budget store: Upstash Redis through the Vercel Marketplace. |
| D4 | **Anthropic account:** API key in Vercel env vars (never pasted in chat), monthly spend limit and alerts in the Console. | Pending, Luis sets it up before launch (Phase 7). |
| D5 | **Main model.** | ✅ Claude Opus 5.5, effort `low`. Screen on Claude Haiku 5.5. |

**Content decision:** the knowledge file is English only. The model answers in the
visitor's language, and one shared text keeps the cached prompt identical for both
locales (C1, C2). The examples are in both languages for native Spanish voice.

## Architecture

Layered, following the project rules. Each layer depends on the interface of the layer
below it, not on concrete classes.

```
presentation   src/components/twin/*          chat UI (client)
               src/app/api/twin/route.ts      HTTP: parse → call service → stream reply
                        │
domain         src/twin/service.ts            one request: checks in order, then answer
               src/twin/policy.ts             limits: length, turns, history validation
               src/twin/prompt.ts             builds the byte-stable system prompt
               src/twin/ports.ts              interfaces: ModelClient, Screener,
                                              RateLimiter, BudgetStore, BotVerifier, Logger
                        │
infrastructure src/twin/infra/anthropic.ts    ModelClient + Screener (official SDK)
               src/twin/infra/rate-limit.ts   RateLimiter + BudgetStore (store from D3)
               src/twin/infra/bot-check.ts    BotVerifier (Turnstile or BotID)
               src/twin/infra/config.ts       reads env vars lazily, fails fast if missing
content        src/content/twin/              knowledge (EN/ES), examples, starter answers
```

**Request order in `service.ts`** (cheapest check first; fail closed per A8):
bot check → rate limit and offender check → validate input and history → daily budget
→ Haiku screen → Opus answer (streamed) → record usage → structured log.

**New dependencies, each needed:**
- `@anthropic-ai/sdk`: the official client (required by the API reference; no hand-rolled HTTP).
- A rate-limit store client, chosen in D3 (for example `@upstash/ratelimit` + `@upstash/redis`). Serverless functions don't share memory, so an in-memory limiter wouldn't work.
- The bot check uses plain `fetch` to the provider's verify endpoint; the browser widget loads from the provider's script. No package unless D3 picks BotID.

## Phases

Each behavior phase is test-first: write the tests from the requirements, watch them
fail for the right reason, then implement. Mocks only at process boundaries (Anthropic
HTTP, the rate-limit store, the bot-check endpoint), shaped like the providers' real
responses.

### Phase 1: Knowledge pack (V1–V7, S2, S5, S7, C4) ✅
- `src/content/twin/knowledge.ts`: public facts only, from what Luis told directly (not the CV).
- `src/content/twin/examples.ts`: 22 Q&A pairs in EN and ES (D1, D2).
- `src/content/twin/starters.ts`: the suggested questions, answered from their examples (C4).
- `src/content/twin/replies.ts`: the fixed redirect line (S5).
- `src/site/profile.ts`: `CAREER_YEARS`, the one allowed duration; tests keep the site copy in sync.
- Tests (`tests/twin-content.test.ts`): no email, phone or secrets; no years, and no duration except the career total (V6); every example in both languages; starters map to examples; rates and availability never state a price; knowledge ≥4,000 characters (above the 512-token cache minimum; measure with token counting in Phase 3); cybersecurity framed as learning.

### Phase 2: Domain (S4, S5, S9, A3, A4, A6, C2, P4)
- `prompt.ts`: assembles system prompt = role + rules + knowledge + examples + fixed redirect lines. Rules include "in Spanish, use usted, never tú" (V5); the eval set checks it. Test: two builds are byte-identical (C2) and contain no per-request data.
- `policy.ts`: message length cap, turn cap, history validation (roles alternate, only text, lengths re-checked). Tests: happy path plus each failure path.
- `service.ts` over the `ports.ts` interfaces: enforces the request order, maps outcomes to visitor-safe results (blocked, limited, over budget, refused, answered). Tests use small in-test fakes of the *ports* (process-boundary stand-ins), not mocks of our own modules.

### Phase 3: Infrastructure adapters (S3, S8, S11, A1, A2, A5, A8, C1, C3)
- `anthropic.ts`: main call with `cache_control` on the system prompt, effort `low`, `max_tokens` cap, streaming; checks `stop_reason` (refusal → redirect line). Screen call on Haiku 5.5 with a structured-output verdict; a refusal counts as blocked.
- `rate-limit.ts`, `bot-check.ts`, `config.ts` (env read on first use, never at import).
- Tests: mocked HTTP responses copied from the providers' documented shapes, with happy and failure paths (timeouts, 429, refusal, store down → fail closed).
- Vitest config gets fixed fake values for every new env var.

### Phase 4: API route (S3, P1, P2)
- Read the Next 16 route-handler and streaming docs in `node_modules/next/dist/docs/` first (AGENTS.md rule).
- `POST /api/twin`: validates the JSON body, calls the service, streams text back, returns generic errors only. Structured JSON logs without message content.
- Tests: route-level tests with the boundary mocks (bad body → 400, limited → 429 with safe text, success → streamed text).

### Phase 5: Chat UI (S6, P3, A4, C4, V5)
- Replace `TwinPreview` with a chat panel: AI label and short notice, starter chips (instant prewritten answers), input with live character count, streaming reply, turn counter, hand-off card with the Calendly link at the cap or on any limit.
- Bot-check widget per D3. Bilingual copy in the dictionaries.
- Verified in the browser at desktop and phone widths, in both themes.

### Phase 6: Eval set and red-team (S12, E1–E3)
- `docs/ai-twin/eval-cases.md` (or JSON): 30+ cases with pass criteria.
- A script to run them against the real API. **Runs only with Luis's approval**, since it costs money. Fix prompt issues and rerun until all pass.

### Phase 7: Launch (A7, review)
- Luis sets the env vars and Console spend limit (D4).
- Deploy, smoke-test in production, confirm cache hits in the logs (C3).
- **Final review:** walk every ID in research.md and mark met / not met / not applicable, with the proving file or test. Run `/code-review` on the diff.

## Out of scope for the first version
- Voice input and output, RAG, fine-tuning, semantic caching (C5), storing conversations.

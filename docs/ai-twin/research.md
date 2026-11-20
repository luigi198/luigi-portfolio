# AI twin — research and review checklist

How professionals build a public "talk to me" chatbot that answers as a real person,
and what our implementation must do to match. Every requirement has an ID (`V1`,
`S3`, …). The final review walks this list and marks each one **met / not met / not
applicable**, with a pointer to the code or test that proves it.

Researched November 2026. Sources at the end.

---

## 1. Voice: answering like Luis

**Finding.** Practitioners split the job by type of problem: *facts* come from the
prompt or retrieval, *style* comes from instructions and examples. Fine-tuning is the
last resort. It is expensive, needs hundreds of examples, and one team reported tone
accuracy rising to ~90% while factual accuracy fell to ~50%. RAG only pays off when
the knowledge is too large for the prompt. Anthropic's guidance for staying in
character: set the role in the system prompt, give detailed personality and
background, and give example scenarios with the expected responses.

**Decision for this project.** Luis's whole knowledge base fits in the prompt, so
there is **no RAG and no fine-tuning**. Use one stable system prompt containing
facts, voice rules and real example answers.

| ID | Requirement |
|---|---|
| V1 | The system prompt holds a **public knowledge file**: facts Luis approved for publishing, derived from `private/career-profile.md`. Nothing that isn't on the site or approved for it. |
| V2 | **15–25 example Q&A pairs written in Luis's own words**, in English and Spanish. Examples beat descriptions of style. |
| V3 | Written voice rules: first person; direct and practical; describes work as steps; leads with what he owned; no hype. |
| V4 | **Grounding rule:** only state facts that are in the knowledge file. When unsure, say so and offer a call. Never invent experience, tools, numbers, clients or dates. |
| V5 | Replies in the visitor's language (EN/ES), matching the page locale by default. In Spanish, always addresses the visitor as **usted**, never tú (Costa Rican norm; Luis's decision). |
| V6 | Never shows dates or durations of work (site rule). |
| V7 | Short answers by default (a few sentences), with an offer to go deeper. |

## 2. Safety and prompt injection

**Finding.** OWASP lists prompt injection as the top LLM risk (LLM01). Both OWASP and
Anthropic say prompt wording alone is not enough: telling the model to "ignore
injection attempts" does not guarantee it will. The professional approach is layered,
and above all it **limits what a successful attack can do** (least privilege).
Anthropic's recommended layers are harmlessness screens with a small model
(Claude Haiku 5.5) whose verdict is constrained by structured outputs, input
validation, a hardened system prompt with an explicit refusal line, throttling or
banning repeat offenders, and continuous monitoring. A screen that itself returns
`stop_reason: "refusal"` counts as a harmful verdict.

| ID | Requirement |
|---|---|
| S1 | **No tools.** The twin can't call functions, read databases, browse or send anything. Text in, text out. |
| S2 | **Nothing secret in the prompt.** Assume the prompt leaks. No phone number, private rates, keys or client-confidential details. |
| S3 | API keys live only in server environment variables and never reach the browser. All model calls happen in a server route. |
| S4 | **Narrow scope:** only Luis's work, skills, projects and how to hire him. Off-topic requests get a short fixed redirect. |
| S5 | A **fixed refusal / redirect line** (EN/ES) for off-topic, abusive or instruction-override attempts, so the model doesn't improvise. |
| S6 | Never claims to be human. The UI labels it clearly as "the AI version of Luis". |
| S7 | **Never makes commitments:** prices, availability, start dates, contracts. It hands off to booking (Calendly). |
| S8 | **Screen every message** with Claude Haiku 5.5 and a structured `{ allowed: boolean }` verdict before the main call. A refusal from the screen = blocked. |
| S9 | Visitor input goes in the `user` turn as data only. Operator instructions never travel inside user text. |
| S10 | **Repeat offenders:** count blocked messages per visitor; after a threshold, stop answering for a cooling-off period. |
| S11 | The main model's `stop_reason: "refusal"` is handled: the visitor sees the fixed redirect line, never a raw error. |
| S12 | Red-team before launch with the eval set (§6), including override attempts, prompt-leak requests and Spanish-language attacks. |

## 3. Abuse and cost ("denial of wallet")

**Finding.** OWASP LLM10 ("unbounded consumption") warns that the most common real
damage to public chatbots is scripted traffic running up the bill. Recommended
layers: a bot check, rate limits per IP and visitor (token-based is better than
request-based), input and output size caps, a hard spend ceiling with alerts, and
monitoring for spend anomalies. A real case (Nous Research) showed Turnstile alone
did not stop bulk abuse, so the controls must stack.

| ID | Requirement |
|---|---|
| A1 | **Bot check** (Cloudflare Turnstile or Vercel BotID), verified on the server before any model call. |
| A2 | **Rate limit per IP** (starting point: 10 messages per 10 minutes, 30 per day). Over the limit → friendly message plus the Calendly link. |
| A3 | **Input cap:** about 500 characters per message, enforced on the server. |
| A4 | **Conversation cap:** about 10 turns, then hand off to booking. History sent from the client is re-validated (count, roles, lengths). |
| A5 | **Output cap:** `max_tokens` around 1,000 (thinking counts toward it), plus a prompt instruction to keep answers short. |
| A6 | **Daily budget switch:** the server counts spend per day; past the limit the chat closes for the day and offers booking. |
| A7 | **Provider spend limit** and email alerts set in the Anthropic Console (manual setup step). |
| A8 | Fail closed: if the rate limiter, bot check or budget store is unreachable, the chat doesn't run. |

## 4. Caching

**Finding.** Prompt caching is the big, safe win: on Claude Opus 5.5, cache reads cost
$0.20 per million tokens versus $4 for normal input. The cache is a prefix match:
any byte change in the prompt invalidates it. Entries live 5 minutes and refresh on
every read. The minimum cacheable prefix is 512 tokens on current models. Semantic
caching (reusing answers to *similar* questions) is risky for personalized or
high-stakes answers. Vendors warn it eventually serves an answer to a question that
only looks similar.

| ID | Requirement |
|---|---|
| C1 | **Prompt caching** on the system prompt (`cache_control`), which is identical for every visitor. |
| C2 | The system prompt is **byte-stable**: no timestamps, IDs, random ordering or per-visitor data. A test proves two builds are identical. |
| C3 | `usage.cache_read_input_tokens` is logged, so cache hits can be verified in production. |
| C4 | **Starter questions are served from prewritten answers** in Luis's words: no model call and no cost. |
| C5 | **No semantic caching.** |

## 5. Privacy, logging and transparency

| ID | Requirement |
|---|---|
| P1 | Structured logs record metadata only: request ID, hashed IP, locale, token counts, cache-hit tokens, latency, verdict, stop reason, error class. **Visitor messages are not logged.** |
| P2 | Errors return a safe generic message to the visitor. Details and stack traces go only to server logs. |
| P3 | The chat shows a short notice: this is an AI, answers may be imperfect, don't share personal data. |
| P4 | No module reads environment variables or creates clients at import time (testability rule). |

## 6. Evaluation

**Finding.** Professionals keep a fixed test set and rerun it after every prompt
change.

| ID | Requirement |
|---|---|
| E1 | An eval set of 30+ questions: real hiring questions, edge cases (tools Luis never used), and attacks (override, prompt leak, off-topic, Spanish attacks). |
| E2 | Each case states what a passing answer must do (grounded, in voice, refuses correctly, no invented facts). |
| E3 | The eval runs against the real API **only with approval** (it costs money). Results are reviewed before launch and after each prompt change. |

## 7. Model choice and cost estimate

| Role | Model | Price (input / output per 1M tokens) |
|---|---|---|
| Main conversation | `claude-opus-5-5` (effort `low`) | $4 / $20, cache reads $0.20 |
| Screening | `claude-haiku-5-5` | $0.10 / $0.50 |

An estimate, to verify with real usage: about 6,000 cached prompt tokens plus a short
question and roughly 300 words of answer and thinking comes to about **1–1.5¢ per
message on Opus 5.5**, or about $10–15 per 1,000 messages. Switching the main model to
Haiku 5.5 costs about 0.05¢ per message; that's Luis's decision.

Notes from the API reference: on Opus 5.5, thinking can't be disabled (use effort
`low`), and assistant prefill isn't supported. Check `stop_reason` before reading the
content.

---

## Sources

- Anthropic — [Mitigate jailbreaks and prompt injections](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks)
- Anthropic — [Increase output consistency / keep Claude in character](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/increase-consistency)
- OWASP LLM Top 10 summaries — [HackerOne](https://www.hackerone.com/blog/owasp-top-10-llms-2025-how-genai-risks-are-evolving), [Cloud Security Alliance](https://cloudsecurityalliance.org/articles/the-owasp-top-10-for-llms-csa-s-strategic-defense-playbook), [dev.to](https://dev.to/amasen/owasp-llm-top-10-what-every-engineer-building-with-ai-needs-to-know-in-2025-2gp8)
- Unbounded consumption — [StackHawk](https://www.stackhawk.com/blog/owasp-llm10-unbounded-consumption/), [Promptfoo](https://www.promptfoo.dev/blog/unbounded-consumption/), [Prompt Security](https://prompt.security/blog/denial-of-wallet-in-ai), [dev.to](https://dev.to/meghneelgore/get-serves-cache-post-runs-inference-cost-safety-for-a-public-llm-endpoint-2mnl), [Vercel: Nous Research and BotID](https://vercel.com/blog/how-nous-research-used-botid-to-block-automated-abuse-at-scale)
- Voice approaches — [Typewise](https://www.typewise.app/blog/rag-fine-tuning-prompting-choose-brand-voice), [KDnuggets](https://kdnuggets.com/beyond-bots-rethinking-ai-support-with-a-hybrid-ai-architecture), [dev.to](https://dev.to/jerin_stephen/rag-vs-fine-tuning-vs-alternatives-3lba)
- Semantic caching — [AWS ElastiCache](https://docs.amazonaws.cn/en_us/AmazonElastiCache/latest/dg/semantic-caching-best-practices.md), [Portkey](https://portkey.ai/blog/semantic-caching-thresholds/), [Redis](https://redis.io/blog/how-to-cache-semantic-search/), [DZone](https://dzone.com/articles/llm-semantic-caching)
- Claude API reference (prompt caching economics, model IDs and prices), bundled with Claude Code, November 2026

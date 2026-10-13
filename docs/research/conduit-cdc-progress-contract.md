# Conduit CDC progress contract — research record

Checked 2026-10-13 02:11 UTC. Article is original Traditional Chinese engineering analysis. No Conduit binary, database, connector, or fault-injection experiment was run.

## Dedupe and editorial scope

Searched src/content/blog, docs/research, docs/article-queue.md for Conduit, conduitio/conduit, stable v0.20.0 and topic strings before writing. Only an unrelated English “glass conduit” cover description matched. No duplicate article found. Existing database series has orders 1–8; assigned order 9. Related article: database-replication-lag-mitigation-strategies.

Read AGENTS.md, docs/content-guide.md, src/content.config.ts, carlstack-copywriting skill, humanize-writing skill and both language references; inspected a recent published article for voice/frontmatter.

## Primary sources and claim boundaries

- https://github.com/ConduitIO/conduit/releases/tag/v0.20.0 — fetched full release, timestamp October 12 17:45 UTC. v0.19.0 snapshot-to-CDC dropped ack, SEV-0, no error/DLQ, no known production occurrence. Stop-state semantics. Known issues include PostgreSQL restart-loss cases and arch-v2 persistent connector-state write failure reporting healthy. Keep release-derived article passages short, under 200-word equivalent; do not expand into a release-note translation.
- https://www.postgresql.org/docs/current/logicaldecoding-explanation.html — fetched official PostgreSQL 18 docs. Exported snapshot/change-stream consistency, possible crash replay, consumer responsibility for duplicate handling. The article's canary and fault-injection design is independent analysis, not quoted vendor implementation guidance.
- https://www.postgresql.org/docs/current/view-pg-replication-slots.html — fetched official PostgreSQL 18 docs. confirmed_flush_lsn means consumer receipt acknowledgment; restart_lsn means oldest potentially required WAL. Neither is claimed to be an end-to-end sink completion indicator.

Additional release-linked postmortem, ADR, and issue #2929 requests returned web cache misses. They were not used as separately inspected evidence, and no source-code root-cause claim was added.

## Proposed engineering work, not measured findings

Boundary canary with known committed input and expected version; four-stage evidence; per-partition/complete-set sink watermark; inactivity-aware alert; isolated snapshot-boundary kill, sink-block, and checkpoint-gap replay experiments. No performance, loss rate, or successful reproduction is claimed.

## Pending integration

No SVG, image generation, staging, commit, or deployment performed by this worker. Cover path and descriptive alt are provisional until parent creates and inspects actual cover. Publication gates cannot pass until cover exists. Parent should run full content policy/check/test/build after all article and image files land.

## 封面與驗收紀錄

2026-10-13 正式 imagegen 各生成一次，1672×941，轉本地 WebP。已目視全尺寸及三圖並列320×180卡片裁切：無文字/標誌，主要物件可辨，alt依實圖調整。三圖分別為暗色金屬微距/淺桃刺繡俯視/陶水渠側視，媒材構圖配色互異。未新增正文流程圖，無SVG驗收項。

本機 `pnpm dev --host 0.0.0.0` 回報 Dev server process exited before becoming ready，無可用頁面；依授權記錄未完成本機桌面/窄版/深淺色實頁目視，不繞過環境限制。正式站部署後另行核對。

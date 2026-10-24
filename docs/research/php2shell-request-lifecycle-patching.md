# PHP2Shell request lifecycle patching — 2026-10-22

## Article and scope

- Article: `src/content/blog/php2shell-request-lifecycle-patching.md`
- Claim: patch closure follows the actual HTTP-serving worker, not CLI output or a temporary memory configuration.
- No exploit reproduction, production audit, or application regression was run. All operational checklists are recommendations.
- Series: considered existing security incident articles and content-guide series. This standalone urgent runtime patch report is not forced into an unrelated architecture curriculum.

## Deduplication

Checked source URLs, stable IDs CVE-2026-109618 / CVE-2026-109619, PHP2Shell and PHP release archive across `src/content/blog`, `docs/research`, `docs/article-queue.md`; no prior matching article at starting main `588fd5971a5bd2a744c42965e1b5cd7c9b18d282`.

## Primary evidence

1. PHP project, 2026-10-21 security announcement: <https://www.php.net/archive/2026.php#2026-10-21-1>. Official patched releases: 8.5.12, 8.4.27, 8.3.36, 8.2.35. Vendor backports require vendor-specific confirmation. Main source URL retained verbatim in article.
2. PHP project advisory GHSA-w8hw-w9fx-j79w / CVE-2026-109618: <https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w>. OOM nonlocal exit and incomplete request state; mod_php pre-application exploit confirmed, FPM source-analysis susceptibility with no complete exploit shown for this advisory. Configuration mitigation incomplete. Do not substitute RLIMIT_AS/RLIMIT_DATA.
3. PHP project advisory GHSA-6wmf-4rv5-p3rp / CVE-2026-109619: <https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp>. Distinct stale-global-state vulnerability. Latest advisory explicitly validates session lifecycle RCE for mod_php and FPM; FPM path requires an appropriate application operation after startup. Do not overgeneralize the OOM advisory's FPM uncertainty to this advisory. Configuration changes cover only particular paths.

Checked official pages on 2026-10-22. Research demonstration is not evidence of observed in-the-wild exploitation. No claim of active exploitation added.

## Internal link

Django October patch article gives a related, distinct ingress/regression workflow: `/blog/django-october-security-patch-regression/`.

## Cover

Publication owner generates original cover at `src/assets/covers/php2shell-request-lifecycle-patching.webp`, inspects full image and card crop, and replaces the temporary coverAlt with an accurate visual description before checks and publication.

## Publication cover audit

Built-in imagegen original cover generated 2026-10-22; source `generated_images/exec-935341fc-acc7-4ffe-9e02-3d90b9b7fa41.png`, project WebP 1672×941. Direction: layered paper entrance-latch cutaway, indigo/coral/ivory, diagonal close frame, gallery light. Prompt requested visible independent worker wheels behind the repaired entrance; no text/logos/UI. Actual image contains paper-cut maintenance figures working on inner gears. Full-size pixels and 360×203 center card crop inspected; accurate coverAlt replaced before gates.

## Preview environment limitation

Local Chromium launch failed before page rendering: `process_singleton_posix.cc` socket operation not permitted (2026-10-22). No flag/security bypass attempted. Full/card cover pixels were inspected. Local desktop/mobile/light/dark article preview remains unverified; publication is authorized despite this environmental preview limitation, with all source and technical gates still required. Production verification follows deployment.

## 2026-10-24 narrow update: CVE-2026-115560

Read the complete 2026-10-23 informational advisory at <https://www.php.net/archive/2026.php> (archive top entry, “Informational advisory: Session upload progress”). Stable identifier CVE-2026-115560 and normalized source URL were searched in article/research/queue; the existing PHP2Shell article is the same operational topic, so it is updated in place rather than creating a duplicate URL. Preserve original publishDate, cover, draft:false and featured:false; updatedDate reflects actual edit time in Asia/Taipei. No new series assignment.

The new condition requires configured session.serialize_handler=php_binary or php_serialize, then runtime ini_set switch to php before session_start(), with session upload progress still enabled. Official recommendation is session.upload_progress.enabled=0 until the next normal bugfix; previously disabled installations keep it, and applications never changing handler at runtime may keep the feature. No complete affected/fixed version list, CVSS, or in-the-wild exploitation claim for the new CVE is supplied by the short announcement. The old 8.5.12/8.4.27/8.3.36/8.2.35 patch claim is explicitly scoped to CVE-2026-109618/109619.

Added operational recommendation to inspect bootstrap/session initialization order; no exploit code or live service test was executed. Title and description manually revised to state concrete worker and handler checks, rather than a formulaic contrast. Full humanize-writing SKILL and zh-tw reference reviewed. Parent publication owner runs final formatting, content policy, checks, tests, build and deployment verification for the complete batch.

再核對 GHSA-6wmf-4rv5-p3rp Impact and reliability：multiple workers / recycling會降低單次請求利用成功率，不能消除漏洞條件。已修正舊稿「沒有足夠依據稱風險降低」過強說法，保留不能代替完整patch的結案規則。

官方archive實際HTML確認bookmark id="2026-10-23-1"及canonical href，已將新段來源連到此permalink；原頁time標示2026-10-23T10:12:28+00:00，未捏造日期。

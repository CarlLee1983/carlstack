# Octopus OIDC issuer identity boundary — source record

- Checked: 2026-10-28 Asia/Taipei.
- Article: `src/content/blog/octopus-oidc-issuer-identity-boundary.md`.
- Stable identifiers: CVE-2026-116870; Octopus SA2026-15.
- Canonical primary URL: https://advisories.octopus.com/post/2026/sa2026-15/
- Publisher: Octopus Deploy Security Advisories. Source credits internal testing by Nathan Willoughby at Octopus Deploy.
- Discovery 2026-09-09; patch 2026-09-14; public advisory 2026-10-27. New disclosure is in this daily news window; not a newly released patch.

## Deduplication

Searched blog, research and article queue for CVE, advisory URL, Octopus and issuer. No same source or Octopus issue found. Closest article `postiz-token-signing-authority.md` concerns issuer-side signing authority and cross-purpose JWT confusion. New outcome concerns external issuer trust coupled with subject/audience/account mapping; linked it without rewriting its core content. Full frontmatter inventory including drafts: network/API series max order21, this article22. Parent informed to reserve order.

Trail CLI and `.trail/cache` unavailable; used direct repository read/search fallback. Read AGENTS, content-guide, content schema and copywriting/humanize skills.

## Primary evidence and paragraph mapping

1. https://advisories.octopus.com/post/2026/sa2026-15/ — full advisory read. Supports opening + version section: High8.7, Linux/Windows, affected branches, fixed versions, Cloud already patched, no known mitigation, no known public announcements/malicious use, service account OIDC identity and attacker knowledge conditions. Carefully preserve “after2024.1.11865”, not inclusive. Advisory recommends2026.3.15973 at publication, not claimed permanently newest.
2. https://octopus.com/docs/api/authentication/openid-connect/other-issuers — full substantive documentation read (lines31–124), supports multiple identities/account, issuer exact match, subject case-sensitive with wildcard configuration, audience, expiration and signature, token exchange. Old `/docs/octopus-rest-api/...` URL redirects to this canonical path. The unrelated guessed `/docs/security/authentication/oidc-authentication` timed out; not used as evidence. Docs contains a typo in one discovery path line; article deliberately avoids copying that path.
3. https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation — inspected section3.1.3.7, issuer exactly matches iss. https://openid.net/specs/openid-connect-core-1_0.html#IssuerIdentifier — section16.15 path is part of issuer identity, same hostname is insufficient. Normative scope is OIDC; article does not transplant all ID token client rules into arbitrary access-token formats.
4. https://www.rfc-editor.org/rfc/rfc8725.html#section-3.8 — read section3.8; JWT cryptographic keys must belong to issuer, validation reject otherwise. Supports binding issuer+key not generic signature success.
5. https://octopus.com/docs/security/users-and-teams/service-accounts/ — full product explanation inspected as supporting background: API-only accounts/least privilege. No personal/private project details.

## Original analysis and limitations

- Fictional two-CI release-job example, trust checklist, account separation tradeoff and regression cases are original engineering recommendations.
- No Octopus installation, vulnerability reproduction, real token generation/exchange, or performance test executed. No exploit payload supplied.
- Public advisory does not reveal the exact parsing/normalization flaw. URI normalization examples are requirements derived from OIDC, not claimed Octopus root cause.
- Do not label confirmed exploitation. Vendor says it is not aware; this does not prove universal absence.
- Source-derived advisory facts are concentrated rather than reproducing advisory prose. No long quotations.
- Cover generated and reviewed by batch integrator; frontmatter alt must be reconciled to final actual image. No diagram required for this prose-focused article.
- Full technical publication gates and exact deployment/live verification owned by parent batch integrator. No claim those completed at drafting time.

## 整合美術驗收

正式imagegen原創封面1672×941，轉WebP；三張全尺寸與768×432卡片裁切已目視，無文字商標，圖說依實圖修正。Ghostty玻璃青紅深底，Octopus平面紫金雙路，LFM3淺藍白色陶瓷攝影，媒材/構圖/主色不同。文章沒有流程圖或架構圖，不使用Mermaid，也無需新增SVG元件。

雲端本機預覽於2026-10-28嘗試，Astro回Dev server process exited before becoming ready，browser連線拒絕；未改安全設定或繞限制。全尺寸與卡片封面目視完成，但320px／深淺色實頁目視未完成。三文章無可執行樣本或新增SVG。最後檔案frozen install使用Node24.22.1/pnpm12.1.0；預設pnpm11引擎拒絕後改官方corepack下載指定12.1.0，未更改lockfile。

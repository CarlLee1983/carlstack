# OpenWA request-target boundary research

## Scope and deduplication

- Article: `src/content/blog/openwa-request-target-boundaries.md`
- Research date: 2026-10-04, Asia/Taipei
- Baseline: main `ee92c3119a7ccb79493a025fc3228d30ee4f3260`
- Searched `src/content/blog`, `docs/research`, and `docs/article-queue.md` for the exact source URLs, both GHSA IDs, OpenWA, Baileys, SSRF, and path normalization. No source duplicate exists. General network and API articles are adjacent but do not cover preservation of the final target through parsing.
- Series: 現代網路協定與 API 平台架構, next order 14. The article links order 13 on end-to-end token handling. This article's distinct reader outcome is to validate final destinations before a privileged request, with separate gateway and SDK remediation inventories.

## Primary-source ledger

### GHSA-43g6-35h4-vpxc

<https://github.com/rmyndharis/OpenWA/security/advisories/GHSA-43g6-35h4-vpxc>

- Published 2026-10-03; Moderate; no known CVE on retrieval.
- OpenWA >=0.3.0 and <=0.23.7; fixed 0.24.0.
- Baileys inbound media download, default enabled. Sender can reach linked WhatsApp number; downloader uses configured session proxy or otherwise server network.
- Blind SSRF. Do not claim response exfiltration, RCE, or observed exploitation.
- Patch description constrains the library-resolved download address and re-upload answer to HTTPS, whatsapp.net or a subdomain, default port.
- Vendor mitigations: constrained egress / proxy egress, or MEDIA_DOWNLOAD_ENABLED=false.

### GHSA-qfv5-qr59-xrvw

<https://github.com/rmyndharis/OpenWA/security/advisories/GHSA-qfv5-qr59-xrvw>

- Published 2026-10-03; Moderate; no known CVE on retrieval.
- JavaScript @rmyndharis/openwa, Python rmyndharis-openwa, PHP rmyndharis/openwa <=0.5.0; fixed 0.5.1.
- Prerequisites: untrusted ID plus application holding OPERATOR or ADMIN key.
- Exact raw `..` ID can resolve a sub-resource DELETE to session deletion, removing session and WhatsApp auth state. Do not generalize to unauthenticated arbitrary account deletion.
- A caller-supplied `%2E%2E` is re-encoded; do not conflate with raw dot segment handling.
- Go and Java are not known affected; their new refusal is defense in depth.
- Advisories do not supply observed exploitation incidents. Lack of that evidence is not evidence of no exploitation.

### Additional primary evidence

- <https://github.com/rmyndharis/OpenWA/releases/tag/v0.24.0>: released Oct 3 03:08 (GitHub display); gateway release and SDK package version are distinct.
- <https://github.com/rmyndharis/OpenWA/blob/v0.24.0/sdk/javascript/src/http.ts>: fetched through GitHub connector; blob SHA `951cebda25ed2fe9b0aca4d3087d8a5f1172e1a9`. `encodeSegment` marks empty/dot IDs, `send` rejects them; raw path gets distinct parser-aware checking, and transport uses manual redirects.
- <https://url.spec.whatwg.org/#double-dot-url-path-segment>: dot-segment definitions and URL parser shortening.
- <https://nodejs.org/api/url.html#the-whatwg-url-api>: Node URL follows WHATWG behavior. The test runtime was Node 24.19.0, not the latest documentation's version heading.
- <https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html>: allowlists, redirect control, DNS and network-layer defense. These support general recommendations, not claims that every OpenWA code path was audited.

## Original test boundary

`node --test docs/research/openwa-request-target-boundaries.test.mjs`

Eight tests use only Node built-ins and synthetic `.test` URLs. They create no connection, install no OpenWA package, invoke no live service, and contain no real key or personal data. Coverage includes dot normalization, encoded-ID distinction, invalid-ID zero calls to a recording transport, exact valid target, immutable request plan, parsed media URL shape, and a changed destination's independent policy decision.

The test's restrictive ID alphabet is an original illustrative application contract. It is not an OpenWA-compatible ID validator. The media helper checks URL shape only and neither resolves DNS nor follows redirects. No assertion certifies the vendor patch or full proxy/HTTP stack behavior.

## Cover direction and review

Adjacent covers inspected before generation:

- `github-installation-token-opaque-contract.webp`: uninterrupted ribbon; studio object photography; low horizontal composition; white/teal/copper; diffuse light.
- `github-async-merge-receipt-completion-boundary.png`: tickets and distant completed object; translucent 3D still life; diagonal conveyor composition; peach/amber/cobalt; long sunlit shadows.
- New `openwa-request-target-boundaries.webp`: routes converge at a checkpoint; layered paper editorial illustration; overhead branching composition; navy/bone/rust/brass; tactile subdued shadows.

The new image differs in metaphor, medium, composition, dominant palette, and mood. Built-in image generation created an original 1672×941 image. Final asset is WebP. Full-size image and 320-pixel-wide card rendition were visually inspected: no text/logo, coherent request-target metaphor, clear checkpoint and blocked branch. No flow/architecture SVG is introduced.

Prompt: Landscape 16:9 editorial illustration, hand-cut paper map on deep ink navy. Two pale paths meet at a circular brass checkpoint. One approved path continues to a small safe white doorway; rust-red branch toward side opening stops at a closed geometric barrier. Flat layered paper and tactile shadows, overhead composition, warm bone/rust/brass accents, quiet analytical mood, legible at card size. No text, logos, brands, watermark, circuitry, padlocks, hackers, screens, code, arrows, or characters.

## Publication verification

Publication remains subject to the repository content gates, current-main integration, and deployment checks. Test results and any unrun visual QA must be reported separately; offline URL tests are not a substitute for the required site tests or production verification.

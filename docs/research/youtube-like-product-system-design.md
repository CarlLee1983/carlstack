# Source audit: original YouTube-like product architecture

Verified on 2026-10-15 UTC by opening primary official page bodies, not by relying on search-result snippets. This audit supports an original CarlStack product-design tutorial. None of these sources establishes YouTube's actual internal architecture.

## Highest-priority editorial corrections

1. A storage upload, a processing attempt, a playable asset, and a published video are different facts. Give them separate state transitions.
2. Do not mark an upload complete on a bare HTTP 200: S3's completion response can contain an embedded error.
3. Keep the application's own ordered part/ETag ledger. S3 explicitly says ListParts is for verification, not the source of a completion request.
4. Duplicate delivery requires idempotency. Source generation fencing alone does not distinguish two workers processing the same generation; add an attempt fencing token and immutable attempt-specific object keys.
5. Authorize at the CDN viewer boundary, including cache hits. Protect the origin separately.
6. Token expiry, origin denial, edge invalidation, browser caching, and already-downloaded bytes have different takedown behavior. Do not promise instant global erasure.

## Twelve core primary sources

### S1. Amazon S3 multipart-upload overview

URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html

Body sections checked: Multipart upload process; Parts upload; Multipart upload completion; Multipart upload listings; Checksums; pricing and lifecycle.

Verified facts:

- Parts can upload independently and retry independently. Reusing a part number overwrites the earlier part.
- Preserve part numbers and returned ETags for completion. ListParts pages contain up to 1,000 finished parts; pagination is necessary, and the application must not construct its completion request from that listing.
- The completed object's ETag need not be an MD5 hash. An explicitly supplied full-object checksum is validated; mismatch produces BadDigest.
- An initiated multipart upload does not expire by itself. Complete, abort, or use an incomplete-multipart lifecycle rule.
- Checksummed multipart uploads require consecutive part numbers beginning with 1.

Limits: Select the checksum algorithm/type and SDK behavior explicitly. An ETag is not a general-purpose content hash. Do not generalize the overview's checksum defaults across every historical SDK. Client UI completion is not server verification.

### S2. Amazon S3 CompleteMultipartUpload API

URL: https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html

Body sections checked: introduction; special errors; request syntax.

Verified facts:

- Completion concatenates only the supplied ordered part list, using the corresponding returned ETags.
- Processing can take minutes. A response beginning with HTTP 200 can contain an error in its body. AWS SDKs detect embedded errors; raw callers must parse them.
- Failed requests may need retries. NoSuchUpload can mean an invalid ID, an aborted upload, or an already-completed upload.
- CompleteMultipartUpload supports conditional headers, including If-Match and If-None-Match.

Limits: A timeout followed by NoSuchUpload is not sufficient evidence of success or failure. Reconcile the unique destination object's identity, size, checksum, and the application's expected upload record. Do not blindly create another source generation after an ambiguous response.

### S3. Amazon S3 AbortMultipartUpload API

URL: https://docs.aws.amazon.com/AmazonS3/latest/API/API_AbortMultipartUpload.html

Body sections checked: introductory semantics and cleanup verification.

Verified facts:

- Abort prevents further part uploads using that upload ID and frees previously uploaded-part storage.
- Part uploads already in flight may still finish. More than one abort may be needed to free all storage.
- AWS recommends ListParts to verify that no parts remain.

Limits: Stop clients and outstanding requests before final cleanup where possible. Treat abort as a cleanup workflow with reconciliation, not as a guarantee that every concurrent network transfer disappeared immediately. A lifecycle rule is a backstop, not the user-facing cancellation mechanism.

### S4. Amazon SQS standard queues: at-least-once delivery

URL: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html

Body checked: complete short page.

Verified facts: Redundant message copies can cause a message to be delivered again, including when a copy was unavailable during a receive or delete operation. AWS explicitly instructs applications to make repeated processing idempotent.

Limits: This supports duplicate-safe consumers, not an end-to-end exactly-once execution claim. A queue receipt or visibility lease is not an exclusive permanent ownership token for a transcode job. Do not claim that deleting one receipt prevents every duplicate execution.

### S5. AWS transactional-outbox guidance

URL: https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html

Body sections checked: Intent; Issues and considerations; Using an outbox table with a relational database.

Verified facts: Updating the business row and its outbox event in the same database transaction avoids the database-plus-broker dual-write gap. A relay reads committed events and publishes them. Duplicate messages remain possible, so consumers must be idempotent; rolled-back transactions must not emit events.

Limits: The database transaction does not atomically commit an S3 object, a broker send, and a CDN cache. A crash after sending but before recording relay progress can resend. Use durable event IDs, deduplication or conditional state transitions, and reconciliation. Avoid repeating the page's broad FIFO/exactly-once phrasing as a claim of exactly-once external side effects.

### S6. CloudFront signed-cookie validation and expiry

URL: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-cookies.html

Body sections checked: How signed cookies work; Prevent misuse; expiry behavior.

Verified facts:

- CloudFront validates the signature and policy before deciding whether to serve the cached object or fetch from origin.
- Custom policies can cover multiple files through a resource wildcard. Signed-cookie attributes do not create separate cached file variants.
- Expiry is checked at each HTTP request. A transfer started before expiry may finish afterward; later requests fail after expiry.
- OPTIONS requests are not signature-checked, so an origin must not return protected content for OPTIONS.

Limits: The CDN validates the issued policy; it does not automatically read a changed video-access row from the application's database on every request. Scope policies narrowly and use short, renewable authorization lifetimes. Verify actual browser/player cookie behavior.

### S7. CloudFront: choosing signed URLs versus signed cookies

URL: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-choosing-signed-urls-cookies.html

Body checked: complete short page.

Verified facts: AWS explicitly suggests signed cookies for the many restricted files belonging to an HLS video. Signed URLs fit individual files or clients without cookie support. When both mechanisms are present, a signed URL takes precedence.

Limits: A manifest URL's query string is not automatically inherited by each segment URI. A cookie-based design still needs a compatible domain/path, player credential behavior, and authorization coverage for playlists, media, initialization segments, and any protected keys.

### S8. CloudFront Origin Shield

URL: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/origin-shield.html

Body sections checked: benefits; use cases; region selection; costs.

Verified facts: Origin Shield is another caching layer. It can consolidate concurrent requests for the same uncached object, reducing origin fetches to as few as one. It adds charges and may offer little value for low-cacheability or infrequently requested content. AWS recommends selecting a region with low origin latency.

Limits: Say it reduces origin load, not that it guarantees one global origin request forever. Cache keys, expiration, failures, and request patterns affect the result. It does not replace authorization or make a cold catalog free to serve.

### S9. CloudFront invalidation versus versioned filenames

URL: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html

Body checked: complete short page.

Verified facts: Invalidation removes edge-cached objects before expiry; a later request goes back to origin. AWS recommends versioned names for frequent updates. Invalidation does not remove copies already cached locally or in a corporate proxy.

Limits: Invalidation alone is not revocation if the origin can still return the object. New versioned filenames do not erase old URLs. Do not promise to recall downloaded or buffered bytes.

### S10. RFC 8216: HTTP Live Streaming

URL: https://www.rfc-editor.org/rfc/rfc8216.html

Body sections checked: 1; 2; 3; 4.3.3.4; 4.3.3.5; 6.2.4; 6.3.1.

Verified facts: A master playlist describes variant streams; media playlists identify media segments by URI, optionally byte range. A client obtains playlists and segments and can switch variants. EXTINF describes segment duration. EXT-X-ENDLIST indicates no further media segments; a playlist marked VOD must not change. The RFC does not specify the client's adaptive-bitrate selection algorithm.

Limits: RFC 8216 describes protocol version 7 from 2017; it is not a complete account of later Low-Latency HLS extensions. Neither one segment length nor one bitrate ladder is universal. Treat ladder choices and encoder settings as design assumptions.

### S11. MySQL 8.4 UPDATE statement

URL: https://dev.mysql.com/doc/refman/8.4/en/update.html

Body sections checked: single-table syntax; WHERE behavior; current column values; changed-row count.

Verified facts: WHERE identifies rows eligible for UPDATE. Expressions can use the current column value. The documented UPDATE result counts changed rows; assigning the existing value need not change a row.

Limits: A compare-and-set pattern must put expected generation/token/state in the UPDATE itself. A preceding ordinary SELECT followed by an unconditional UPDATE is not equivalent. Handle the zero-row result. Avoid no-op ambiguity by changing state or incrementing a version, and check the actual client driver's affected-row semantics.

### S12. MySQL 8.4 InnoDB locking by statement

URL: https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html

Body sections checked: locking overview; unique-index point lookups; UPDATE locks.

Verified facts: UPDATE takes exclusive locks on encountered records; a unique-index search for one unique row needs only the corresponding index-record lock. Poor indexing can make updates scan and lock much more data. Ordinary SELECT typically reads a snapshot without these locks.

Limits: Use InnoDB and an indexed identity predicate. Keep transactions short. A database lock controls database state; it does not fence a worker's independent write to an S3 key. CAS fencing and immutable output names are an application design built on these primitives.

## Two narrow supporting references

### Origin access control

URL: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html

Verified body: OAC is the recommended means of authenticating CloudFront requests to S3. The example bucket policy scopes access to the CloudFront distribution. OAC requires a regular S3 bucket origin rather than an S3 website endpoint. The always-sign option provides HTTPS between CloudFront and S3.

Design limit: OAC is origin access protection, not viewer entitlement. Keep both layers, and do not leave an alternate public bucket URL as a bypass.

### Invalidation lifecycle

URL: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation_Requests.html

Verified body: Invalidations have inspectable status and can be in progress. AWS describes forwarding requests to edge locations within seconds, after which each edge starts processing. Submission is not proof that processing is complete. Invalidations cannot be cancelled once submitted.

Design limit: Track the provider's terminal result and independently probe denied paths. Do not turn the forwarding-time description into a global completion SLA.

## Original design deductions for the tutorial

These are proposed engineering choices, not statements that AWS, MySQL, or YouTube implements this entire architecture.

### Upload retry and recovery

- Create a server-owned upload record containing owner, video ID, source generation, unique object key, storage upload ID, expected size, checksum policy, and durable part acknowledgements.
- Let retries reuse the same part number only for the same intended bytes. Never let a resumed upload silently switch the source file.
- Treat a lost completion reply as an ambiguous outcome. Reconcile storage with the expected record before deciding to retry completion, restart, or mark failed.
- Commit the verified source identity and processing outbox event together. A sweeper recovers storage-complete/database-incomplete cases.

### Two dimensions of worker fencing

Use source generation to reject work for replaced input, and an independently advanced attempt token to reject an earlier worker from the same generation. Store generated media under immutable keys such as video/{id}/g/{generation}/attempt/{token}/... . Publish a database pointer only after checking all referenced outputs exist and pass validation.

The article's final activation protocol supersedes the initial sketch: lock Video and Job in fixed order, return any already-accepted completion receipt before current-lease checks, validate generation/token/database-time lease and allowed state, compare the expected active bundle pointer/revision, atomically mark Job terminal and persist its completion receipt, activate the asset, apply any authorized visibility change, then emit the transaction's final metadata revision/state. Private/unlisted assets can be activated without becoming public. Immutable output names and retained references protect existing playback sessions. This is conceptual pseudocode, not an executed MySQL implementation.

Takedown and replacement must update the same authoritative row/state that publication checks. Generation/token validation in a separate earlier SELECT leaves a race. A lease heartbeat improves liveness; the conditional publication and immutable namespace provide the safety boundary.

### Private playback and takedown

Choose viewer-side authorization that is evaluated even on a cache hit, plus an origin that cannot be bypassed. Scope authorization to the intended video generation. A public manifest with guess-resistant URLs is not an entitlement system.

On takedown, deny new playback grants, fence publication, block or remove the origin objects, and invalidate the affected playlist/media namespace. Track those steps independently. Short authorization expiry bounds new requests under the existing policy, but does not retroactively cancel a transfer. A stricter per-request revocation requirement needs an additional edge authorization mechanism with a deliberately designed freshness and failure policy.

State the promise precisely: stop future authorized delivery after the designed propagation/expiry window. No HTTP/CDN design can retrieve already-downloaded copies from a viewer.

## Suggested verification tests

1. Retry a successfully stored part after losing its acknowledgement; verify no duplicated bytes in the final object.
2. Lose the completion response; return NoSuchUpload on retry; verify reconciliation reaches the correct state.
3. Keep a part request in flight during abort; verify eventual empty-part cleanup.
4. Deliver the same queue event twice and allow both workers to run; exactly one attempt may publish.
5. Replace the source while an old worker runs; the old generation must not become current.
6. Expire worker A's lease, assign B a newer token, then let A finish; A's CAS must fail and A must not overwrite B's keys.
7. Trigger takedown just before publication; the publication guard must fail.
8. Warm a segment into CDN cache, then request it without valid authorization; expect denial despite the cache hit.
9. Expire credentials between consecutive segment requests; verify renewal or a deliberate playback failure.
10. Invalidate while the origin remains accessible, then repeat with the origin blocked; demonstrate why invalidation alone is insufficient.

## Scope exclusions

- Google Cloud Storage resumable sessions were optional and are omitted to keep the implementation story focused.
- No claim is made about YouTube's actual queues, databases, upload protocol, cache hierarchy, or moderation implementation.
- Cost examples, throughput targets, bitrate ladders, retention periods, and service-level objectives require separately labeled assumptions or measurements.

## Editorial scope and provenance

New series: 產品系統設計實戰, order 1. This article follows a fictional creator through the complete VOD product lifecycle. Existing youtube-video-upload-transcoding-pipeline.mdx covers encoding/GOP/ABR and is linked both ways; no unverified scale numbers or company-internal implementation claims are inherited. Previous main 743c3f9 and article queue/research were checked for duplicates.

Cover direction: prior cancellation/scion covers use cream-background ink illustration; this cover uses translucent film through a glass gate, teal studio photography, coral side lighting and fanning screens. Original built-in image generation, source 1672×941, WebP, full-size and 480×270 card visually checked. No third-party image used.

All traffic/capacity/SLO numbers are labeled teaching assumptions. API and transaction examples are conceptual, not executed against a database or real video pipeline. Technical review explicitly corrected multipart ledger handling, separate metadata revision, per-attempt fencing, expected-bundle CAS, duplicate completion receipts, private asset activation and retained playback references.

## Claim-to-section map

- Sections 1–4: original fictional product requirements, independent upload/asset/visibility states and educational calculations; S5 supports outbox tradeoffs. S11/S12 support only database primitives, not the full proposed architecture.
- Section 5: S1/S2/S3 multipart ledger, ambiguous completion, embedded errors, abort cleanup; application reconciliation is a proposed protocol.
- Section 6: S4 supports duplicate delivery; generation, attempt token, lease validation, completion receipt, bundle revision CAS and immutable namespace are original design choices. Private playable-asset activation is separate from public visibility.
- Section 7: S6/S7/S8 support HLS, signed-cookie selection and viewer validation; a five-minute grant is a teaching assumption, not a recommendation or vendor guarantee.
- Section 8: S9 supports Origin Shield; bandwidth/cache examples are arithmetic assumptions, not a benchmark or provider price quote.
- Section 9: original metadata-revision/event design; statistics and discovery have separate consistency contracts.
- Section 10: S10 and supplementary invalidation/OAC pages support cache and origin limitations; takedown ordering and tombstone retention are proposed application behavior.
- Sections 11–12: unexecuted fault-injection plans and exercises; no real video/SQL/concurrency/load-test pass claimed.

## Verification boundary

Original cover inspected at full size and card size. Local full-page preview attempted with repo command; dev process exited before ready, cloud browser localhost returned connection refused. No bypass or visual-pass claim for that preview. Final technical gates and production checks are recorded with the publication result. Existing diagram-color tests have a known selector-matching blind spot outside this article's scope, so new diagrams receive independent visual inspection.

---
title: "CI speed-up: build caches kept, parallel pnpm check ruled out"
author: Carl
date: 2026-10-16
branch: main
cost: { minutes: 39, tokens: 166161 }
touches:
  - AGENTS.md
  - ".github/workflows/ci.yml"
  - ".github/workflows/deploy.yml"
  - docs/testing.md
  - package.json
  - pnpm-lock.yaml
---

## Decided

- `ci.yml` 與 `deploy.yml` 以 `actions/cache` 保存 `node_modules/.astro`（圖片最佳化）與 `node_modules/.cache/prettier`；`format:check` 用 `prettier --check --cache --cache-strategy content`（PR #17）。實測 PR CI 從 3m11s（冷）降到 1m8s（熱），`pnpm check` 從 142s 降到 37s。
- 部署前的驗證不跳過：文章直推 `main`，`deploy.yml` 是唯一 gate。ADR 0006 要求保留 `schedule`。

## Tried and ruled out

- 並行 `astro check` 與 `astro build`：兩者都以 `fs.writeFileSync` 非原子重寫 `.astro/` 型別檔，有競態，會造成偶發失敗。
- 只把 Prettier 並行（`pnpm run --parallel "/^check:/"`）：本機三輪只省約 1s（28/28/30s 對 27/27/29s），CPU 互搶；之前量到的「22s」是量測誤差。
- 縮短 checkout `fetch-depth`：只省約 5s，force push 時 `event.before` 不存在，不划算。

## Watch out

- PR 範圍存的快取 `main` 讀不到；合併後第一次部署是冷的，第二次起才有效果。
- 快取 key 含 `pnpm-lock.yaml` 雜湊，依賴更新後第一次執行會回到冷建置。

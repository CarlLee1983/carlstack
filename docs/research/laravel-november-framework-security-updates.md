# Laravel 12 與 13 的 11 月安全更新：來源查核

- 2026-11-23 公開的維護者公告：[GHSA-8h64-cpq2-9h2g](https://github.com/laravel/framework/security/advisories/GHSA-8h64-cpq2-9h2g) 與 [GHSA-cq3g-fj94-c8p3](https://github.com/laravel/framework/security/advisories/GHSA-cq3g-fj94-c8p3)。不同版本門檻分別照公告，不把 CVSS 或公告公開當成實際利用證據。
- 11/24 台灣時間 10 時段：核對 Git 標籤與 [Packagist 官方索引](https://repo.packagist.org/p2/laravel/framework.json)，確認 v12.73.0 和 v13.43.0；當時尚未取得 v12.74.0。GitHub v12.74.0 release 頁也回傳 404。續作時重查發行狀態。
- 查重：PHP 11 月安全更新原篇關注 PHP 執行環境，本篇針對 Laravel 套件與兩份新公告。未執行漏洞重現，也未測正式 Laravel 服務。

- 原創 WebP 1280 × 720；已核全幅、4:3、16:10 封面裁切。正文無架構圖。

- 2026-11-25 台灣時間 00:22（UTC 2026-11-24 16:22），[GitHub 正式發布 v12.74.0](https://github.com/laravel/framework/releases/tag/v12.74.0)，且 [Packagist 已列出該版本](https://packagist.org/packages/laravel/framework#v12.74.0)。保留原始發布日期，更新正文與升級建議；未在讀者專案安裝或驗證正式環境。

---
title: "Laravel 12 與 13 的 11 月安全更新"
description: "整理 Laravel 11 月 23 日兩份安全公告的版本差異，說明修補門檻、套件發行與執行環境的確認方式。"
publishDate: 2026-11-24T10:11:04+08:00
updatedDate: 2026-11-25T10:04:51+08:00
draft: false
featured: false
tags: [Laravel, PHP, 資安]
cover: ../../assets/laravel-november-framework-security-updates.webp
coverAlt: "深色背景上的四個伺服器模組，其中一個亮著琥珀色指示燈。"
---

Laravel 12.74.0 已在台灣時間 11 月 25 日凌晨[發布](https://github.com/laravel/framework/releases/tag/v12.74.0)，[Packagist](https://packagist.org/packages/laravel/framework#v12.74.0) 也已收錄。11 月 24 日初刊時，這個版本尚未上架；原本留在 12.x 的服務，現在不用升到 13.x 就能補齊 11 月 23 日公布的兩項修正。

## 兩份公告對應的版本

[GHSA-8h64-cpq2-9h2g](https://github.com/laravel/framework/security/advisories/GHSA-8h64-cpq2-9h2g) 是資源耗盡問題，官方列為 High（CVSS 7.5）。一般大小的 JSON 請求也可能讓程式消耗過量 CPU 和記憶體，不需登入。Laravel 12 的修補門檻是 `12.74.0`，Laravel 13 是 `13.38.0`。因此光調低代理伺服器的 request body 上限，不能當成已修補。

[GHSA-cq3g-fj94-c8p3](https://github.com/laravel/framework/security/advisories/GHSA-cq3g-fj94-c8p3) 是欄位驗證問題，官方列為 Moderate（CVSS 5.4）。某些合法輸入結構中的欄位，可能未套用預期的萬用字元驗證規則。Laravel 12 的修補門檻是 `12.73.0`，Laravel 13 是 `13.43.0`。官方公告沒有提供 CVE，也沒有說兩項漏洞已遭利用。

同時涵蓋這兩項修補，12 系列至少要 `12.74.0`，13 系列至少要 `13.43.0`。這是兩份公告的共同門檻；專案實際裝到哪一版，仍要看 `composer.lock`。

## 更新後核對承接流量的成品

以容器部署為例，先核對 `composer.lock`，再用鎖定檔建立新映像，記下實際部署的映像 digest。核對每組接收 API 流量的容器，包括滾動更新期間的舊實例，確認正在執行的版本與新映像相符。使用長駐 PHP 程序時，也要按既有部署流程讓舊程序退場。只有更新工作站或 CI 的鎖定檔，線上流量仍可能走到舊版本。

驗收用原本合法的 API 請求。以訂單明細為例，跑一筆合法項目清單、一筆缺少必要欄位的項目，再確認會正常回報欄位錯誤、多筆明細的回應格式沒有變。服務重啟或容器替換後，對照正常流量下的延遲、PHP 程序記憶體和 worker 飽和訊號。正常流量檢查用來抓升級回歸，補丁是否入場仍要查套件版本及映像覆蓋率。這裡核對的是公告與發行紀錄，未執行漏洞重現或對正式服務施壓。

## 專案裝不到修補版時

先查哪個 Composer 版本限制擋住更新，確認是根專案、相依套件，還是 PHP 版本條件，再決定要改哪一段。若暫時只能部署 12.73.0，欄位驗證問題已有修補，資源耗盡問題仍未修。對外 JSON 入口的流量限制和 worker 告警可作為暫時措施，但不能代替更新。

可從一張服務清單開始：記下實際 Laravel 版本、部署映像、公開 JSON 入口與兩份公告的修補狀態。應用框架的版本和 PHP runtime 的版本要分欄記錄；PHP 本身的更新流程另見 [PHP 11 月安全更新的執行環境查核](/blog/php-november-security-runtime-verification/)。

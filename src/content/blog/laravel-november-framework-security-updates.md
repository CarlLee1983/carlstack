---
title: "Laravel 12 與 13 的 11 月安全更新"
description: "整理 Laravel 11 月 23 日兩份安全公告的版本差異，說明修補門檻、套件發行與執行環境的確認方式。"
publishDate: 2026-11-24T10:11:04+08:00
draft: false
featured: false
tags: [Laravel, PHP, 資安]
cover: ../../assets/laravel-november-framework-security-updates.webp
coverAlt: "深色背景上的四個伺服器模組，其中一個亮著琥珀色指示燈。"
---

Laravel 在 2026 年 11 月 23 日公開兩份安全公告。仍在 Laravel 12 的服務，兩份公告列的修補版本不同，發行狀態也不一樣。更新前需要把公告上的門檻、套件庫實際可取得的版本、以及目前接收流量的版本分開核對。

## 兩份公告對應的版本

[GHSA-8h64-cpq2-9h2g](https://github.com/laravel/framework/security/advisories/GHSA-8h64-cpq2-9h2g) 是資源耗盡問題，官方列為 High（CVSS 7.5）。一般大小的 JSON 請求也可能讓程式消耗過量 CPU 和記憶體，不需登入。Laravel 12 的修補門檻是 `12.74.0`，Laravel 13 是 `13.38.0`。因此光調低代理伺服器的 request body 上限，不能當成已修補。

[GHSA-cq3g-fj94-c8p3](https://github.com/laravel/framework/security/advisories/GHSA-cq3g-fj94-c8p3) 是欄位驗證問題，官方列為 Moderate（CVSS 5.4）。某些合法輸入結構中的欄位，可能未套用預期的萬用字元驗證規則。Laravel 12 的修補門檻是 `12.73.0`，Laravel 13 是 `13.43.0`。官方公告沒有提供 CVE，也沒有說兩項漏洞已遭利用。

同時涵蓋兩項修補，12 系列至少要 `12.74.0`，13 系列至少要 `13.43.0`。查核時，[GitHub 的 v13.43.0 發行紀錄](https://github.com/laravel/framework/releases/tag/v13.43.0)及 [Packagist 發行清單](https://repo.packagist.org/p2/laravel/framework.json)可找到 v13.43.0。12 系列則只確認到 v12.73.0，尚未在 Git 標籤或 Packagist 找到 v12.74.0。公告上的修補門檻是版本判定依據，不能據此宣稱套件已能安裝。讀者部署前應再查官方套件庫，避免把這個時間點的查核當成長期狀態。

## 更新後核對承接流量的成品

以容器部署為例，先核對 `composer.lock`，再用鎖定檔建立新映像，記下實際部署的映像 digest。核對每組接收 API 流量的容器，包括滾動更新期間的舊實例，確認正在執行的版本與新映像相符。使用長駐 PHP 程序時，也要按既有部署流程讓舊程序退場。只有更新工作站或 CI 的鎖定檔，線上流量仍可能走到舊版本。

驗收用原本合法的 API 請求。以訂單明細為例，跑一筆合法項目清單、一筆缺少必要欄位的項目，再確認會正常回報欄位錯誤、多筆明細的回應格式沒有變。服務重啟或容器替換後，對照正常流量下的延遲、PHP 程序記憶體和 worker 飽和訊號。正常流量檢查用來抓升級回歸，補丁是否入場仍要查套件版本及映像覆蓋率。這裡核對的是公告與發行紀錄，未執行漏洞重現或對正式服務施壓。

## 12 系列暫時沒有完整修補包時

能取得 v12.73.0 時，可先評估部署已發布的驗證修補，同時把可用性問題保留為未修。對外 JSON 入口若原本已有可控的流量限制與 worker 告警，可確認它們是否覆蓋高流量路由，以及誰會收到告警。這些是縮小影響和提早發現的方法，不保證抵擋已知漏洞。也可以評估升至已具修補的 13 系列，但要把框架大版本相容性與回滾時間一起算進去，不能用緊急更新為由跳過契約測試。

可從一張服務清單開始：記下實際 Laravel 版本、部署映像、公開 JSON 入口與兩份公告的修補狀態。應用框架的版本和 PHP runtime 的版本要分欄記錄；PHP 本身的更新流程另見 [PHP 11 月安全更新的執行環境查核](/blog/php-november-security-runtime-verification/)。

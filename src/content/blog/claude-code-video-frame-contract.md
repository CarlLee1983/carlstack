---
title: "Claude 寫出影片程式後，先驗收每一幀的時間契約"
description: "從寶玉的 Claude 程式影片拆解出發，建立 Canvas 逐幀繪製、旁白時間對齊與 MP4 驗收流程，釐清可重播的程式為何仍需要渲染環境與人工審片。"
publishDate: 2026-10-01T15:05:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
series: AI Agent 工程化與工作流實戰
seriesOrder: 51
cover: ../../assets/covers/claude-code-video-frame-contract.png
coverAlt: "透明琥珀色動畫膠片上，青色圓形逐格位移，膠片依序通往金屬卷軸，呈現獨立畫格組成影片的關係。"
---

讓 Claude 畫出一個會動的網頁，距離交付一支影片還有一段路。網頁預覽可以容忍載入延遲，影片卻會把那一瞬間永久編進檔案：空白字幕、尚未出現的圖片、晚了一拍的旁白，都會變成成品的一部分。

寶玉在 2026 年 9 月 30 日的[〈Claude Opus 5.5 是怎麼做出影片的〉](https://x.com/dotey/status/2105181393638531536)（[X 長文頁](https://x.com/i/article/2105179653925150720)）拆開了這個流程：模型規劃分鏡、撰寫繪圖與動畫程式，再由外部工具渲染、合成。他的案例使用 JS 與 Canvas，配音另交給語音工具。

我的判斷是，這條路線最值得學的地方，是把影片變成可以定位問題、局部修改的工程產物。要得到這個好處，第一份驗收契約就得寫清楚：給定第幾幀，程式應該畫出什麼。

## 模型負責寫程式，渲染器負責交付畫格

[Anthropic 的 Opus 5.5 發布公告](https://www.anthropic.com/claude-opus-5-5)將重點放在程式開發、電腦操作與知識工作。它不能作為「新增原生影片生成能力」的證據。本文討論的是程式產生畫面這條路線，也不把社群個案延伸成所有模型的輸入輸出限制。

實作時可以先把任務拆成三個可驗收的產物：

- 分鏡規格：每段旁白、畫面元素、起訖時間與轉場目的。
- 畫格程式：輸入時間或幀號，輸出該時刻的完整畫面。
- 成片檔案：編碼後的影片與音軌，連同解析度、幀率、長度檢查結果。

這裡的停止規則是：**只有預覽網頁，不能宣告影片已交付。** 模型說完成時，宿主至少要能找到輸出檔案並讀取其媒體資訊。這與[Agent 團隊的交接驗收](/blog/claude-agent-team-acceptance-boundaries/)是同一個問題：下游需要具體產物，不能只收到上游的完成摘要。

## 第 N 幀應該能獨立重畫

以 30 fps、10 秒為例，共有 300 幀。幀號採零起算時，第 75 幀對應 2.5 秒；最後一幀是第 299 幀，對應約 9.967 秒。時間軸的終點不能多截一張，否則片長會增加。

以下是可直接放進瀏覽器 HTML 的最小 Canvas 範例。它刻意不包含配音、編碼或截圖工具，用來驗證「先畫哪一幀都得到同一結果」：

```html
<canvas id="stage" width="1280" height="720"></canvas>
<script>
  const canvas = document.getElementById("stage");
  const ctx = canvas.getContext("2d");
  const fps = 30;
  const totalFrames = 300;

  window.renderFrame = (frame) => {
    if (!Number.isInteger(frame) || frame < 0 || frame >= totalFrames) {
      throw new RangeError("frame must be an integer from 0 to 299");
    }
    const t = frame / fps;
    const progress = Math.min(t / 3, 1);
    const eased = progress * progress * (3 - 2 * progress);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#faf6ec";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#176b70";
    ctx.beginPath();
    ctx.arc(160 + 960 * eased, 360, 48, 0, 2 * Math.PI);
    ctx.fill();
  };
  window.renderFrame(0);
</script>
```

每次呼叫都重新畫完整畫面，位置由幀號計算。不要寫成每次呼叫就把座標加五：那會讓第 75 幀的結果依賴前面執行過哪些幀，補渲染和分段輸出也會跟著失效。

這份程式的範圍很小，沒有字型、遠端素材與隨機數。若加上這些依賴，就要固定素材版本、等待載入完成、固定亂數種子，並記錄瀏覽器與繪圖環境。相同幀號能重畫，是程式設計要求；跨作業系統逐像素一致，則是額外的環境驗證，不能直接保證。

## 先取得旁白，再安排它指向的畫面

如果旁白說到「圓形向右移動」時，畫面還停在原處，動畫再流暢也會干擾理解。教學影片應先穩定講稿與配音，再排需要同步的動作。

[ElevenLabs 的帶時間資訊語音接口](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps)會回傳音訊，以及原始文字、正規化文字的字元起訖時間資訊；文件也將對齊欄位標為可為空。接入時要先確認對齊結果存在、長度與文字吻合，再拿它排字幕或鏡頭。

字元時間不能不經處理就當成詞或句子的時間。數字、縮寫與標點可能在語音正規化後改變，應以服務回傳的對齊文字建立映射。假設一個事件從 2.51 秒開始，30 fps 下可用 `ceil(2.51 × 30) = 76` 指定第一個不早於該時間的畫格；這是本文的排程選擇，不是語音服務保證的語意精準度。

旁白一旦重生成，舊的對齊時間就應一起失效。保留「新音檔配舊時間軸」是最容易被畫面截圖漏掉的錯誤。

## 可跳轉的動畫，仍需要可靠的截圖環境

[HeyGen 的 HyperFrames 工程文章](https://www.heygen.com/research/html-to-video)記錄了普通瀏覽器截圖會遇到的非同步繪製問題。其 Linux 路線使用特定的 `chrome-headless-shell` 與逐幀控制；macOS、Windows 則採用另一套截圖與等待策略。這是有平台前提的方案。

這個案例提醒我們：能跳到指定時間，不代表該幀已經繪製完成。選現成渲染工具時，要在實際部署環境確認它如何等待畫面穩定。寫自己的捕捉程式時，則要把素材載入、指定時間、繪製完成與截圖分開驗收。

不要因為本機預覽順暢，就推論 CI 的字型、圖片與嵌入片段都會準時出現。同樣地，「不讀系統時間、不用未固定的亂數、不在渲染時連網」是合理的必要控制，卻不足以證明所有環境完全一致。

## MP4 能播放，是驗收的起點

如果已有命名為 `frame-00000.png` 起的 300 張圖，以及至少 10 秒的 `narration.wav`，下面的 [FFmpeg 指令](https://ffmpeg.org/ffmpeg.html)可合成這個練習。需要本機 FFmpeg 支援 `libx264`；它不是完整專案初始化步驟。

```bash
ffmpeg -framerate 30 -start_number 0 -i frame-%05d.png \
  -i narration.wav -t 10 \
  -c:v libx264 -pix_fmt yuv420p -c:a aac \
  -movflags +faststart output.mp4

ffprobe -v error -show_entries \
  stream=codec_type,width,height,r_frame_rate,duration:format=duration \
  -of json output.mp4
```

這個例子固定輸出 10 秒，因此超過 10 秒的旁白會被截斷；正式影片應先量測音訊長度並決定片長，不能直接照抄。若旁白不足 10 秒，也必須明確決定尾段留白或補音，不能把「檔案有產生」當成時間軸正確。

本文建議的最小驗收包含三輪：

1. 用 [ffprobe](https://ffmpeg.org/ffprobe.html) 查媒體資訊：1280 × 720、30 fps、影片與音訊都存在，長度符合分鏡。
2. 看代表畫格：每段開頭、轉場前後、字幕最長的位置，確認文字、裁切與素材沒有問題。
3. 聽完整成片：查旁白是否被切掉、音量是否遮住講解、畫面是否在正確詞句出現。

靜態截圖能發現排版問題，卻無法證明聲畫同步或節奏自然。即使模型能檢查畫格，完整播放仍然是必要的人工作業。

## 先做十秒，量出一次修改的代價

程式影片適合圖表、流程說明與可精確定位的字幕。這是工程上的選擇：修改一個時間點或元素後，可以追蹤受影響的畫格。但程式碼正確不會自動帶來好分鏡，局部修改也可能牽動其他元素的佈局；文字內容仍須校對。

需要寫實人物或實拍質感時，可以把已取得的片段當成素材，再用程式管理字幕與時間軸。選路線應看素材與控制需求，不用「每次都一樣」或「文字永遠正確」替整類工具下保證。

下一步先做一支十秒教學片：一段旁白、一個圖形、一個重點。保留分鏡、音檔、對齊資訊、程式與成片，再只改一次關鍵詞的出現時間。記錄改了哪些檔案、重渲染花多久、驗收發現什麼。這組結果，比一句「一句話生成影片」更能判斷這條流程是否適合你的工作。

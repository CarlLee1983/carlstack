# AWS Nitro Sandboxes 查核紀錄

查核日期：2026-11-10 UTC。正式稿：`src/content/blog/aws-nitro-sandboxes-isolation-attestation.md`。

## 去重與範圍

- main 起點：`11772b1a698c631340ee98d36836b258e1ce24af`。對 `src/content/blog`、`docs/research`、`docs/article-queue.md` 搜尋原始 URL、`nitro-sandboxes-eks-ecs-ec2`、`Nitro`，無既有核心主題。
- 既有沙箱文分別談狀態與生命週期、容器外檔案 API。新篇聚焦 11/9 AWS 功能及其部署條件、KMS verifier、CPU／記憶體成本，讀者決策不同。已雙向連結 `ai-agent-runtime-durable-scaling`，另引用 `sandbox-authority-boundary-acceptance`。
- Nitro 納入 AI Agent 工程化與工作流實戰，使用 order 113；推送前再核對最新 main 的系列次序與重複主題。
- `trail map` 與 `trail ask` 不可用（command not found），`.trail/cache/INDEX.md` 不存在，改用限定目錄搜尋與來源閱讀。
- 沒有部署 AWS、執行漏洞、做隔離攻擊或效能測試。驗收步驟和成本比較是工程建議。

## 一手資料與核對重點

1. https://aws.amazon.com/about-aws/whats-new/2026/11/nitro-sandboxes-eks-ecs-ec2/
   - Posted Nov 9, 2026；EKS、ECS、EC2，所有商業區域，功能不加價。near-native performance 和成本節省為 AWS 宣稱，未實測。
2. https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-ec2-nitro-sandboxes.html
   - 第一層硬體 guest、Firecracker 經 Nitro Enclaves driver；confidential 預設，direct 共享 guest memory 且無 attestation。
   - supported instance list、GPU passthrough unavailable、vCPU 總配置最多 5 倍、記憶體不 overcommit、vCPU／memory 不能執行中 resize。父機 I/O 與資源仍為共同依賴。
3. https://docs.aws.amazon.com/eks/latest/userguide/sandboxing.html
   - shim／Firecracker／guest agent／containerd，runtime classes 及父機信任差異。EKS isolated 不可直接等同 EC2 direct，名稱處於不同層。
4. https://docs.aws.amazon.com/eks/latest/userguide/sandboxing-isolated-setup.html
   - Auto Mode 整合；自管節點 custom AMI + EnclaveOptions.Enabled。每 pod 一個 Sandbox，annotations 在 controller 的 pod template。
5. https://docs.aws.amazon.com/eks/latest/userguide/sandboxing-confidential-setup.html
   - 最終 mutation 後 pod spec 產生 Cedar policy，policy hash PCR17，KMS 必須驗 PCR17 與 PCR8:ServiceName=eks.amazonaws.com。
   - Logs 在 confidential profile 預設仍允許，exec 預設拒絕。文章沒有聲稱 confidential 自動封鎖所有輸出。
6. https://docs.aws.amazon.com/eks/latest/userguide/sandboxing-security-model.html
   - Pod spec／policy 是 trusted inputs，工作程式不在機密保護的敵對面內。Pod Identity 可被父機取得、logs／EBS／EFS／外連可能洩漏。
   - 無法防止父機拒絕服務。與記憶體隔離分開判讀。ConfigMap／Secret／projected volume 內容仍由父機控制；依獨立審閱補入 trust anchors 固定於映像與 TLS 驗證。
7. https://docs.aws.amazon.com/eks/latest/userguide/sandboxing-network-isolation.html
   - 移除網路裝置，也失去 DNS／IMDS／Pod Identity／KMS encrypted image 能力；vsock 仍有通道。
8. https://docs.aws.amazon.com/eks/latest/userguide/sandboxing-limitations.html
   - hostNetwork、資源原地調整、EBS 共用與 Auto Mode 初期限制；SMT core scheduling 影響單 vCPU sandbox 密度與吞吐量。
9. https://docs.aws.amazon.com/eks/latest/userguide/sandboxing-resource-isolation.html
   - 100 Mbps、1500 packets/s 分別限速，annotations 建立時讀取；token bucket 初始 burst 不代表持續速率。
10. https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ict-getting-started.html
    - Managed Instances only，排除一般 EC2／Fargate launch type。capacity provider 啟用 nitroEnclavesEnabled，awsvpc，confidential 要 attestationPolicy。
11. https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ict-confidential-policy-configuration.html
    - PCR8:ServiceName=ecs.amazonaws.com。滾動部署暫接受新舊 PCR17，完成排空移除舊值；單值 key 不要使用 ForAnyValue／ForAllValues。
12. https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ict-considerations-and-limitations.html
    - Service Connect、individual task EBS、GPU 不支援。EC2 與標準管理費照收，沒有 isolation premium。

## 編輯和封面

標題使用簡短直述主題的「AWS Nitro Sandboxes 的隔離邊界」。依 content guide、carlstack-copywriting、humanize-writing 與繁體中文 reference 審稿。checker 剩餘冒號為具體兩項列舉，已人工判讀；另已刪去「以下是」開頭。沒有新增 Mermaid 或正文 SVG。

封面先看 `kernel-vulnerability-evidence-to-remediation`（版畫、透視高架橋、赭紅／米白／藍）與 `sandbox-authority-boundary-acceptance`（紙雕、俯視雙圈、藍／橙／米白）。本篇選玻璃與陶瓷的棚拍近景、單列艙體、翠綠／淡紫／銀金，媒材、構圖和配色均區分。

使用正式內建 image_gen 生成，提示為三個獨立玻璃艙共用陶瓷托盤、外置鑰匙，無文字、品牌、浮水印。原圖 1672×941，輸出 WebP；完整圖與 400×225 卡片均已檢視。這是概念封面，不宣稱為 AWS 硬體結構圖。

## 技術驗收紀錄

- Node 24.22.1、pnpm 12.1.0；透過 Corepack 的可寫暫存目錄執行 `pnpm install --frozen-lockfile`，成功，lockfile 無修改。
- 本機 Chromium 使用獨立可寫 profile 仍因 `socket() failed: Operation not permitted` 退出；沒有停用 sandbox 或修改安全設定。無桌面／320 px／深淺色的整頁互動截圖，依任務允許記錄本機預覽限制，不能將內容與圖片檢查稱為完整視覺驗收。
- 獨立唯讀審閱已逐一核對官方資料，無核心技術錯誤；補入設定內容信任邊界並澄清 SMT 限制的是同時運算量，不是可啟動 Sandbox 數。
- 其餘 format、staged content policy、check、test、production build 與正式部署驗收於成稿後執行，結果由交付訊息報告。

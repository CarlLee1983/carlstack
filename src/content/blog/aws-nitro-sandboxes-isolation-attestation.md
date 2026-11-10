---
title: AWS Nitro Sandboxes 的隔離邊界
description: 核對 Nitro Sandboxes 在 EKS、ECS 與 EC2 的支援條件，拆開硬體隔離、KMS attestation、對主機的信任與資源成本，整理 Agent 程式執行平台的導入驗收。
publishDate: 2026-11-10T10:13:08+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 資訊安全
  - 雲端架構
series: AI Agent 工程化與工作流實戰
seriesOrder: 113
cover: ../../assets/covers/aws-nitro-sandboxes-isolation-attestation.webp
coverAlt: 淡紫色托盤上的三個獨立綠色玻璃艙各自容納金色機構，紫色鑰匙留在艙外，示意共用主機上的隔離環境與外部授權。
---

讓使用者的 Agent 在同一台 EC2 執行不同租戶的程式，團隊通常要同時處理兩件事：程式逃出容器的風險，以及每個工作各占一台 VM 的閒置成本。AWS 在 [2026 年 11 月 9 日的公告](https://aws.amazon.com/about-aws/whats-new/2026/11/nitro-sandboxes-eks-ecs-ec2/)推出 Nitro Sandboxes，讓 EKS pod、ECS task 或自管輕量 VM 使用 Nitro 的硬體隔離邊界，並支援密碼學證明（cryptographic attestation）。公告稱已在所有商業區域提供，功能本身不另收費。

這值得放進 Agent 執行平台的選型清單。我會優先拿不含正式機密的程式執行工作試用，另外安排 confidential 工作的金鑰與儲存驗收。把兩者排進同一張「已開啟 sandbox」工作單，很容易漏掉後半段。

資料查核到 2026 年 11 月 10 日，依據 AWS 的 EC2、EKS、ECS 技術文件。我沒有部署 Nitro Sandboxes、執行隔離攻擊或量測效能。AWS 所稱的近原生效能與降低成本，尚未在這裡取得實測支持。後面的程式片段與測試項目是導入設計，未執行。

## VM 邊界下方是 Nitro，I/O 仍經過主機

[EC2 文件](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-ec2-nitro-sandboxes.html)將 Sandbox 描述為和父 EC2 instance 並列的第一層硬體虛擬化 guest，並非在父機裡再跑一層 nested hypervisor。Firecracker 可以透過 Nitro Enclaves driver 管理它的生命週期與虛擬裝置。父機提供運算、記憶體和 I/O，Nitro 執行隔離。

這裡有兩種 EC2 模式。預設 confidential mode 將 guest 記憶體移出父機可讀範圍，能產生 attestation。Direct mode 讓父機保有 guest 記憶體存取權，沒有 attestation，官方將它定位為吞吐量較高、雙方由同一可信任單位操作的選項。選型表需要把模式寫出來，產品名稱不足以交代主機是否看得到資料。

EKS 又多一層容器管理。[EKS 架構文件](https://docs.aws.amazon.com/eks/latest/userguide/sandboxing.html)說明父機的 shim 啟動 Firecracker，guest 內的 agent 與 containerd 再管理容器。隔離單位是一個 pod，pod 內多個容器共用 Sandbox。Sidecar 若能拿到同一份機密，就應列入相同信任範圍。

對 Agent 平台，我會保留外部的任務紀錄與授權服務，只把需要執行的程式放進 Sandbox。這沿用站內[工作狀態與短命執行環境分開](/blog/ai-agent-runtime-durable-scaling/)的設計。換了隔離技術，仍要能在 guest 被終止後判斷任務做到哪裡。

## EKS 的兩種 runtime 對主機有不同假設

EKS 的 `isolated-sandbox` 信任父機，目標是把不可信程式限制在 pod 裡。`confidential-sandbox` 則把父機列為不可信，還要限制父機能要求 guest 做哪些事。[模式說明](https://docs.aws.amazon.com/eks/latest/userguide/sandboxing.html)列出的差異包括映像與啟動參數是否固定、是否允許 exec，以及可寫層是否加密。

這和 EC2 的 direct/confidential 命名不在同一層，不能把 EKS 的 isolated 直接當作 EC2 direct 的別名。評估時分別記錄底層記憶體隔離與容器 runtime 政策，才能知道是哪個設定提供哪項保護。

AWS 宣傳的「一行改動」在 EKS Auto Mode 有明確前提。[設定文件](https://docs.aws.amazon.com/eks/latest/userguide/sandboxing-isolated-setup.html)說 Auto Mode 已整合支援，pod 指定 runtime class 後會配置相容節點。自行管理 node group 則要準備含 runtime 的自訂 AMI，並在 launch template 啟用 Nitro Enclaves。只有機型支援，節點仍可能不會提供 Sandbox 容量。

Deployment 的縮寫片段如下，省略映像、資源及其他必要欄位，用來核對設定位置：

```yaml
spec:
  template:
    metadata:
      annotations:
        sandbox.amazonaws.com/network-isolated: "true"
    spec:
      runtimeClassName: isolated-sandbox
```

Annotation 要放在 pod template。放在 Deployment 自己的 metadata，物件可以被接受，卻不會傳給 pod。我的驗收會讀取產生後的 pod，而不只檢查提交的 Deployment YAML。

## Attestation 要接到實際發放金鑰的服務

Attestation 記錄的是環境與政策的量測。誰比對預期值、誰拒絕不合格的請求，決定了機密是否受到保護。

[EKS confidential 設定](https://docs.aws.amazon.com/eks/latest/userguide/sandboxing-confidential-setup.html)要求產生 Cedar policy，將容器 admission 欄位固定，並把政策放進 pod annotation。政策的雜湊對應 PCR17。KMS key policy 還要檢查系統映像簽署服務，官方建議使用 `PCR8:ServiceName`，以免原始 PCR8 在 AWS 輪替憑證後失效。

這是 EKS 的條件片段，不能單獨當作完整 KMS policy 使用。`EXPECTED_POLICY_PCR17` 必須換成政策產生工具預測的值，Principal、Action、Resource 和其他授權路徑要另外審查：

```json
{
  "Condition": {
    "StringEqualsIgnoreCase": {
      "kms:RecipientAttestation:PCR17": "EXPECTED_POLICY_PCR17",
      "kms:RecipientAttestation:PCR8:ServiceName": "eks.amazonaws.com"
    }
  }
}
```

我會用一把只保護測試資料的 KMS key 做兩組對照。預期映像和政策應能解密，換掉被固定的映像或政策後應拒絕。再檢查同一 key 是否存在不要求 attestation 的其他解密授權。只看見 PCR 值出現在紀錄裡，還沒有完成這份驗收。

政策也會改變發布流程。EKS 文件要求在 sidecar 等 mutation 完成後，依最後的 pod spec 產生政策。新映像或被固定的欄位一改，PCR17 可能跟著變。這讓映像、manifest、政策和 KMS 條件成為同一批部署資料，必須共同版本化。

[ECS 的政策文件](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ict-confidential-policy-configuration.html)還交代了滾動部署的處理：新舊 task 並存時，KMS 條件可暫時接受兩個 PCR17 值，排空舊 task 後再移除舊值。它使用 `ecs.amazonaws.com` 作為服務識別，不能複製 EKS 的字串。我會把移除舊值列入部署完成條件，並事先確認回滾時如何恢復舊版本的授權。

## 主機看不到記憶體，仍可能拿到輸出的資料

[EKS 安全模型](https://docs.aws.amazon.com/eks/latest/userguide/sandboxing-security-model.html)明確把 pod spec 與 Cedar policy 視為可信任輸入。服務可以接受不可信程式，不代表可以讓租戶任意提交 pod spec。映像、掛載與權限的編寫入口仍要由 RBAC 和 admission control 管理。

同一份文件也指出，父機仍能取得節點上 pod 的 Pod Identity credentials、讀取政策允許的 logs，以及透過自身權限存取共享儲存。Confidential 程式若把明文寫到 EBS、EFS 或 stdout，會自行把資料交到隔離邊界外。Guest 記憶體保護不能補救這些輸出。

ConfigMap、Secret 與 projected volume 的內容也由父機提供。機密工作若要信任 CA 或固定憑證，應把信任依據放進已固定 digest 的映像，外連時驗證 TLS 憑證。只固定掛載路徑，還無法保證掛進來的設定可信。

因此，我會讓兩種工作使用不同資料契約。執行任意生成程式的工作，只收到低權限測試資料和受限工具。處理機密的工作則使用已審查的映像與程式碼，逐項核對解密、日誌、外連及寫入位置。讓任意使用者程式和解密後的秘密待在同一個 guest，confidential 模式也無法防止程式自己外傳。

斷網設定同樣要看實際通道。[EKS network isolation 文件](https://docs.aws.amazon.com/eks/latest/userguide/sandboxing-network-isolation.html)說，上面的 annotation 會讓 guest 不具網路裝置，連 DNS、IMDS 與 Pod Identity 都不可用，因此加密映像也不能透過 KMS 取得金鑰。Logs、exec 等仍經 vsock 運作，guest 綁定的 vsock port 也可能被有權存取父機 socket 的程序連入。

這適合用來切掉生成程式的直接網路能力，但驗收還要包含 vsock、檔案匯出及工具代理。站內[沙箱執行權限與主機檔案 API 的分別驗收](/blog/sandbox-authority-boundary-acceptance/)可以接著用在這些外部通道。

## 支援條件要按 EKS、ECS 分開查

EC2 支援清單以能執行 Nitro Enclaves 的機型為基礎，不能只看「Nitro-based」。部分尺寸與 bare metal 不支援，而且目前沒有 GPU passthrough。即使父 instance 屬於 GPU 家族，也不能推定 guest 可以使用 GPU。[EC2 限制](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-ec2-nitro-sandboxes.html)

EKS 另外有 runtime 限制。[EKS considerations](https://docs.aws.amazon.com/eks/latest/userguide/sandboxing-limitations.html)列出 `hostNetwork` 不可用、CPU 與記憶體不能原地調整、EBS 卷不能由多個 Sandbox pod 共用。Auto Mode 在發布初期還有 FIPS AMI、GPU／Neuron AMI、multi-NUMA 與部分機型限制，需核對當天清單。

ECS 的範圍更窄。[Getting started](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ict-getting-started.html)明定這項整合只供 Managed Instances 使用，不適用一般 EC2 或 Fargate launch type。Capacity provider 要啟用 `nitroEnclavesEnabled`，task 使用 `awsvpc`。Confidential task 還要提供 `attestationPolicy`。

[ECS 限制文件](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ict-considerations-and-limitations.html)另列出 Service Connect、個別 task 掛載 EBS 和 GPU 不支援。若既有服務依賴這些功能，遷移估算就必須含替代設計。公告所稱 EKS／ECS 原生整合，不能拿來代替相容性清單。

## 成本要用完成的工作量計算

功能不加價，EC2 與管理費仍然要付。ECS 文件明列 underlying EC2 與標準 Managed Instances management fee 照常計費。密度能否降低總費用，取決於每個工作實際占用的資源與完成速度。

Nitro Sandbox 記憶體不超賣。EC2 文件列的五倍上限是同機 Sandbox 的總 vCPU 配置額度，不是把運算能力放大五倍；4-vCPU instance 的額度是 20 vCPU，若每個 Sandbox 配 2 vCPU，上限是 10 個，還要受記憶體與裝置限制。CPU 和記憶體調整也需要重建 guest。

SMT 會影響小工作。[EKS 限制](https://docs.aws.amazon.com/eks/latest/userguide/sandboxing-limitations.html)說不同 Sandbox 不會同時占用同一實體核心的兩條 sibling threads。許多各要 1 vCPU 的工作仍能分時排程，但同時可用的運算量會受實體核心數限制。這是比較 x86、Graviton 與每個工作 CPU 配置時需要測的項目，不能只比 instance 標示的 vCPU 單價。

[EKS 資源節流文件](https://docs.aws.amazon.com/eks/latest/userguide/sandboxing-resource-isolation.html)還列出預設進出頻寬各 100 Mbps、封包率各 1,500 packets/s。兩者分別限制，單改頻寬未必提升吞吐量。Annotation 只在 pod 建立時讀取，改完還要重建。短測試也容易量到剛啟動時已填滿的 token bucket，而非持續速率。

我會用同一組任務比較現有容器與 Nitro Sandbox，先保持映像、節點、工作量和外部服務一致，並記錄節流設定。至少量測：

- 提交後到程式第一個可觀察輸出的 p50／p95，分開冷映像與暖快取。
- 單位時間成功完成的任務數，以及超時和重試次數。
- 父機與 Sandbox 的記憶體占用，連同仍閒置的預熱容量。
- 正常工作旁邊加入高 CPU、網路或磁碟負載後的 p95，確認鄰居干擾。
- 把節點、管理、儲存、網路、KMS 與日誌費用，除以成功完成的工作數。

這份比較會回答該工作是否划算。單獨一個 microbenchmark，很難代表會拉映像、下載套件、呼叫模型又寫大量日誌的 Agent 任務。

## 導入先驗證兩條工作路徑

第一條使用 isolated 模式，執行無正式機密的短工作。確認產生後的 pod／task 確實採用預期模式，對外連線和工具代理遵守允許範圍，再測超量負載、強制終止與結果回收。讓任務紀錄留在外部，避免終止 guest 後連是否完成都無法判定。

第二條使用 confidential 模式，只處理測試機密。核對預期政策可以解密、異動後被拒絕，並確認明文不會出現在主機可讀的 logs 或共享卷。接著做一次新舊政策並存的部署與回滾，留下映像 digest、政策版本、PCR17、KMS 拒絕紀錄和最後運作中的版本。

**如果異動後的政策仍能取得同一份測試機密，就停止加入正式資料。** 保留成功與拒絕的對照證據，查清 KMS 的其他授權路徑及資料交付方式，再繼續容量測試。下一張試辦工作單應附這兩條路徑的負責人與通過條件，之後才有依據決定要替換哪一批 Agent 執行節點。

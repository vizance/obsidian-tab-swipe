## Why

Obsidian 手機版要切換已開啟的分頁，目前必須先點底部導覽列的分頁按鈕、等分頁清單展開、再從清單裡點選目標。只是想切到隔壁那一篇，卻要付三個動作的成本，而使用者一天會切換數十次。

社群外掛市集現有的 6695 個外掛裡沒有等效方案。Mobile UX 提供手勢，但要先按住浮動按鈕再拖曳畫出形狀；Mobile Tab Bar 另外增加一條瀏覽器式分頁列，固定佔用畫面高度而且仍然要用點的。兩者都沒有解決「手指不離開就切換」這件事。

## What Changes

- 建立一個全新的 Obsidian 外掛專案。本 repo 目前只有 Spectra 骨架，沒有外掛程式碼、建置設定與測試環境，因此本次變更包含可建置、可安裝的最小外掛骨架。
- 在手機版底部導覽列上偵測水平滑動：手指向左滑切換到右邊的分頁，手指向右滑切換到左邊的分頁。
- 分頁順序到達兩端時循環。位於最後一個分頁再向左滑回到第一個，位於第一個分頁再向右滑到最後一個。
- 導覽列既有按鈕的點擊行為完全不受影響。只有水平位移超過門檻且水平大於垂直時才判定為滑動，其餘一律放行原本的點擊。
- 桌面版不掛載任何事件。找不到導覽列元素時靜默不啟用，不顯示錯誤。

## Capabilities

### New Capabilities

- `navbar-swipe-gesture`: 在手機版導覽列上辨識水平滑動方向，並與既有按鈕的點擊行為共存
- `tab-cycling`: 依分頁排列順序計算前一個與後一個目標，並在兩端循環後切換作用中分頁

### Modified Capabilities

(none)

## Impact

- Affected specs: navbar-swipe-gesture, tab-cycling
- Affected code:
  - New: `manifest.json`, `versions.json`, `package.json`, `tsconfig.json`, `esbuild.config.mjs`, `vitest.config.ts`, `src/main.ts`, `src/gesture/navbar-swipe.ts`, `src/tabs/tab-cycler.ts`, `tests/navbar-swipe.test.ts`, `tests/tab-cycler.test.ts`, `README.md`, `LICENSE`
  - Modified: (none)
  - Removed: (none)
- 依賴：新增 obsidian、typescript、esbuild、vitest 作為開發相依套件。外掛本身在執行期只依賴 Obsidian 官方公開 API，不引入額外執行期套件。
- 安裝路徑：透過 BRAT 由 GitHub Release 安裝到手機，實機驗證滑動門檻手感。

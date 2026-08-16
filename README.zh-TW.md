# Tab Swipe

在 Obsidian 手機版的底部導覽列上左右滑，直接切換已開啟的分頁。

手機版切分頁本來要三個動作：點分頁數按鈕、等清單展開、點目標。這個外掛把它變成一個手勢，而且是在拇指本來就放著的那條上面。

[English](README.md)

## 怎麼用

在底部導覽列上水平滑動：

- **向左滑**：切到右邊那個分頁
- **向右滑**：切到左邊那個分頁

兩端循環。開兩三個分頁時，任何一個都在一次滑動之內。

點擊完全不受影響。只有水平位移達到 40 px、而且水平大於垂直，才會被判定成滑動。低於門檻的觸控直接放行，導覽列上的按鈕照常運作。

桌面版完全不受影響，外掛在桌面不註冊任何東西。

## 安裝

還沒上社群外掛市集，用 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 安裝：

1. 在「設定」的「第三方外掛」裡安裝並啟用 BRAT。
2. 在 BRAT 設定裡選 **Add Beta plugin**。
3. 貼上 `vizance/obsidian-tab-swipe` 並確認。
4. 回到「設定」的「第三方外掛」啟用 **Tab Swipe**。

手動安裝：從 [Releases](https://github.com/vizance/obsidian-tab-swipe/releases) 下載 `main.js` 與 `manifest.json`，放進 `.obsidian/plugins/obsidian-tab-swipe/`。

## 已知限制

**它掛在 Obsidian 的內部導覽列上。** 感應區靠 `.mobile-navbar` 這個 CSS class 找到，那是 Obsidian 的內部 DOM，不是官方公開的介面。哪天 Obsidian 改名，這個外掛就會失效。失效時是靜默的：不報錯、不跳通知，導覽列就是恢復成原本的樣子。選擇器集中在一個常數，要修只是改一行。

**分割視窗被當成一條平坦的清單。** 分頁順序取自 Obsidian 主區域的 leaf 走訪順序。如果你把根區切成兩個窗格，分別放 A、B 和 C、D，從 B 往後滑會到 C，因為順序就是平坦的 A、B、C、D，不會依窗格分組。側欄裡的筆記永遠不會被切到。

**沒有設定畫面。** 40 px 是寫死的常數。如果不合你的手感，改 `src/gesture/navbar-swipe.ts` 裡的 `SWIPE_THRESHOLD_PX` 再重新建置。

## 開發

```sh
npm install
npm run dev    # 監看模式
npm run build  # 先型別檢查，再打包成 main.js
npm test       # vitest
```

手勢層（`src/gesture/`）完全沒有 import 任何 Obsidian 模組，它只把觸控座標變成一個方向。切換層（`src/tabs/`）只收到方向，不知道方向是手勢產生的。兩層都能在沒有 Obsidian 執行環境的情況下做單元測試，而且有一條防護測試守著這條界線，越界就紅燈。

## 授權

[MIT](LICENSE)

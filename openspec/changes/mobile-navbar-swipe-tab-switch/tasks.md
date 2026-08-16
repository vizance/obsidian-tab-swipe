## 1. 專案骨架與建置

- [ ] 1.1 外掛可被 Obsidian 辨識：`manifest.json` 與 `versions.json` 提供外掛 id、名稱、描述、最低 Obsidian 版本，並將 isDesktopOnly 設為 false。驗證：兩個檔案皆能被 JSON 解析，且 manifest 的 id 與 repo 名稱 obsidian-tab-swipe 一致。
- [ ] 1.2 建置流程可產出可載入的產物：加入 obsidian、typescript、esbuild 為開發相依套件，設定 `esbuild.config.mjs` 與 `tsconfig.json`，讓建置指令在 repo 根目錄輸出 main.js。驗證：執行 npm run build 結束碼為 0 且 main.js 存在。
- [ ] 1.3 單元測試可執行：設定 `vitest.config.ts`，讓測試指令能在沒有 Obsidian 執行環境的情況下跑起來。驗證：執行 npm test 結束碼為 0。

## 2. 手勢偵測層

- [ ] 2.1 依設計決策「滑動與點擊的判定門檻」實作 Horizontal swipe recognition：純函式接收觸控起點座標、終點座標與觸控點數，輸出 next、previous 或無方向；40 像素門檻定義為單一具名常數。驗證：`tests/navbar-swipe.test.ts` 逐列覆蓋 spec 中的六列邊界表格並全數通過。
- [ ] 2.2 實作 Navigation bar tap passthrough：只有在判定為滑動時才抑制觸控預設行為，未達門檻時完全不干預。驗證：測試斷言未達門檻的觸控不呼叫抑制函式、達門檻的觸控恰好呼叫一次。
- [ ] 2.3 依設計決策「手勢偵測層與分頁切換層分離」，手勢層不引用任何 Obsidian 模組，只輸出方向值。驗證：`tests/navbar-swipe.test.ts` 在未 mock obsidian 套件的情況下即可通過。

## 3. 分頁切換層

- [ ] 3.1 依設計決策「用官方公開 API 自行計算分頁順序」實作 Neighbour tab selection：先確認安裝版本的 obsidian 型別定義中 iterateRootLeaves 與 setActiveLeaf 的實際簽名，再依分頁排列順序與作用中分頁算出相鄰目標並啟用它。驗證：`tests/tab-cycler.test.ts` 以假的 workspace 物件覆蓋 spec 中三分頁走訪表格的四列。
- [ ] 3.2 依設計決策「手勢方向對應與循環切換」實作 Wrap-around at both ends：最後一個分頁往 next 回到第一個，第一個分頁往 previous 到最後一個。驗證：`tests/tab-cycler.test.ts` 覆蓋 spec 中循環邊界表格的四列。
- [ ] 3.3 實作 No action with fewer than two tabs：分頁數少於兩個時不改變作用中分頁並回傳空結果。驗證：測試斷言零分頁與單一分頁兩種情況皆回傳空值且未呼叫切換 API。
- [ ] 3.4 實作 Tab order source and split view limitation：分頁順序只取自根區 leaf，排除左右側欄，分割視窗採平坦順序。驗證：測試覆蓋 spec 中側欄排除與分割視窗兩個 scenario。

## 4. 外掛整合與平台守門

- [ ] 4.1 依設計決策「感應區只綁定手機導覽列」實作 Gesture surface activation：外掛載入時只在導覽列元素上掛載觸控監聽，並把手勢層輸出的方向交給分頁切換層執行。驗證：在手機版實際左右滑動可切換分頁，且滑動不會觸發任何按鈕動作。
- [ ] 4.2 依設計決策「桌面不掛載與缺少元素時靜默停用」實作守門與清理：非行動裝置或找不到導覽列元素時不掛載監聽、不拋錯、不通知；卸載時移除所有監聽。驗證：桌面版載入後開發者主控台無錯誤訊息，且在測試 vault 停用外掛後導覽列恢復原生行為。

## 5. 實機驗證與文件

- [ ] 5.1 產出 GitHub Release 並以 BRAT 安裝到手機完成驗收：導覽列六顆按鈕逐一點擊皆正常運作、向左滑與向右滑各切換一格且方向正確。驗證：逐項手動確認並把結果記錄在 change 的驗收紀錄中。
- [ ] 5.2 門檻常數確定為實機可用的數值：在手機上反覆測試點擊與滑動的分界，把最終數值回填到常數與 README。驗證：以最終數值重跑手勢層測試全數通過，且手動連續點擊導覽列按鈕十次無誤觸切換。
- [ ] 5.3 README 與 LICENSE 完整說明使用方式與已知限制：涵蓋 BRAT 安裝步驟、依賴 Obsidian 內部導覽列 class 的失效風險、分割視窗採平坦順序的限制。驗證：內容審閱確認三項資訊皆存在，且 LICENSE 為 MIT。

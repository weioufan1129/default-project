# Sudoku Master 數獨大師

一個支援**多關卡、音效、計時、提示與統計**的數獨網頁遊戲。
純 HTML/CSS/JS 實作、零依賴，可離線開啟，也可部署為永久公開網頁。

## 線上遊玩

部署後網址：https://weioufan1129.github.io/default-project/

## 本機試玩

直接雙擊 `index.html` 即可在瀏覽器開啟，無需安裝任何東西。

## 遊戲特色

| 類別 | 內容 |
|------|------|
| 難度 | 簡單 / 中等 / 困難 / 高手（唯一解保證） |
| 關卡 | 每過一關自動進入下一關，等級持續累積 |
| 音效 | 選取、填數、錯誤、提示、過關皆有音效（可開關） |
| 筆記 | 候選數模式，自動凸顯行列宮與相同數字 |
| 輔助 | 復原（↺）、提示（💡）、鍵盤操作 |
| 統計 | 勝局/最快戰績/提示次數（localStorage 保存） |
| 存檔 | 自動保存進度，關閉瀏覽器後可續玩 |
| 主題 | 經典 / 暗黑 / 霓虹 |
| 裝置 | 桌機與手機皆可玩（響應式版面） |

## 操作方式

- 點選格子，再按 1–9 填入數字
- 開啟 ✎ 筆記模式填候選數
- `⌫` 清除、`↺` 復原、`💡` 提示、`↻` 新遊戲
- 鍵盤：方向鍵移動、`N` 筆記、`U` 復原、`H` 提示、`R` 新局
- 錯誤超過 3 次挑戰結束

## 檔案結構

```text
.
├── index.html        # 遊戲頁面
├── css/style.css     # 響應式樣式與主題
├── js/
│   ├── config.js     # 難度與設定
│   ├── sudoku.js     # 數獨產生器與求解器
│   ├── sound.js      # WebAudio 音效
│   ├── stats.js      # 統計與紀錄
│   ├── renderer.js   # 棋盤渲染
│   ├── game.js       # 遊戲邏輯
│   └── app.js        # 主程式（UI/鍵盤/計時）
└── README.md
```

## 部署至 GitHub Pages

```bash
# 推送至 GitHub
git add -A && git commit -m "Add sudoku game" && git push

# 由 gh CLI 啟用 GitHub Pages（main 分支根目錄）
gh api -X POST "repos/{owner}/{repo}/pages" -H "Accept: application/vnd.github+json" \
  -f source[branch]=main -f source[path]=/
```

啟用後網址格式：`https://<owner>.github.io/<repo>/`

## 授權

MIT
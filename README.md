# Default Project

一個支援 **TypeScript/Node.js** 與 **Python** 的現代軟體專案範本，
整合 linting、格式化、型別檢查、測試與 CI/CD 流程。

## 技術棧

| 類別 | 工具 |
|------|------|
| 執行環境 | Node.js 24 / Python 3.11 |
| 語言 | TypeScript 5.9 / Python 3.11 |
| 套件管理 | npm 11 / pip + venv |
| Lint | ESLint / ruff、flake8 |
| 格式化 | Prettier / black |
| 型別檢查 | tsc / mypy |
| 測試 | vitest / pytest |
| CI/CD | GitHub Actions |

## 快速開始

### 前置需求

- Node.js >= 24
- Python >= 3.11
- Git

### 安裝

```bash
# 複製專案
git clone <repo-url> && cd <repo>

# 安裝 Node.js 相依套件
npm install

# 建立 Python 虛擬環境並安裝相依套件
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux
pip install -r requirements.txt

# 複製環境變數範本
cp .env.example .env
```

### 設定

複製 `.env.example` 為 `.env` 並填入實際值。所有環境變數皆須在此指定。

### 常用指令

```bash
# Node.js / TypeScript
npm run dev          # 開發模式執行
npm run build        # 編譯 TypeScript
npm start            # 執行編譯後程式
npm run lint         # ESLint 檢查
npm run format       # Prettier 格式化
npm run typecheck    # tsc 型別檢查
npm test             # 執行測試

# Python
python -m black src tests        # 格式化
python -m ruff check src tests   # lint
python -m mypy src               # 型別檢查
python -m pytest                 # 執行測試
```

## 專案結構

```text
.
├── .github/
│   └── workflows/   # CI/CD 工作流
├── .vscode/         # VS Code 設定與推薦擴充
├── config/          # 應用程式設定檔
├── docs/            # 專案文件
├── scripts/         # 開發/部署輔助腳本
├── src/             # TypeScript 原始碼
│   └── <module>/
├── tests/           # 測試程式碼（pytest / vitest）
├── .editorconfig    # 跨編輯器格式設定
├── .env.example     # 環境變數範本
├── .flake8          # flake8 設定
├── .gitignore
├── .prettierrc      # Prettier 設定
├── eslint.config.mjs # ESLint 設定
├── package.json     # Node.js 專案設定
├── pyproject.toml   # Python 專案設定
├── requirements.txt # Python 相依套件
├── tsconfig.json    # TypeScript 設定
└── README.md
```

## 測試

```bash
npm test          # 執行 TypeScript 測試
python -m pytest  # 執行 Python 測試
```

## 部署

待補。

## 授權

MIT
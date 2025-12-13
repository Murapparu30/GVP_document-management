# GVP Document Management

医療機器GVP/QMS対応の完全ローカル動作帳票管理アプリケーション

## 📥 ダウンロード

**Windows / Mac / Linux 対応**

👉 [最新版をダウンロード](https://github.com/Murapparu30/GVP_document-management/releases)

| OS | ファイル |
|----|---------|
| Windows | `QMS.Local.App.Setup.x.x.x.exe` |
| Mac (Apple Silicon) | `QMS.Local.App-x.x.x-arm64.dmg` |
| Linux | `QMS.Local.App-x.x.x.AppImage` |

### ⚠️ Mac版のインストール方法

Mac版は署名なしのため、以下の手順が必要です：

1. ダウンロードしたDMGファイルに対してターミナルで実行：
   ```bash
   xattr -cr ~/Downloads/QMS.Local.App-*.dmg
   ```
2. DMGをダブルクリックして開く
3. アプリをApplicationsフォルダにドラッグ
4. Applicationsでアプリを**右クリック → 「開く」**を選択

### Windows版について

初回起動時に「Windows によって PC が保護されました」と表示されることがあります。
「詳細情報」→「実行」をクリックして起動してください。

## 🚀 Quick Start

### BoltNew / Development Environment

```bash
# Install dependencies
npm install

# Development mode (Vite dev server)
npm run dev

# Build for testing
npm run build
```

### Local Machine (Production Packaging)

```bash
# Install dependencies
npm install

# Create production installer (requires C++ build tools)
npm run package
```

## 📋 Available Scripts

### ✅ Development Scripts (BoltNew-safe)

| Script | Command | Description |
|--------|---------|-------------|
| **dev** | `npm run dev` | Start Vite dev server with hot reload |
| **build** | `npm run build` | ⭐ **Default build** - TypeScript + Vite (no packaging) |
| **build:app** | `npm run build:app` | Alias for build |
| **electron:dev** | `npm run electron:dev` | Run Electron in development mode |
| **typecheck** | `npm run typecheck` | Run TypeScript type checking |
| **lint** | `npm run lint` | Run ESLint |

### ⚠️ Production Scripts (Local machine ONLY)

| Script | Command | Requirements |
|--------|---------|--------------|
| **package** | `npm run package` | C++ compiler, Python, node-gyp |

**IMPORTANT:**
- **In BoltNew**: Only use development scripts (`dev`, `build`)
- **DO NOT run** `npm run package` in BoltNew (native module compilation will fail)
- **For installers**: Run `npm run package` on local machine with proper build tools

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Desktop**: Electron
- **Database**: SQLite (better-sqlite3)
- **PDF**: pdfkit
- **Icons**: Lucide React

## 📁 Project Structure

```
qms-local-app/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── db/              # SQLite database
│   │   ├── ipc/             # IPC handlers
│   │   └── pdf/             # PDF generation
│   └── renderer/            # React frontend
│       ├── components/
│       ├── pages/
│       └── types/
├── data/
│   ├── templates/           # Form templates (JSON)
│   ├── layouts/             # PDF layouts (JSON)
│   ├── records/             # Data records (JSON + versions)
│   ├── db/                  # SQLite database file
│   └── exports/             # Generated PDFs
└── docs/                    # Documentation
```

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - プロジェクト記憶ノート（開発履歴・設計判断）
- **[docs/FEATURES.md](./docs/FEATURES.md)** - 機能仕様書
- **[BUILD_SCRIPTS_UPDATE.md](./BUILD_SCRIPTS_UPDATE.md)** - ビルドスクリプト詳細
- **[docs/PDF_EXPORT.md](./docs/PDF_EXPORT.md)** - PDF出力機能
- **[docs/HISTORY_DIFF.md](./docs/HISTORY_DIFF.md)** - 履歴・差分表示機能
- **[docs/CORRECTIVE_ACTION.md](./docs/CORRECTIVE_ACTION.md)** - 是正処置記録機能

## 🔧 Build Process

### Why Separate Scripts?

This project uses **better-sqlite3**, a native Node.js module that requires C++ compilation. The build process is split into two phases:

1. **Development Build** (`npm run build`)
   - TypeScript compilation
   - Vite bundling (React + Electron)
   - No native module compilation
   - ✅ Works in BoltNew

2. **Production Packaging** (`npm run package`)
   - Runs development build
   - Invokes electron-builder
   - Rebuilds native modules for Electron
   - Creates platform-specific installers
   - ❌ Requires local machine with build tools

### Build Tools Required (for packaging only)

- **Windows**: Visual Studio Build Tools, Python
- **macOS**: Xcode Command Line Tools, Python
- **Linux**: gcc/g++, make, Python

## 🎯 Core Features

✅ **完成済み:**
- 帳票テンプレートシステム（JSON動的フォーム生成）
- 苦情処理記録（complaint_record_v1）
- 是正処置記録（corrective_action_v1）
- **カスタムテンプレートインポート** - ユーザー独自のテンプレートを追加可能
- **カスタム記録管理** - インポートしたテンプレートでの記録作成・編集
- 記録タイトル自由入力
- 版管理（自動バージョニング）
- PDF出力（レイアウトJSON対応）
- 履歴・差分表示
- 管理ダッシュボード

⏳ **Planned:**
- 検索・フィルター機能
- データエクスポート/インポート

## 🔐 Security & Compliance

- **完全オフライン動作**: インターネット接続不要
- **監査証跡**: 全ての変更を記録（版管理）
- **削除禁止**: データの物理削除は行わない（QMS要件）
- **トレーサビリティ**: 帳票間の関連づけを記録

## 🐛 Troubleshooting

### Build fails with "gyp" errors

This means you're trying to run `npm run package` without proper build tools.

**Solution**: Use `npm run build` instead (BoltNew-compatible).

### "Cannot find module 'better-sqlite3'"

Run `npm install` to ensure all dependencies are installed.

### Electron app won't start

1. Ensure build completed: `npm run build`
2. Check that `dist/` and `dist-electron/` directories exist
3. Try running: `npm run electron:dev`

## 📝 License

Private - Medical Device QMS Application

## 🤝 Contributing

This is a private project for medical device quality management.

For development questions, see:
- [CLAUDE.md](./CLAUDE.md) - Project memory and design decisions
- [docs/FEATURES.md](./docs/FEATURES.md) - Feature specifications

## 📅 Development Log (2025-12-13)

### カスタムテンプレート機能の実装
-   **テンプレートインポート**: ユーザー独自のJSONテンプレートをインポート可能
-   **カスタム記録管理**: インポートしたテンプレートで記録の作成・編集・一覧表示
-   **記録タイトル**: ユーザーが自由に記録名を設定可能
-   **バグ修正**: listDocuments APIの引数受け渡し問題を解決

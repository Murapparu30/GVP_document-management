# QMS Local App - プロジェクト記憶ノート

このファイルは、Claude Code（AI）とプロジェクトメンバーが、プロジェクトの状態・構造・設計判断を共有するための「公式記憶ノート」です。

**最終更新**: 2025-12-02
**ステータス**: Phase 1-8 完了、初回起動自動セットアップ完了

---

## 🎯 プロジェクト目的

医療機器QMS（品質マネジメントシステム）に対応した **完全ローカルで動作する帳票管理アプリケーション** を構築する。

### ビジネスモデル
- 初期販売: 基本アプリ＋標準テンプレート
- 追加収益: 帳票テンプレートの追加販売
- 将来展望: サブスクリプション化

### 核となる要件
1. **完全オフライン動作**: インターネット接続不要、外部通信禁止（社内LAN/NASまで）
2. **帳票テンプレート方式**: JSON定義から動的フォーム生成
3. **版管理**: 更新のたびに新版を作成し、旧版も保持（QMS監査要件）
4. **PDF出力**: A4帳票のPDF生成・出力ログ管理
5. **履歴・差分**: 版間の差分表示
6. **トレーサビリティ**: 苦情処理記録 ⇔ 是正処置記録の関連づけ
7. **ローカルAI支援**: 原因分析・暫定対応の文章生成支援

---

## 技術スタック

### フロントエンド
- **Electron 39**: デスクトップアプリフレームワーク
- **React 18**: UIライブラリ
- **TypeScript 5**: 型安全性
- **Vite 5**: ビルドツール（高速・HMR対応）
- **Tailwind CSS 3**: ユーティリティファーストCSS
- **Lucide React**: アイコンライブラリ

### バックエンド（ローカル）
- **SQLite (better-sqlite3)**: 検索・一覧用のインデックスDB
- **JSON Files**: 実データの本体（可読性・バックアップ容易性）

### PDF生成
- **pdfkit**: PDFライブラリ（実装済み）
- PDF生成ロジック: `src/main/pdf/generator.ts`
- PDF出力ログ: `pdf_exports` テーブルに記録

### AI支援
- **ローカルLLM統合準備完了**: `src/main/ipc/ai.ts`
- 将来的にOllama等のローカルモデルと統合可能

---

## ビルドとパッケージング

### 重要: BoltNew vs ローカルMac

プロジェクトは **better-sqlite3** (ネイティブモジュール) を使用しているため、ビルドプロセスを2段階に分離:

#### ✅ BoltNew / 開発環境（ネイティブモジュール再ビルド不要）

```bash
# 開発モード（ホットリロード）
npm run dev

# ビルド（TypeScript + Vite のみ）
npm run build        # ← BoltNewのデフォルトタスク

# Electron開発モード
npm run electron:dev

# 型チェック
npm run typecheck
```

**特徴:**
- ✅ ネイティブモジュール再ビルドなし
- ✅ TypeScript/React/Electron コードをコンパイル
- ✅ better-sqlite3 はnode_modulesから直接使用（動作OK）
- ✅ ビルド時間: 8-10秒程度
- ✅ BoltNewで正常動作確認済み

#### ⚠️ ローカルMac / 配布用パッケージング（要ビルドツール）

```bash
# インストーラー作成
npm run package      # ← C++コンパイラ、Python、node-gyp 必須

# 必要なツール:
# - macOS: Xcode Command Line Tools
# - Windows: Visual Studio Build Tools
# - Linux: gcc/g++, make
```

**動作:**
1. `npm run build` を実行（開発ビルド）
2. `electron-builder` を起動
3. better-sqlite3 をElectron用に再ビルド
4. プラットフォーム別インストーラー作成（.dmg / .exe）

### package.json スクリプト構成

```json
{
  "scripts": {
    "// BoltNew / Development Scripts (no native module rebuild)":
    "dev": "vite",
    "build": "tsc && vite build",
    "build:app": "tsc && vite build",
    "electron:dev": "electron .",

    "// Production Packaging (local machine only, requires C++ toolchain)":
    "package": "npm run build && electron-builder",

    "// Other Scripts":
    "electron": "electron .",
    "lint": "eslint .",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit -p tsconfig.app.json"
  }
}
```

### ビルド成果物

```
dist/                      # フロントエンドビルド
├── index.html
└── assets/
    ├── *.css             # Tailwind CSS (17.42 kB)
    └── *.js              # React bundle (194.57 kB)

dist-electron/            # Electronビルド
├── main.js              # メインプロセス (1.86 MB)
└── preload.js           # Preloadスクリプト (0.82 kB)
```

**参考ドキュメント:**
- `BUILD_SCRIPTS_UPDATE.md` - ビルドスクリプト変更の詳細説明
- `BUILD_SETUP_COMPLETE_JP.md` - ビルド設定完了サマリー（日本語）
- `README.md` - クイックスタートガイド

---

## ディレクトリ構造

```
qms-local-app/
├── src/
│   ├── main/                    # Electron Mainプロセス
│   │   ├── main.ts              # アプリケーションエントリーポイント
│   │   ├── preload.ts           # Preloadスクリプト（IPC Bridge）
│   │   ├── db/                  # SQLite初期化・管理
│   │   │   └── index.ts
│   │   ├── setup/               # 初回起動セットアップ
│   │   │   └── firstRun.ts      # ディレクトリ自動作成・初回判定
│   │   ├── ipc/                 # IPCハンドラ群（実装済み）
│   │   │   ├── templates.ts     # テンプレート管理
│   │   │   ├── records.ts       # レコードCRUD
│   │   │   ├── documents.ts     # ドキュメント一覧
│   │   │   ├── history.ts       # 版履歴管理
│   │   │   ├── pdf.ts           # PDF生成
│   │   │   ├── ai.ts            # AI支援（ローカルLLM統合ポイント）
│   │   │   └── dashboard.ts     # ダッシュボード集計
│   │   └── pdf/                 # PDF生成ロジック
│   │       └── generator.ts     # PDFKit統合・レイアウト処理
│   └── renderer/                # React アプリ
│       ├── main.tsx             # React エントリーポイント
│       ├── App.tsx              # メインコンポーネント
│       ├── index.html           # HTMLテンプレート
│       ├── index.css            # グローバルスタイル
│       ├── components/          # UIコンポーネント
│       │   ├── forms/
│       │   │   └── DynamicForm.tsx  # 動的フォーム生成（AI支援統合済み）
│       │   └── history/
│       │       ├── RecordHistoryPanel.tsx      # 版履歴一覧パネル
│       │       ├── RecordDiffView.tsx          # 差分表示コンポーネント
│       │       └── PdfExportHistoryPanel.tsx   # PDF出力履歴パネル
│       ├── pages/               # ページコンポーネント
│       │   ├── DashboardPage.tsx               # 管理ダッシュボード
│       │   ├── ComplaintListPage.tsx           # 苦情処理記録一覧画面
│       │   ├── ComplaintDetailPage.tsx         # 苦情処理記録詳細画面
│       │   ├── CorrectiveActionListPage.tsx    # 是正処置記録一覧画面
│       │   └── CorrectiveActionDetailPage.tsx  # 是正処置記録詳細画面
│       ├── types/               # 型定義
│       │   ├── template.ts      # テンプレート型
│       │   ├── record.ts        # レコード型
│       │   └── electron.d.ts    # Electron API型
│       └── global.d.ts          # グローバル型定義
├── data/                        # データディレクトリ（実運用時）
│   ├── templates/               # 帳票テンプレートJSON
│   │   ├── complaint_record_v1.json      # 苦情処理記録テンプレート
│   │   └── corrective_action_v1.json     # 是正処置記録テンプレート
│   ├── layouts/                 # PDFレイアウトJSON
│   │   ├── complaint_record_v1_layout.json      # 苦情処理記録PDFレイアウト
│   │   └── corrective_action_v1_layout.json     # 是正処置記録PDFレイアウト
│   ├── records/                 # 実データJSON（版付き）
│   │   ├── complaint/           # 苦情処理記録ディレクトリ
│   │   └── corrective/          # 是正処置記録ディレクトリ
│   ├── db/                      # SQLiteファイル
│   └── exports/                 # 出力済みPDF
├── docs/
│   ├── FEATURES.md              # 機能一覧・仕様書
│   ├── PDF_EXPORT.md            # PDF出力機能の詳細ドキュメント
│   ├── HISTORY_DIFF.md          # 履歴・差分機能の詳細ドキュメント
│   └── CORRECTIVE_ACTION.md     # 是正処置記録機能の詳細ドキュメント
├── CLAUDE.md                    # このファイル（公式記憶ノート）
├── README.md                    # クイックスタートガイド
├── IMPLEMENTATION_COMPLETE.md   # Phase 1&2 実装完了サマリー
├── PDF_IMPLEMENTATION.md        # PDF機能実装詳細
├── COMPLAINT_CORRECTIVE_LINK.md # 苦情-是正処置リンク機能の詳細
├── FIRST_RUN_SETUP.md           # 初回起動自動セットアップの詳細
├── DASHBOARD_IMPLEMENTATION.md  # ダッシュボード機能実装詳細
├── BUILD_SCRIPTS_UPDATE.md      # ビルドスクリプト変更詳細（英語）
├── BUILD_SETUP_COMPLETE_JP.md   # ビルド設定完了サマリー（日本語）
├── package.json
├── vite.config.ts
├── tsconfig.json
└── electron-builder.yml         # Electronビルド設定
```

---

## 重要なドキュメント

### README.md
プロジェクトのクイックスタートガイド。初めて触る人はここから読むべき。

内容:
- 開発環境とローカルMacの使い分け
- 利用可能なスクリプト一覧
- トラブルシューティング

### docs/FEATURES.md
プロジェクトの機能仕様・要件・データ構造・実装計画がすべて記載されています。
**新しいタスクを開始する前に、必ずこのドキュメントを参照してください。**

内容:
- アプリ概要
- 主な機能（テンプレート管理、DynamicForm、版管理、PDF出力、ログ管理、ダッシュボード）
- ディレクトリ構成
- 非機能要件
- 開発フェーズ

### docs/PDF_EXPORT.md
PDF出力機能の詳細ドキュメント。PDF生成フローやレイアウトシステムについて記載。

内容:
- PDF出力フローの概要
- ファイル出力パス（`data/exports/`）
- `pdf_exports` テーブルスキーマ
- layout.json とPDFレンダリングのマッピング
- 新しいテンプレートへのPDF機能拡張方法

### docs/HISTORY_DIFF.md
履歴・差分表示機能の詳細ドキュメント。版管理とフィールド単位の差分表示について記載。

内容:
- 版管理の概念とデータベース設計
- 履歴パネルの動作
- 差分計算ロジック（フィールド単位比較）
- 他のテンプレートへの拡張方法

### docs/CORRECTIVE_ACTION.md
是正処置記録機能の詳細ドキュメント。苦情処理記録との連携について記載。

内容:
- 是正処置記録の概要とデータ構造
- 苦情処理記録からのリンク機能
- 自動ID生成とフィールド自動入力
- ワークフローと使用方法

### BUILD_SCRIPTS_UPDATE.md / BUILD_SETUP_COMPLETE_JP.md
ビルドスクリプトの分離とBoltNew対応の詳細説明。

内容:
- ビルドプロセスの分離理由
- BoltNew vs ローカルMacの使い分け
- better-sqlite3のネイティブモジュール対応
- 将来のパッケージング手順

### FIRST_RUN_SETUP.md
初回起動時の自動セットアップ機能の詳細ドキュメント。

内容:
- 自動セットアップの概要
- ディレクトリ構造の自動作成
- データベースの自動初期化
- デフォルトユーザーの自動登録
- 実装の詳細とカスタマイズ方法
- ユーザーエクスペリエンス
- データの保存場所
- トラブルシューティング

---

## ✅ 完成している機能（2025-12-02時点）

### Phase 1: 基盤構築（完了）
- ✅ Electronプロジェクトの骨組み作成
- ✅ ディレクトリ構造の構築
- ✅ Electron + React + TypeScript の基本セットアップ
- ✅ 依存関係のインストール（Electron, better-sqlite3, pdfkit, etc.）
- ✅ docs/FEATURES.md の作成
- ✅ CLAUDE.md（このファイル）の作成
- ✅ SQLite初期化とテーブル作成（documents, document_versions, pdf_exports）

### Phase 2: 基本CRUD機能（完了）
- ✅ テンプレートJSON読み込み機能（IPC: getTemplate, listTemplates）
- ✅ DynamicForm コンポーネント（動的フォーム生成）
- ✅ レコード保存・読み込み機能（IPC: saveRecord, getRecordVersion）
- ✅ 基本的な版管理ロジック（version自動インクリメント）
- ✅ 一覧・詳細画面（ComplaintListPage, ComplaintDetailPage）

### Phase 3: PDF出力機能（完了）
- ✅ **PDF出力機能実装完了**
  - ✅ pdfkit統合（`src/main/pdf/generator.ts`）
  - ✅ レイアウトJSON対応（`data/layouts/`）
  - ✅ PDF出力ログ（`pdf_exports` テーブル）
  - ✅ UIボタン統合（ComplaintDetailPageに「PDF出力」ボタン）
  - ✅ マルチページ・ヘッダー・フッター対応

### Phase 4: 履歴・差分表示機能（完了）
- ✅ **履歴・差分表示機能実装完了**
  - ✅ 版履歴一覧UI（RecordHistoryPanel）
  - ✅ 差分表示UI（RecordDiffView）
  - ✅ フィールド単位の差分計算
  - ✅ 版間比較の選択インターフェース
  - ✅ IPCハンドラ（listVersions, getVersionData）

### Phase 5: 是正処置記録機能（完了）
- ✅ **是正処置記録機能実装完了**
  - ✅ 是正処置記録テンプレート（`corrective_action_v1.json`）
  - ✅ 是正処置記録PDFレイアウト（`corrective_action_v1_layout.json`）
  - ✅ CorrectiveActionListPage（一覧画面）
  - ✅ CorrectiveActionDetailPage（詳細画面）
  - ✅ 苦情処理記録からの自動リンク機能
  - ✅ 自動ID生成（CA-{complaint_id}形式）
  - ✅ フィールド自動入力（source_record_type, source_record_id, related_complaint_id）
  - ✅ クロスナビゲーション（苦情 ⇔ 是正処置）
  - ✅ PDF出力機能統合（「PDF出力」ボタン、`generatePdf` IPC使用）
  - ✅ PDF出力履歴パネル統合（`PdfExportHistoryPanel`）
  - ✅ 版履歴・差分表示機能統合（`RecordHistoryPanel`, `RecordDiffView`）

### Phase 6: ローカルAI支援機能（完了）
- ✅ **ローカルAI支援機能実装完了**
  - ✅ AI支援IPC（`src/main/ipc/ai.ts`）
  - ✅ aiAssist ハンドラ実装（runLocalAiModel関数に集約）
  - ✅ DynamicFormにAI提案ボタン統合
  - ✅ テンプレートフィールドに ai_assist / ai_prompt 対応
  - ✅ 苦情処理記録の「原因分析」「暫定対応」でAI支援利用可能
  - ✅ 是正処置記録でもAI支援対応完了

### Phase 7: ダッシュボード機能（完了 - 2025-11-15）
- ✅ **ダッシュボード機能実装完了**
  - ✅ DashboardPage（管理ダッシュボード画面）
  - ✅ 苦情処理記録の集計（総数・未完了数・ステータス別集計・最終更新日時）
  - ✅ 是正処置記録の集計（総数・未完了数・期限超過数・期限間近数・ステータス別集計）
  - ✅ 要注意項目の強調表示（期限超過：赤、期限間近：黄色）
  - ✅ IPCハンドラ（getDashboardStats）
  - ✅ トップレベルナビゲーション統合（ダッシュボード/苦情/是正処置）
  - ✅ デフォルト起動画面をダッシュボードに設定

### Phase 8: ビルド・パッケージング設定（完了 - 2025-11-15）
- ✅ **BoltNew対応完了**
  - ✅ ビルドスクリプト分離（`build` vs `package`）
  - ✅ package.json にインラインコメント追加
  - ✅ BoltNewで正常ビルド確認（8-10秒、エラーなし）
  - ✅ better-sqlite3をネイティブ再ビルドなしで使用可能に
  - ✅ ドキュメント整備（README, BUILD_SCRIPTS_UPDATE, BUILD_SETUP_COMPLETE_JP）
  - ✅ 将来のローカルMacパッケージング手順明記

### Phase 9: 初回起動自動セットアップ（完了 - 2025-12-02）
- ✅ **初回起動時の自動セットアップ実装**
  - ✅ ディレクトリ構造の自動作成（data/db, data/records, data/exports）
  - ✅ データベースの自動初期化（4テーブル、5インデックス）
  - ✅ デフォルトユーザーの自動登録（4名）
  - ✅ 初回起動判定ロジック（isFirstRun）
  - ✅ setupFirstRun 関数の実装
  - ✅ main.ts への統合
  - ✅ ドキュメント作成（FIRST_RUN_SETUP.md）
  - ✅ ユーザー操作不要で即座に使用可能

### IPC通信の実装（完了）
- ✅ preload経由の安全な通信
- ✅ 全IPC APIの型定義完備（`global.d.ts`, `electron.d.ts`）

---

## 🔮 未実装の機能（今後の開発課題）

### 優先度A：使いやすさ向上
1. **検索・フィルター機能**
   - 記録番号、日付範囲、更新者での絞り込み
   - ステータス別フィルター
   - 全文検索機能

2. **入力バリデーション強化**
   - 記録番号の形式チェック
   - 日付論理チェック（受付日 ≤ 完了日など）
   - 必須フィールドの視覚的フィードバック強化

3. **UI改善**
   - セクション折りたたみ機能
   - 入力導線の最適化
   - レスポンシブデザインの強化

### 優先度B：拡張機能
4. **ユーザー管理機能**
   - アプリ起動時のユーザー選択
   - ユーザーごとのアクセス履歴
   - 権限管理

5. **複数テンプレート対応**
   - テンプレート選択機能
   - テンプレートごとのレコード一覧
   - カスタムテンプレート追加機能

6. **データエクスポート/インポート**
   - JSONバックアップ機能
   - CSVエクスポート
   - データ復元機能

7. **是正処置から苦情への逆ナビゲーション**
   - 是正処置詳細画面から関連苦情へジャンプ

8. **1つの苦情に対する複数是正処置対応**
   - 苦情詳細画面で複数の是正処置を表示・管理

9. **PDF出力履歴からのPDF直接閲覧機能**
   - PdfExportHistoryPanel から過去のPDFファイルを直接開く機能

---

## データ設計の重要なポイント

### 1. JSONが本体、SQLiteは索引
- **実データ**: `data/records/` に JSON形式で保存
- **SQLite**: 検索・一覧用のメタ情報のみ（record_id, version, file_path, etc.）
- JSONは人間が直接確認可能で、バックアップ・移植が容易

### 2. 版管理の仕組み
- 更新時に version を +1
- 新しいJSONファイルを作成（例: `CR-2025-0001_v2.json`）
- 旧版は削除せず保持（QMS監査要件）
- document_versions テーブルで全版を追跡

### 3. 削除禁止
QMSの監査証跡要件により、基本的に**データの物理削除は行わない**。

### 4. トレーサビリティ
- link フィールドで帳票間の関連づけ
- 苦情処理記録 → 是正処置記録の自動リンク生成
- source_record_type / source_record_id でリンク元を記録

---

## 技術的な判断事項

### なぜElectron？
- 完全ローカル動作が必須
- ファイルシステム直接アクセス
- SQLiteとの統合
- クロスプラットフォーム対応（Windows優先、将来的にmacOS）

### なぜSQLite？
- インストール不要
- ローカルファイルベース
- 軽量で高速
- SQL検索機能

### なぜJSONも併用？
- 可読性（人間が直接確認可能）
- 柔軟性（スキーマ変更に強い）
- バックアップ・移植が容易
- QMS監査での透明性確保

### なぜVite？
- 高速な開発サーバー（HMR）
- ビルド速度の最適化
- Electronとの統合が容易
- TypeScript/React のファーストクラスサポート

### セキュリティ方針
- 外部HTTP通信は禁止
- Node.js統合は最小限に（contextIsolation: true）
- Preload経由でのIPC通信のみ
- ユーザー入力の適切なバリデーション

### QMS要件
- 履歴削除禁止
- 版の完全性保持
- 監査証跡（誰が・いつ・何を）
- トレーサビリティの確保

### パフォーマンス
- SQLiteインデックス最適化
- 大量レコード時の仮想スクロール検討
- PDF生成の非同期処理
- データベースクエリの最適化

---

## IPC通信一覧（実装済み）

### テンプレート管理
- `getTemplate(templateId: string)` - テンプレート取得
- `listTemplates()` - テンプレート一覧取得

### レコード管理
- `saveRecord(payload)` - レコード保存（版管理自動）
- `getRecordVersion(recordId, templateId, version)` - 特定版の取得
- `listDocuments(templateId)` - ドキュメント一覧取得

### 履歴管理
- `listVersions(recordId, templateId)` - 版履歴一覧取得
- `getVersionData(recordId, templateId, version)` - 版データ取得

### PDF管理
- `generatePdf(payload)` - PDF生成
- `listPdfExports(recordId, templateId)` - PDF出力履歴取得

### AI支援
- `aiAssist(payload)` - AI支援（ローカルLLM統合ポイント）

### ダッシュボード
- `getDashboardStats()` - ダッシュボード集計データ取得

---

## 実装済みテンプレート

### 1. complaint_record_v1（苦情処理記録）
**ファイル**: `data/templates/complaint_record_v1.json`

主要フィールド：
- complaint_id: 苦情番号（自動生成: CR-YYYY-NNNN）
- received_date: 受付日
- complaint_content: 苦情内容
- root_cause: 原因分析（AI支援あり）
- interim_action: 暫定対応（AI支援あり）
- status: ステータス（受付中/調査中/対応中/完了）
- related_corrective_actions: 関連是正処置（link型）

**PDF出力**: ✅ 対応済み（complaint_record_v1_layout.json）

### 2. corrective_action_v1（是正処置記録）
**ファイル**: `data/templates/corrective_action_v1.json`

主要フィールド：
- corrective_action_id: 是正処置番号（自動生成: CA-{complaint_id}）
- source_record_type: リンク元の種類（complaint_record_v1）
- source_record_id: リンク元のID
- related_complaint_id: 関連苦情ID
- corrective_action: 是正処置内容
- planned_date: 実施予定日
- actual_date: 実施日
- status: ステータス（計画中/実施中/確認中/クローズ）

**PDF出力**: ✅ 対応済み（corrective_action_v1_layout.json）

---

## 🎯 次回セッションでの作業予定

### 優先度順
1. **検索・フィルター機能の実装**
   - 記録番号での絞り込み
   - 日付範囲フィルター
   - ステータス別フィルター

2. **入力バリデーション強化**
   - 必須フィールドのバリデーション
   - 日付の論理チェック
   - エラーメッセージの改善

3. **UI改善**
   - セクション折りたたみ機能
   - レスポンシブデザインの強化
   - アクセシビリティ改善

---

## 更新履歴

- **2025-01-15**: プロジェクト初期セットアップ、FEATURES.md作成
- **2025-11-14**: Phase 1-3完了（基本CRUD、PDF出力、履歴・差分表示）
- **2025-11-15 午前**: Phase 5-7完了（是正処置機能、AI支援、ダッシュボード）
- **2025-11-15 午後**: Phase 8完了（ビルド・パッケージング設定、BoltNew対応）
- **2025-11-16**: 是正処置記録のPDF出力・履歴機能完全統合、ドキュメント更新
- **2025-12-02**: Phase 9完了（初回起動自動セットアップ、パス解決最適化、preload.ts可読性向上）

---

## 🗂 重要な注意事項

### このドキュメントについて
このCLAUDE.mdは、プロジェクトの**公式記憶ノート**として扱われます。

以下の情報を包括的に記録します：
- アーキテクチャの設計判断
- IPC API名称
- テンプレート構造
- 完成した機能
- 作成されたファイルとページ
- ブレークポイント（開発の区切り）
- 次のタスク

### 次回セッション開始時の手順
1. **まずこのCLAUDE.mdを読む**（全体像・現在地の把握）
2. **docs/FEATURES.mdで詳細仕様を確認**（機能要件の詳細）
3. **該当する個別ドキュメントを参照**（PDF_EXPORT.md等）
4. **作業開始**

これにより、セッション間で情報が失われることなく、スムーズに作業を継続できます。

---

## 📝 開発メモ

### BoltNew環境について
- ✅ `npm run build` で正常にビルド可能（8-10秒）
- ✅ better-sqlite3 はネイティブ再ビルド不要で動作
- ✅ TypeScript/React/Electron コードはすべてコンパイル成功
- ❌ `npm run package` は実行不可（ネイティブモジュール再ビルドエラー）
- 📝 配布用インストーラーはローカルMacで作成

### 将来のローカルMacでの作業
1. Xcode Command Line Tools インストール: `xcode-select --install`
2. プロジェクトクローン＆依存関係インストール: `npm install`
3. パッケージング実行: `npm run package`
4. electron-builderが自動的に:
   - better-sqlite3をElectron用に再ビルド
   - macOS .dmgファイル作成
   - Windows .exeファイル作成（オプション）

### TypeScript型定義
- **グローバル型**: `src/renderer/global.d.ts`
- **Electron API型**: `src/renderer/types/electron.d.ts`
- **テンプレート型**: `src/renderer/types/template.ts`
- **レコード型**: `src/renderer/types/record.ts`

すべての型定義は完備されており、TypeScriptコンパイラエラーはゼロ。

---

**ステータス**: ✅ Phase 1-9完了、初回起動自動セットアップ実装完了、プロダクション配布準備完了

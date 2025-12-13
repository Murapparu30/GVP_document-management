# QMS Local App 機能一覧

## 1. アプリ概要

- 医療機器QMS／メンテナンス企業向けのローカル帳票管理アプリ
- オフライン運用前提（社外ネットワークとは通信しない）
- 帳票テンプレート＋PDF出力＋履歴＋差分＋PDF出力ログが中核機能

## 2. 主な機能

### 2-1. 帳票テンプレート管理

- `data/templates` にJSONでテンプレートを配置
- フィールド定義（id / label / type / required / ai_assist など）
- 苦情処理記録（complaint_record_v1）を最初のターゲットとする

#### テンプレートJSON構造例

```json
{
  "template_id": "complaint_record_v1",
  "template_name": "苦情処理記録",
  "version": "1.0",
  "fields": [
    {
      "id": "complaint_id",
      "label": "苦情番号",
      "type": "text",
      "required": true
    },
    {
      "id": "received_date",
      "label": "受付日",
      "type": "date",
      "required": true
    },
    {
      "id": "complaint_content",
      "label": "苦情内容",
      "type": "textarea",
      "required": true,
      "ai_assist": true
    }
  ]
}
```

### 2-2. DynamicForm 入力画面

- テンプレJSONを読み込んでフォームを自動生成
- typeごとのコンポーネント：
  - `text`: 1行テキスト入力
  - `textarea`: 複数行テキスト入力
  - `date`: 日付入力
  - `select`: ドロップダウン選択
  - `link`: 他レコードへのリンク参照
- `required` フィールドのバリデーション（必須チェック）
- 入力内容はリアルタイムで状態管理

### 2-3. 記録の保存（JSON + SQLite）

#### JSON保存形式

- 各レコード = 1 JSONファイル（例：`records/complaint/CR-2025-0001_v1.json`）
- JSONの meta + data 構造：

```json
{
  "meta": {
    "record_id": "CR-2025-0001",
    "template_id": "complaint_record_v1",
    "version": 1,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z",
    "updated_by": "yamada_taro"
  },
  "data": {
    "complaint_id": "CR-2025-0001",
    "received_date": "2025-01-10",
    "complaint_content": "製品の動作不良について..."
  }
}
```

#### SQLite構造

SQLiteは一覧・検索用の情報のみ保持：

**documentsテーブル**
- `record_id` (PRIMARY KEY): レコード識別子
- `template_id`: 使用テンプレート
- `latest_version`: 最新版番号
- `created_at`: 初回作成日時
- `updated_at`: 最終更新日時
- `updated_by`: 最終更新者

**document_versionsテーブル**
- `id` (PRIMARY KEY): 自動採番
- `record_id`: レコード識別子
- `version`: 版番号
- `file_path`: JSONファイルパス
- `created_at`: 版作成日時
- `created_by`: 版作成者

### 2-4. 版管理・履歴・差分

#### 版管理

- 更新のたびに version を +1 して新JSONファイルを作成
- 例：
  - `CR-2025-0001_v1.json` (初版)
  - `CR-2025-0001_v2.json` (第2版)
  - `CR-2025-0001_v3.json` (第3版)
- 旧版は削除せず保持（QMS要件）

#### 履歴画面

- レコードごとの版一覧を表示
- 各版の作成日時・作成者を表示
- 任意の版を選択して内容表示・PDF出力が可能

#### 差分表示

- 任意の2版の差分をフィールド単位で表示
- 変更されたフィールドをハイライト
- 変更前・変更後の値を並べて表示

### 2-5. PDF出力

#### レイアウト定義

- `data/layouts` に JSON でPDFレイアウトを配置
- layout.json に基づいてA4縦のPDFを生成

#### PDF構造

**ヘッダー**
- 帳票名
- record_id（レコード番号）
- version（版番号）
- 更新日時

**本文**
- フィールドごとの label と value を整形して出力
- テキストの折り返し・改ページ対応

**フッター**
- PDF出力日時
- ページ番号（X / Y ページ）

#### 実装予定

- pdfkit（または同等ライブラリ）を使用
- Electron mainプロセスで生成
- 出力先: `data/exports/[record_id]_v[version]_[timestamp].pdf`

### 2-6. PDF出力ログ

#### ログ管理

**pdf_exportsテーブル**
- `id` (PRIMARY KEY): 自動採番
- `document_id`: レコード識別子
- `version`: PDF化した版番号
- `file_path`: 出力PDFパス
- `exported_at`: 出力日時
- `exported_by`: 出力者
- `purpose`: 出力目的（メモ）

#### PDF出力履歴画面

- 1レコードごとの「PDF出力履歴」を表示
- いつ・誰が・どの版をPDF化したかを追跡
- 出力済みPDFを開く機能

### 2-7. 管理ダッシュボード

#### 概要

アプリケーション起動時のデフォルト画面として、QMS記録の全体状況を一目で把握できるダッシュボード機能を提供。

#### 表示内容

**苦情処理記録の集計**
- 総件数
- 未完了件数（ステータスが「完了」以外）
- ステータス別の件数一覧
- 最終更新日時

**是正処置記録の集計**
- 総件数
- 未完了件数（ステータスが「クローズ」以外）
- 期限超過件数（実施予定日が過去で未クローズ）
- 期限間近件数（実施予定日が7日以内で未クローズ）
- ステータス別の件数一覧

**要注意項目の強調表示**
- 期限超過の是正処置を赤色で警告
- 期限間近の是正処置を黄色で注意喚起
- 全件期限内の場合は緑色でOK表示

#### IPC通信

**getDashboardStats**
- SQLiteから苦情処理記録・是正処置記録の集計データを取得
- ステータス別のグループ化集計
- 日付計算による期限判定

#### ナビゲーション

トップレベルナビゲーションバーに以下のボタンを配置：
- **ダッシュボード**: DashboardPageへ遷移（デフォルト画面）
- **苦情処理記録**: ComplaintListPageへ遷移
- **是正処置記録**: CorrectiveActionListPageへ遷移

## 3. ディレクトリ構成

```
qms-local-app/
├── src/
│   ├── main/              # Electron Mainプロセス
│   │   ├── main.ts        # アプリエントリーポイント
│   │   ├── preload.ts     # Preloadスクリプト
│   │   ├── ipc/           # IPCハンドラ（後で実装）
│   │   └── pdf/           # PDF出力ロジック（後で実装）
│   └── renderer/          # React アプリ本体
│       ├── main.tsx       # React エントリーポイント
│       ├── App.tsx        # メインコンポーネント
│       ├── index.html     # HTMLテンプレート
│       ├── components/    # DynamicForm・履歴など（後で実装）
│       └── types/         # Template / Layout / Record の型定義
├── data/
│   ├── templates/         # 帳票テンプレートJSON
│   ├── layouts/           # PDFレイアウトJSON
│   ├── records/           # 実データJSON（版付き）
│   ├── db/                # SQLiteファイル
│   └── exports/           # 出力済みPDF
├── docs/
│   └── FEATURES.md        # このドキュメント
├── CLAUDE.md              # プロジェクト情報とドキュメント位置のメモ
└── package.json
```

## 4. 非機能要件

### セキュリティ・運用

- **完全ローカル動作**: 外部HTTP通信を一切行わない
- **ネットワーク制限**: 社内LAN／NASまでの通信のみ許可
- **データ永続性**: QMS的観点から履歴・版情報を削除しない設計

### プラットフォーム

- **優先**: Windows 10/11
- **将来対応**: macOS（必要に応じて）

### パフォーマンス

- 起動時間: 5秒以内
- PDF生成: 1帳票あたり10秒以内

### データ管理

- JSONファイルは可読性を重視（フォーマット済み）
- SQLiteはインデックスを適切に設定し高速検索を実現
- バックアップは外部ツール（NASへのコピー等）で対応

## 5. 今後の拡張予定

- AI補助機能（ローカルLLM連携）
- 電子署名対応
- 監査証跡の強化
- 複数ユーザー管理（同一PC上での切り替え）
- テンプレートエディタ（GUI）

## 6. 開発フェーズ

### フェーズ1: 基本機能（現在）

- Electronプロジェクト構築
- DynamicForm実装
- JSON保存
- SQLite基本機能

### フェーズ2: PDF・版管理

- PDF出力機能
- 版管理・履歴表示
- 差分表示

### フェーズ3: 運用改善

- PDF出力ログ
- 検索機能強化
- UI/UX改善

---

## 更新履歴

- 2025-01-15: 初版作成

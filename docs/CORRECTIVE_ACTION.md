# 是正処置記録機能（Corrective Action Records）

## 概要

是正処置記録機能は、QMSにおける是正処置（CAPA: Corrective and Preventive Action）を管理する機能です。本システムでは、苦情処理記録と緊密に連携し、苦情に対する是正処置を効率的に作成・管理できます。

## 実装日
2025-11-15

---

## テンプレート構成

### テンプレートファイル
**パス**: `data/templates/corrective_action_v1.json`

### PDFレイアウトファイル
**パス**: `data/layouts/corrective_action_v1_layout.json`

### データ保存ディレクトリ
**パス**: `data/records/corrective/`

各是正処置記録は以下の形式で保存されます：
```
data/records/corrective/CA-CR-2025-0001_v1.json
data/records/corrective/CA-CR-2025-0001_v2.json
...
```

---

## データ構造

### 主要フィールド

| フィールド名 | フィールドID | 型 | 説明 |
|------------|-------------|-----|------|
| 是正処置番号 | `ca_id` | text | 是正処置記録の一意なID（例: CA-CR-2025-0001） |
| 発生源記録種別 | `source_record_type` | select | 是正処置の発生元（例: 苦情、内部監査、など） |
| 発生源記録番号 | `source_record_id` | text | 発生元の記録番号 |
| 関連苦情番号 | `related_complaint_id` | text | 関連する苦情記録のID |
| 不適合の内容 | `nonconformity_description` | textarea | 発見された不適合の詳細 |
| 原因分析 | `root_cause_analysis` | textarea | 根本原因の分析結果 |
| 是正処置内容 | `corrective_action_plan` | textarea | 実施する是正処置の計画 |
| 実施責任者 | `responsible_person` | text | 是正処置の実施責任者 |
| 期限 | `due_date` | date | 是正処置の完了期限 |
| 実施状況 | `implementation_status` | select | 実施状況（計画中/実施中/完了/保留） |
| 実施完了日 | `completion_date` | date | 是正処置の完了日 |
| 効果確認方法 | `verification_method` | textarea | 是正処置の効果を確認する方法 |
| 効果確認結果 | `verification_result` | textarea | 効果確認の結果 |
| 効果確認者 | `verified_by` | text | 効果確認を行った担当者 |
| 効果確認日 | `verification_date` | date | 効果確認を実施した日 |
| 承認者 | `approved_by` | text | 是正処置を承認した責任者 |
| 承認日 | `approval_date` | date | 承認された日 |
| 備考 | `remarks` | textarea | その他の特記事項 |

---

## 苦情処理記録との連携

### リンクフィールド

苦情処理記録には `linked_corrective_id` フィールドがあり、関連する是正処置記録のIDを保持します。

**苦情処理記録の構造**:
```json
{
  "complaint_id": "CR-2025-0001",
  "linked_corrective_id": "CA-CR-2025-0001",
  ...
}
```

**是正処置記録の構造**:
```json
{
  "ca_id": "CA-CR-2025-0001",
  "source_record_type": "苦情",
  "source_record_id": "CR-2025-0001",
  "related_complaint_id": "CR-2025-0001",
  ...
}
```

### 自動ID生成

苦情処理記録から是正処置を新規作成する際、IDは自動生成されます：

**生成ルール**:
```
CA-{complaint_id}
```

**例**:
- 苦情ID: `CR-2025-0001` → 是正処置ID: `CA-CR-2025-0001`
- 苦情ID: `CR-2025-0042` → 是正処置ID: `CA-CR-2025-0042`

### 自動入力フィールド

是正処置記録を苦情から作成する際、以下のフィールドが自動的に入力されます：

| フィールド | 自動入力値 |
|-----------|-----------|
| `ca_id` | `CA-{complaint_id}` |
| `source_record_type` | "苦情" |
| `source_record_id` | 苦情のID |
| `related_complaint_id` | 苦情のID |

---

## ワークフロー

### 1. 苦情から是正処置を作成する場合

```
1. ComplaintDetailPage を開く
   ↓
2. 苦情記録を入力・保存
   ↓
3. 「関連是正処置」パネルで「関連是正処置を新規作成」をクリック
   ↓
4. システムが以下を実行：
   - 是正処置ID（CA-{complaint_id}）を生成
   - 苦情記録の linked_corrective_id を更新
   - 苦情記録を自動保存
   - CorrectiveActionDetailPage に遷移
   ↓
5. 是正処置フォームが以下の値で事前入力される：
   - ca_id: CA-CR-2025-0001
   - source_record_type: 苦情
   - source_record_id: CR-2025-0001
   - related_complaint_id: CR-2025-0001
   ↓
6. 是正処置の内容を入力して保存
```

### 2. 既存の是正処置を開く場合

```
1. ComplaintDetailPage を開く（既に linked_corrective_id が設定済み）
   ↓
2. 「関連是正処置」パネルで「関連是正処置を開く」をクリック
   ↓
3. CorrectiveActionDetailPage に遷移し、既存の是正処置記録を表示
```

### 3. 是正処置を直接作成する場合

```
1. トップナビゲーションで「是正処置記録」タブを選択
   ↓
2. CorrectiveActionListPage で「新規作成」をクリック
   ↓
3. CorrectiveActionDetailPage で是正処置記録を入力
   ↓
4. 必要に応じて source_record_type や source_record_id を手動で入力
   ↓
5. 保存
```

---

## 画面構成

### CorrectiveActionListPage（是正処置一覧画面）

**ファイルパス**: `src/renderer/pages/CorrectiveActionListPage.tsx`

**機能**:
- 是正処置記録の一覧表示
- 記録番号、発生源、実施状況、更新日時などの表示
- 検索・フィルター機能（将来実装予定）
- 新規作成ボタン
- レコードクリックで詳細画面に遷移

**表示項目**:
- 是正処置番号（ca_id）
- 発生源記録種別（source_record_type）
- 実施状況（implementation_status）
- 最終更新日時
- 最新版番号

### CorrectiveActionDetailPage（是正処置詳細画面）

**ファイルパス**: `src/renderer/pages/CorrectiveActionDetailPage.tsx`

**機能**:
- DynamicForm による動的フォーム生成
- 是正処置記録の入力・編集
- 版管理機能
- 履歴・差分表示
- PDF出力
- 保存機能

**主要セクション**:
1. 基本情報（是正処置番号、発生源情報）
2. 不適合と原因分析
3. 是正処置計画
4. 実施状況
5. 効果確認
6. 承認情報

---

## ナビゲーション

### トップナビゲーション

App.tsx には2つのメインタブがあります：

1. **苦情処理記録**（Complaint Records）
   - アイコン: FileText
   - クリックで ComplaintListPage に遷移

2. **是正処置記録**（Corrective Action Records）
   - アイコン: ClipboardCheck
   - クリックで CorrectiveActionListPage に遷移

### クロスナビゲーション

ComplaintDetailPage から CorrectiveActionDetailPage への遷移：
```typescript
// App.tsx
const handleNavigateToCorrectiveAction = (recordId: string | null) => {
  setViewState({ mode: 'detail', template: 'corrective_action', recordId });
};

// ComplaintDetailPage
<button onClick={handleOpenOrCreateCorrective}>
  {formData.linked_corrective_id ? '関連是正処置を開く' : '関連是正処置を新規作成'}
</button>
```

---

## PDF出力機能

是正処置記録も苦情処理記録と同様に、PDF出力機能を持ちます。

**PDFレイアウト設定**: `data/layouts/corrective_action_v1_layout.json`

**出力ファイル保存先**: `data/exports/`

**ファイル名形式**:
```
CA-CR-2025-0001_v1_20251115_143022.pdf
```

**PDF出力ログ**:
- `pdf_exports` テーブルに記録
- 出力者、出力日時、目的などを記録
- QMS監査証跡要件に対応

---

## 版管理

是正処置記録も完全な版管理機能を持ちます。

**版管理の動作**:
- 初回保存時: version 1
- 更新のたびに version を +1
- 各版は個別のJSONファイルとして保存
- 旧版も削除せず保持（QMS要件）

**データベーステーブル**:
- `documents`: 是正処置記録のメタ情報
- `document_versions`: 各版の情報

**履歴・差分表示**:
- RecordHistoryPanel で版履歴を表示
- RecordDiffView でフィールド単位の差分表示
- 任意の2つの版を選択して比較可能

---

## QMS準拠

### 監査証跡

是正処置記録は以下の監査証跡要件に準拠しています：

1. **誰が**: updated_by フィールドで記録
2. **いつ**: created_at, updated_at で記録
3. **何を**: 版管理により全変更履歴を保持
4. **なぜ**: PDF出力時に目的を記録

### データ保全

- 論理削除のみ（物理削除禁止）
- 全版の永久保存
- JSONファイル + SQLite の二重管理

### トレーサビリティ

- 苦情 → 是正処置のリンク
- 是正処置 → 苦情への逆参照（related_complaint_id）
- 完全な変更履歴

---

## 開発者向け情報

### 新しいフィールドの追加

1. `data/templates/corrective_action_v1.json` を編集
2. DynamicForm が自動的に新フィールドを表示
3. 必要に応じて `data/layouts/corrective_action_v1_layout.json` を更新

### 他のテンプレートへの拡張

是正処置記録の実装パターンは他のテンプレート（内部監査記録、予防処置記録など）にも適用可能です：

1. 新しいテンプレートJSONを作成
2. ListPage と DetailPage をコピーして調整
3. App.tsx にナビゲーションを追加
4. 必要に応じてリンク機能を実装

---

## 将来の拡張案

### 優先度高

1. **是正処置から苦情への逆ナビゲーション**
   - CorrectiveActionDetailPage に「元の苦情を開く」ボタン追加

2. **複数是正処置対応**
   - 1つの苦情に対して複数の是正処置を紐付け

3. **ステータス同期**
   - 是正処置完了時に苦情のステータスを自動更新

### 優先度中

4. **テンプレート化**
   - よく使う是正処置内容をテンプレート化

5. **期限管理・アラート**
   - 是正処置の期限が近づいたら通知

6. **統計・レポート**
   - 是正処置の実施状況を集計

---

## まとめ

是正処置記録機能は、QMSにおける是正処置管理を効率化し、苦情処理記録との緊密な連携により、問題発見から是正処置完了までのトレーサビリティを確保します。

**主な特徴**:
- 苦情から是正処置への自動リンク
- 自動ID生成と事前入力
- 完全な版管理
- PDF出力とログ記録
- QMS監査証跡要件への準拠
- クロスナビゲーション

詳細な実装情報は `COMPLAINT_CORRECTIVE_LINK.md` を参照してください。

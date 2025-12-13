# 履歴・差分表示機能 - 技術ドキュメント

このドキュメントは、QMS Local Appにおける版履歴管理と差分表示機能の技術詳細を説明します。

## 目次

1. [概要](#概要)
2. [版管理の概念](#版管理の概念)
3. [データベース設計](#データベース設計)
4. [履歴パネルの動作](#履歴パネルの動作)
5. [差分計算ロジック](#差分計算ロジック)
6. [UIコンポーネント](#uiコンポーネント)
7. [他のテンプレートへの拡張](#他のテンプレートへの拡張)

---

## 概要

QMSの監査証跡要件を満たすため、すべての帳票更新履歴を保持し、任意の版間の差分を表示できる機能を提供します。

### 主な機能

- **版履歴一覧表示**: レコードのすべてのバージョンを時系列で表示
- **差分表示**: 任意の2つのバージョン間でフィールド単位の変更を可視化
- **監査証跡**: 各版の作成日時・作成者を記録

---

## 版管理の概念

### バージョニングの原則

1. **イミュータブル（不変性）**
   - 一度作成された版は**変更されない**
   - 更新時は必ず新しい版を作成

2. **完全履歴保持**
   - すべての版を物理的に保持（削除禁止）
   - 各版は独立したJSONファイルとして保存

3. **自動バージョン管理**
   - 保存時に自動的にバージョン番号をインクリメント
   - ユーザーが手動でバージョン番号を指定する必要はない

### ファイル命名規則

```
data/records/<template_id>/<record_id>_v<version>.json
```

例:
```
data/records/complaint_record_v1/CR-2025-0001_v1.json
data/records/complaint_record_v1/CR-2025-0001_v2.json
data/records/complaint_record_v1/CR-2025-0001_v3.json
```

---

## データベース設計

### テーブル構造

#### documents テーブル
ドキュメントのメタ情報を保持（最新版の情報のみ）

```sql
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  latest_version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT,
  updated_by TEXT,
  UNIQUE(record_id, template_id)
);
```

#### document_versions テーブル
すべての版の情報を保持

```sql
CREATE TABLE IF NOT EXISTS document_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  created_at TEXT NOT NULL,
  created_by TEXT,
  UNIQUE(record_id, template_id, version)
);
```

### データフロー

1. **新規作成時**
   ```
   documents に新規レコード挿入 (version=1)
   → document_versions に v1 挿入
   → JSONファイル作成 (xxx_v1.json)
   ```

2. **更新時**
   ```
   documents の latest_version をインクリメント
   → document_versions に新版挿入
   → JSONファイル作成 (xxx_v<new_version>.json)
   → 旧版のJSONファイルは保持（削除しない）
   ```

3. **履歴取得時**
   ```sql
   SELECT * FROM document_versions
   WHERE record_id = ? AND template_id = ?
   ORDER BY version DESC
   ```

---

## 履歴パネルの動作

### RecordHistoryPanel コンポーネント

**場所**: `src/renderer/components/history/RecordHistoryPanel.tsx`

**役割**: 指定されたレコードのすべてのバージョンを一覧表示

#### Props

```typescript
type RecordHistoryPanelProps = {
  recordId: string;        // レコードID
  templateId: string;      // テンプレートID
  onSelectForDiff: (version: number) => void;  // 差分比較用の版選択コールバック
};
```

#### 主要な機能

1. **版一覧の取得**
   ```typescript
   const versions = await window.electronAPI.listVersions(recordId, templateId);
   ```

2. **版情報の表示**
   - バージョン番号
   - 作成日時
   - 作成者
   - 「比較に追加」ボタン

3. **版の選択**
   - ユーザーが版を選択すると `onSelectForDiff(version)` が呼ばれる
   - 親コンポーネント（ComplaintDetailPage）で左版・右版を管理

#### データフロー

```
RecordHistoryPanel
  ↓ (マウント時)
window.electronAPI.listVersions()
  ↓
IPC: handle('list-versions')
  ↓
src/main/ipc/history.ts
  ↓
SQLite: SELECT FROM document_versions
  ↓
[{version, created_at, created_by}, ...]
  ↓
UI表示
```

---

## 差分計算ロジック

### RecordDiffView コンポーネント

**場所**: `src/renderer/components/history/RecordDiffView.tsx`

**役割**: 2つのバージョン間の差分をフィールド単位で表示

#### Props

```typescript
type RecordDiffViewProps = {
  template: TemplateDefinition;   // テンプレート定義
  recordId: string;               // レコードID
  templateId: string;             // テンプレートID
  leftVersion: number | null;     // 左側（比較元）のバージョン
  rightVersion: number | null;    // 右側（比較先）のバージョン
  onReset?: () => void;           // 選択リセットコールバック
};
```

#### 差分計算の流れ

1. **バージョンデータの取得**
   ```typescript
   const [leftResult, rightResult] = await Promise.all([
     window.electronAPI.getRecordVersion(recordId, templateId, leftVersion),
     window.electronAPI.getRecordVersion(recordId, templateId, rightVersion)
   ]);
   ```

2. **フィールド単位での比較**
   ```typescript
   template.fields.map((field) => {
     const leftValue = leftData.data[field.id];
     const rightValue = rightData.data[field.id];
     const isDifferent = valuesAreDifferent(leftValue, rightValue);
     // ...
   });
   ```

3. **値の正規化と比較**
   ```typescript
   const formatValue = (value: any): string => {
     if (value === null || value === undefined) return '';
     if (typeof value === 'object') return JSON.stringify(value);
     return String(value);
   };

   const valuesAreDifferent = (leftVal: any, rightVal: any): boolean => {
     const left = formatValue(leftVal);
     const right = formatValue(rightVal);
     return left !== right;
   };
   ```

#### 差分の表示

- **差分なし**: 通常の背景色
- **差分あり**: 黄色の背景色（`bg-yellow-50`）+ ★マーク
- **未入力**: グレーの斜体で「（未入力）」と表示

#### 差分表示テーブル

| 項目 | v1の値 | v3の値 | 変更 |
|------|--------|--------|------|
| 苦情内容 | 旧テキスト | 新テキスト | ★ |
| 原因分析 | 同じ内容 | 同じ内容 | ー |
| 対策 | （未入力） | 追加された内容 | ★ |

---

## UIコンポーネント

### 統合UI: ComplaintDetailPage

**場所**: `src/renderer/pages/ComplaintDetailPage.tsx`

#### 状態管理

```typescript
const [showHistory, setShowHistory] = useState(false);
const [leftVersion, setLeftVersion] = useState<number | null>(null);
const [rightVersion, setRightVersion] = useState<number | null>(null);
```

#### レイアウト構造

```
┌─────────────────────────────────────────┐
│ [履歴・差分を表示] ボタン                  │
└─────────────────────────────────────────┘
            ↓ (クリック時)
┌─────────────────────────────────────────┐
│ ┌─────────────┬─────────────────────┐  │
│ │ 履歴パネル   │ 差分表示              │  │
│ │             │                      │  │
│ │ v3 比較追加 │ 比較対象: v2 vs v3    │  │
│ │ v2 比較追加 │                      │  │
│ │ v1 比較追加 │ [比較リセット]        │  │
│ │             │                      │  │
│ │             │ 差分テーブル...       │  │
│ └─────────────┴─────────────────────┘  │
└─────────────────────────────────────────┘
```

#### 版選択ロジック

```typescript
onSelectForDiff={(v) => {
  if (leftVersion === null) {
    setLeftVersion(v);      // 1つ目の選択 → 左版に設定
  } else if (rightVersion === null) {
    setRightVersion(v);     // 2つ目の選択 → 右版に設定
  } else {
    setLeftVersion(v);      // すでに2つ選択済み → 左版をリセットして再設定
    setRightVersion(null);
  }
}}
```

---

## 他のテンプレートへの拡張

履歴・差分機能はテンプレート非依存の設計になっており、新しいテンプレートにも容易に適用できます。

### 拡張手順

#### 1. 新しいテンプレートの作成

```json
{
  "template_id": "new_template_v1",
  "template_name": "新しい帳票",
  "fields": [
    { "id": "field1", "label": "項目1", "type": "text" },
    { "id": "field2", "label": "項目2", "type": "textarea" }
  ]
}
```

#### 2. データベースへのレコード保存

- `documents` テーブルに `template_id = "new_template_v1"` で保存
- `document_versions` テーブルに各版を保存
- 既存のIPC（`saveRecord`, `getRecordVersion`）がそのまま使える

#### 3. 履歴・差分UIの統合

新しいテンプレート用の詳細ページで、以下のコンポーネントを追加：

```typescript
import { RecordHistoryPanel } from '../components/history/RecordHistoryPanel';
import { RecordDiffView } from '../components/history/RecordDiffView';

// ... 状態管理とレイアウト（ComplaintDetailPageと同じ構造）

<RecordHistoryPanel
  recordId={recordId}
  templateId="new_template_v1"
  onSelectForDiff={handleSelectForDiff}
/>

<RecordDiffView
  template={template}
  recordId={recordId}
  templateId="new_template_v1"
  leftVersion={leftVersion}
  rightVersion={rightVersion}
  onReset={handleReset}
/>
```

#### 4. IPCハンドラ（変更不要）

既存のIPCハンドラがそのまま動作します：

- `listVersions(recordId, templateId)` - 版一覧取得
- `getRecordVersion(recordId, templateId, version)` - 特定版取得

### 差分計算のカスタマイズ

特殊なフィールドタイプで差分計算をカスタマイズしたい場合：

```typescript
// RecordDiffView.tsx 内の valuesAreDifferent 関数を拡張
const valuesAreDifferent = (
  leftVal: any,
  rightVal: any,
  fieldType?: string
): boolean => {
  // 日付フィールドの場合、日付として比較
  if (fieldType === 'date') {
    const leftDate = new Date(leftVal);
    const rightDate = new Date(rightVal);
    return leftDate.getTime() !== rightDate.getTime();
  }

  // 配列フィールドの場合、要素ごとに比較
  if (Array.isArray(leftVal) && Array.isArray(rightVal)) {
    return JSON.stringify(leftVal) !== JSON.stringify(rightVal);
  }

  // デフォルトの比較ロジック
  const left = formatValue(leftVal);
  const right = formatValue(rightVal);
  return left !== right;
};
```

---

## まとめ

### 履歴・差分機能の特徴

1. **テンプレート非依存**: どのテンプレートでも同じロジックで動作
2. **完全な監査証跡**: すべての版を保持し、削除しない
3. **直感的なUI**: 版の選択と差分表示が一体化
4. **拡張性**: 新しいテンプレートへの適用が容易

### 技術的な利点

- **SQLiteとJSONのハイブリッド**: 検索性能と柔軟性を両立
- **React Hooks**: 状態管理が明確で保守しやすい
- **IPC分離**: フロントエンドとバックエンドの責務が明確

### 今後の拡張可能性

- 差分のエクスポート（PDF、CSV）
- 特定フィールドのみの差分表示
- 版のロールバック機能
- 複数版の一括比較

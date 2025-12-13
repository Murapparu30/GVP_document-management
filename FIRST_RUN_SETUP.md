# 初回起動時の自動セットアップ

## 概要

QMSローカルアプリは、初回起動時に必要な環境を自動的にセットアップします。ユーザーは**アプリをダウンロードして起動するだけ**で、すぐに使用できます。

## 自動セットアップの内容

### 1. ディレクトリ構造の自動作成

初回起動時に以下のディレクトリが自動作成されます：

```
~/Library/Application Support/qms-local-app/  (macOS)
または
%APPDATA%/qms-local-app/                       (Windows)
│
├── data/
│   ├── db/                    # SQLiteデータベース
│   │   └── qms.db
│   ├── records/               # レコードJSON
│   │   ├── complaint/         # 苦情処理記録
│   │   └── corrective/        # 是正処置記録
│   └── exports/               # PDF出力先
```

### 2. データベースの自動初期化

**テーブル作成（4テーブル）：**
- `documents` - ドキュメントメタ情報
- `document_versions` - 版履歴
- `pdf_exports` - PDF出力ログ
- `users` - ユーザー管理

**インデックス作成（5個）：**
- 高速検索のための最適化

**デフォルトユーザー作成（4名）：**
```
山田 太郎 (yamada) - 品質保証部 マネージャー
佐藤 花子 (sato)   - 品質保証部 スタッフ
鈴木 次郎 (suzuki) - 品質保証部 スタッフ
田中 美咲 (tanaka) - 品質保証部 スタッフ
```

### 3. テンプレートとレイアウトの自動配置

アプリバンドルに含まれるテンプレートを直接参照：
- `data/templates/complaint_record_v1.json`
- `data/templates/corrective_action_v1.json`
- `data/layouts/complaint_record_v1_layout.json`
- `data/layouts/corrective_action_v1_layout.json`

## 実装の詳細

### ファイル構成

```
src/main/
├── main.ts                    # エントリーポイント（setupFirstRun統合）
├── setup/
│   └── firstRun.ts           # 初回起動セットアップロジック
└── db/
    └── index.ts              # DB初期化（テーブル・ユーザー作成）
```

### 初回起動の判定

```typescript
// DBファイルの存在チェック
export function isFirstRun(): boolean {
  const userDataPath = app.getPath('userData');
  const dbPath = join(userDataPath, 'data', 'db', 'qms.db');
  return !existsSync(dbPath);
}
```

### セットアップフロー

```typescript
app.whenReady().then(() => {
  // 1. 初回起動チェック
  const firstRun = isFirstRun();

  if (firstRun) {
    console.log('🚀 First run detected - Setting up application...');

    // 2. ディレクトリ作成
    setupFirstRun();
  }

  // 3. IPCハンドラ登録
  setupTemplateHandlers();
  setupRecordHandlers();
  // ...

  // 4. DB初期化（テーブル・ユーザー作成）
  require('./db');

  // 5. メインウィンドウ表示
  createWindow();
});
```

## ユーザーエクスペリエンス

### 初回起動時

1. ユーザーがアプリをダブルクリック
2. **自動的にセットアップ実行（数秒）**
3. ダッシュボード画面が表示
4. **すぐに使用可能** ✅

### 2回目以降の起動

1. ユーザーがアプリをダブルクリック
2. 既存のデータを読み込み
3. ダッシュボード画面が表示
4. **即座に使用可能** ✅

## データの保存場所

### macOS
```
~/Library/Application Support/qms-local-app/data/
```

### Windows
```
%APPDATA%\qms-local-app\data\
```

### Linux
```
~/.config/qms-local-app/data/
```

## バックアップ方法

ユーザーは以下をバックアップするだけ：

```bash
# macOSの例
cp -r ~/Library/Application\ Support/qms-local-app/data ~/Documents/qms-backup/
```

または、アプリ内のエクスポート機能を使用：
- JSONバックアップ
- CSVエクスポート

## トラブルシューティング

### データベースが破損した場合

1. アプリを終了
2. `data/db/qms.db` を削除
3. アプリを再起動（自動的に再セットアップ）

### データをリセットしたい場合

1. アプリを終了
2. `data/` フォルダ全体を削除
3. アプリを再起動（初回セットアップが実行される）

## 開発者向け情報

### セットアップのカスタマイズ

`src/main/setup/firstRun.ts` を編集して、初回セットアップをカスタマイズ可能：

```typescript
export function setupFirstRun(): void {
  // 追加のディレクトリ
  // 追加の初期化処理
  // カスタムデフォルト値など
}
```

### デフォルトユーザーの変更

`src/main/db/index.ts` を編集：

```typescript
const defaultUsers = [
  { username: 'your_user', full_name: '名前', department: '部署', role: 'manager' },
  // ...
];
```

## セキュリティ

- ✅ すべてのデータはローカルに保存
- ✅ 外部通信なし
- ✅ ユーザーデータディレクトリに格納（OS標準）
- ✅ ファイルシステムの権限で保護

## まとめ

**QMSローカルアプリは「ダウンロード → クリック → すぐ使える」を実現しています。**

- ✅ 初回起動時の自動セットアップ
- ✅ 必要なディレクトリ自動作成
- ✅ データベース自動初期化
- ✅ デフォルトユーザー自動登録
- ✅ ユーザー操作不要
- ✅ 即座に使用可能

**追加のインストール作業は一切不要です。**

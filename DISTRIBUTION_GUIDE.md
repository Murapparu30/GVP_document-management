# 配布用パッケージ作成ガイド

## 前提条件

- Node.js 18以上がインストールされていること
- Windows向けビルド: Windows環境
- Mac向けビルド: macOS環境

## 手順

### 1. プロジェクトのダウンロード

このプロジェクトをローカルマシンにダウンロードします。

### 2. 依存関係のインストール

プロジェクトディレクトリで以下を実行：

```bash
npm install
```

### 3. ビルド

アプリケーションをビルドします：

```bash
npm run build
```

### 4. パッケージング

#### Windows向け（.exe インストーラー）

Windows環境で以下を実行：

```bash
npm run package
```

完成したインストーラーは `release/` フォルダに生成されます：
- `QMS Local App Setup x.x.x.exe` - Windows用インストーラー

#### Mac向け（.dmg）

macOS環境で以下を実行：

```bash
npm run package
```

完成したインストーラーは `release/` フォルダに生成されます：
- `QMS Local App-x.x.x.dmg` - Mac用インストーラー

## 配布

生成されたインストーラーファイルを配布してください。

### ファイルサイズ

- Windows: 約100-150MB
- Mac: 約120-180MB

## インストール先

インストール後、ユーザーのデータは以下の場所に保存されます：

### Windows
```
C:\Users\[ユーザー名]\AppData\Roaming\QMS Local App\data\
```

### Mac
```
~/Library/Application Support/QMS Local App/data/
```

## データ構造

```
data/
├── db/
│   └── qms.db              # SQLiteデータベース
├── records/
│   ├── complaint/          # 苦情記録JSON
│   └── corrective/         # 是正措置JSON
├── exports/                # 生成されたPDF
├── templates/              # テンプレート定義
└── layouts/                # PDF レイアウト定義
```

## トラブルシューティング

### ビルドエラーが発生した場合

1. `node_modules`を削除して再インストール：
```bash
rm -rf node_modules package-lock.json
npm install
```

2. キャッシュをクリア：
```bash
npm run build
```

### パッケージングエラーが発生した場合

electron-builderのキャッシュをクリア：
```bash
npx electron-builder install-app-deps
npm run package
```

## セキュリティ

- このアプリケーションは**完全にローカル**で動作します
- インターネット接続は不要です
- データは外部に送信されません
- SQLiteデータベース（sql.js）を使用しています

## バージョン更新

`package.json`の`version`フィールドを更新してから`npm run package`を実行してください。

# Preload モジュール形式修正 - 作業進捗メモ

**日付**: 2025年12月7日  
**状態**: ⚠️ 進行中 - 明日継続予定

---

## 📌 今日やったこと（概要）

ユーザー登録後に `window.electronAPI` が undefined エラーが発生する問題を解決するための作業を開始。

**原因を特定**: Preload スクリプトの **モジュール形式ミスマッチ**
- Main プロセス: `dist-electron/main.js` (ESM 形式)
- Preload スクリプト: `dist-electron/preload.cjs` (CJS 形式) ← **不一致！**
- ESM の main が CJS の preload を読み込めず、`contextBridge.exposeInMainWorld()` が実行されない

---

## 🔧 実装した修正

### 1. **vite.config.ts を修正** ✅
```typescript
// preload エントリを CJS → ESM に変更
preload: {
  input: 'src/main/preload.ts',
  formats: ['es'],  // 変更: ['cjs']
  fileName: () => 'preload.js'  // 変更: 'preload.cjs'
}
```
**目的**: Vite が preload を ESM 形式 (`preload.js`) として出力するように指示

**ファイル**: `/Users/murakamishunsuke/Desktop/project 3/vite.config.ts`

### 2. **src/main/main.ts を修正** ✅
```typescript
// preload パスを更新
preload: path.join(app.getAppPath(), 'dist-electron', 'preload.js'),
```
**目的**: main.ts から preload の参照を `.cjs` → `.js` に変更

**ファイル**: `/Users/murakamishunsuke/Desktop/project 3/src/main/main.ts` (line 27)

---

## ❌ 発生した問題

### **問題**: Vite の再ビルドが完了していない

**症状**:
```
Unable to load preload script: /Users/murakamishunsuke/Desktop/project 3/dist-electron/preload.cjs
SyntaxError: Failed to construct 'ContextifyScript': Cannot use import statement outside a module
```

**原因**: 
- `dist-electron/preload.cjs` がまだ存在している
- `dist-electron/preload.js` が生成されていない
- Vite の自動再ビルド機能が完全に完了していない可能性

**確認コマンド実行結果**:
```bash
$ find /Users/murakamishunsuke/Desktop/project\ 3/dist-electron -name "preload*"
/Users/murakamishunsuke/Desktop/project 3/dist-electron/preload.cjs  # ← まだ古いファイルが存在
# preload.js は存在しない
```

---

## 🚀 明日やること（優先順）

### **Step 1: 完全なクリーンリビルド** （最重要）
```bash
# 1. すべてのプロセスを停止
pkill -f "npm run" || true
pkill -f "Electron" || true
sleep 2

# 2. dist-electron を完全削除
rm -rf /Users/murakamishunsuke/Desktop/project\ 3/dist-electron

# 3. npm run dev を実行して Vite をビルド（前と同じプロセスで実行）
cd /Users/murakamishunsuke/Desktop/project\ 3
npm run dev
```

**確認ポイント**: 
- Vite が完全にビルド完了するまで待つ
- `dist-electron/preload.js` が生成されたか確認
- `dist-electron/preload.cjs` が存在しないことを確認

### **Step 2: Electron の起動と動作確認**
```bash
# 別のターミナルから
npm run electron:dev
```

**確認項目**:
1. DevTools コンソールで以下を実行:
   ```javascript
   window.electronAPI
   ```
   - ✅ 成功: `{ createUser, listUsers, ... }` のようなオブジェクトが表示される
   - ❌ 失敗: `undefined` が表示される → Step 1 に戻る

2. ユーザー登録フォームをテスト:
   - 新規ユーザー登録を試みる
   - "Cannot read properties of undefined" エラーが出ないか確認
   - コンソールにエラーが出なければ成功

### **Step 3: 完全なフロー検証** (Step 2 が成功したら)
```
新規ユーザー登録 → ログイン → ダッシュボード表示 → サイドバー表示 → 苦情処理リスト閲覧
```

---

## 📋 修正内容の参考情報

### **vite.config.ts の全体像**
ファイルパス: `/Users/murakamishunsuke/Desktop/project 3/vite.config.ts`

```typescript
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'src/main/main.ts',
        viteConfig: {
          build: {
            rollupOptions: {
              external: ['electron', 'sql.js'],
            },
          },
        },
        formats: ['es'],      // ESM 形式
        fileName: () => 'main.js'
      },
      {
        entry: 'src/main/preload.ts',
        viteConfig: {
          build: {
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
        formats: ['es'],      // ← ここを CJS → ESM に変更した！
        fileName: () => 'preload.js'  // ← ここを preload.cjs → preload.js に変更した！
      },
    ]),
    electronRenderer(),
  ],
  // ... 以下省略
});
```

### **main.ts の preload 参照**
ファイルパス: `/Users/murakamishunsuke/Desktop/project 3/src/main/main.ts` (line 20-33)

```typescript
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(app.getAppPath(), 'dist-electron', 'preload.js'),  // ← 変更
      sandbox: false,
    },
  });
  // ...
}
```

---

## 🎯 技術的背景

### なぜこのエラーが起きたのか？

1. **Package.json で ESM を指定**: `"type": "module"`
2. **Vite で main を ESM ビルド**: `formats: ['es']`
3. **しかし preload は CJS でビルド**: `formats: ['cjs']` ← 問題！

Electron の main プロセスが ESM (`main.js`) で実行される場合、読み込む preload も ESM 形式 (`preload.js`) でなければならない。CJS の preload.cjs は ESM の main から正しく読み込めず、preload 内の `contextBridge.exposeInMainWorld()` が実行されない。

### 解決策

**両方を ESM で統一する**:
- Main: `main.js` (ESM) ✅ 既にこうなっている
- Preload: `preload.js` (ESM) ✅ 今日修正した（ただしまだビルドが反映されていない）

---

## 📝 トラブルシューティング用チェックリスト

明日の作業で引っかかった場合：

- [ ] `npm run dev` で Vite がちゃんとビルドされたか確認
  - `dist-electron/preload.js` ファイルが存在するか
  - `dist-electron/preload.cjs` ファイルが存在しないか

- [ ] `dist-electron/preload.js` の内容確認
  ```bash
  cat /Users/murakamishunsuke/Desktop/project\ 3/dist-electron/preload.js | head -n 50
  ```
  - ESM 形式 (`import` / `export`) で始まるか確認
  - `contextBridge.exposeInMainWorld` が含まれているか確認

- [ ] Electron のコンソールエラーをよく読む
  - "Unable to load preload script" → preload ファイルが見つからない
  - "Cannot use import statement outside a module" → preload が CJS のまま

- [ ] DevTools が開かない場合
  ```bash
  # Electron の起動時に F12 を押す、またはコンソールでこれを実行：
  mainWindow.webContents.openDevTools();
  ```

---

## 🔗 関連ファイル一覧

| ファイル | 役割 | 状態 |
|---------|------|------|
| `vite.config.ts` | Vite ビルド設定 | ✅ 修正済み |
| `src/main/main.ts` | Electron Main プロセス | ✅ preload パス更新済み |
| `src/main/preload.ts` | Preload スクリプト | ✅ ソースは OK（ビルド待ち） |
| `dist-electron/main.js` | ビルド済み main | ✅ 最新 |
| `dist-electron/preload.js` | ビルド済み preload | ⏳ 生成待ち |
| `dist-electron/preload.cjs` | 古いファイル | ❌ 削除待ち |

---

**📌 最重要**: 明日最初にやることは「完全なクリーンリビルド」です。  
`dist-electron` フォルダを削除して、`npm run dev` で一度すべて再ビルドしてください！

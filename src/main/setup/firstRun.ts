import { app } from 'electron';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

/**
 * 初回起動時のセットアップ
 * アプリケーション起動時に必要なディレクトリを自動作成
 */
export function setupFirstRun(): void {
  const userDataPath = app.getPath('userData');

  // 必要なディレクトリ構造
  const directories = [
    join(userDataPath, 'data'),
    join(userDataPath, 'data', 'db'),
    join(userDataPath, 'data', 'records'),
    join(userDataPath, 'data', 'records', 'complaint'),
    join(userDataPath, 'data', 'records', 'corrective'),
    join(userDataPath, 'data', 'exports'),
  ];

  // ディレクトリを作成
  for (const dir of directories) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  }

  console.log('✅ First run setup completed');
}

/**
 * 初回起動かどうかを判定
 */
export function isFirstRun(): boolean {
  const userDataPath = app.getPath('userData');
  const dbPath = join(userDataPath, 'data', 'db', 'qms.db');
  return !existsSync(dbPath);
}

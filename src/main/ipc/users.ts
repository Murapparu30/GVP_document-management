import { ipcMain } from 'electron';
import { dbWrapperPromise } from '../db';

console.log('[users.ts] Module loaded');

interface User {
  id: number;
  username: string;
  full_name: string;
  department: string;
  role: string;
  created_at: string;
  last_login?: string;
}

interface CreateUserInput {
  username: string;
  full_name: string;
  department: string;
  role: string;
}

interface UpdateUserInput {
  id: number;
  full_name?: string;
  department?: string;
  role?: string;
}


async function listUsers() {
  try {
    const db = await dbWrapperPromise;
    const users = db
      .prepare('SELECT * FROM users WHERE is_active = 1 ORDER BY created_at DESC')
      .all() as User[];

    return { ok: true, users };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[listUsers] error', errorMessage);
    return { ok: false, error: errorMessage };
  }
}

async function createUser(input: CreateUserInput) {
  console.log('[createUser] called with input:', input);
  try {
    console.log('[createUser] awaiting DB wrapper...');
    const db = await dbWrapperPromise;
    console.log('[createUser] DB wrapper acquired');
    const { username, full_name, department, role } = input;

    const existing = db
      .prepare('SELECT id FROM users WHERE username = ?')
      .get(username);

    if (existing) {
      return { ok: false, error: 'このユーザー名は既に使用されています' };
    }

    if (!username || !full_name || !department || !role) {
      return { ok: false, error: '全ての項目を入力してください' };
    }

    if (username.length < 3) {
      return { ok: false, error: 'ユーザー名は3文字以上である必要があります' };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { ok: false, error: 'ユーザー名は英数字とアンダースコアのみ使用できます' };
    }

    const result = db.prepare(`
      INSERT INTO users (username, full_name, department, role, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(username, full_name, department, role, new Date().toISOString());

    const userId = result.lastInsertRowid as number;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;

    return { ok: true, user };
  } catch (error) {
    // Log the full error (with stack) to aid debugging of ESM/UMD interop issues
    console.error('[createUser] error', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { ok: false, error: errorMessage };
  }
}

async function updateUser(input: UpdateUserInput) {
  try {
    const db = await dbWrapperPromise;
    const { id, full_name, department, role } = input;

    const updates: string[] = [];
    const values: any[] = [];

    if (full_name) {
      updates.push('full_name = ?');
      values.push(full_name);
    }
    if (department) {
      updates.push('department = ?');
      values.push(department);
    }
    if (role) {
      updates.push('role = ?');
      values.push(role);
    }

    if (updates.length === 0) {
      return { ok: false, error: '更新する項目がありません' };
    }

    values.push(id);

    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User;

    return { ok: true, user };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[updateUser] error', errorMessage);
    return { ok: false, error: errorMessage };
  }
}

async function deleteUser(userId: number) {
  try {
    const db = await dbWrapperPromise;
    db.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(userId);
    return { ok: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[deleteUser] error', errorMessage);
    return { ok: false, error: errorMessage };
  }
}

async function updateLastLogin(username: string) {
  try {
    const db = await dbWrapperPromise;
    db.prepare('UPDATE users SET last_login = ? WHERE username = ?').run(
      new Date().toISOString(),
      username
    );
    return { ok: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[updateLastLogin] error', errorMessage);
    return { ok: false, error: errorMessage };
  }
}

export function setupUserHandlers() {
  ipcMain.handle('listUsers', async () => {
    return listUsers();
  });

  ipcMain.handle('createUser', async (_, input: CreateUserInput) => {
    return createUser(input);
  });

  ipcMain.handle('updateUser', async (_, input: UpdateUserInput) => {
    return updateUser(input);
  });

  ipcMain.handle('deleteUser', async (_, userId: number) => {
    return deleteUser(userId);
  });

  ipcMain.handle('updateLastLogin', async (_, username: string) => {
    return updateLastLogin(username);
  });
}

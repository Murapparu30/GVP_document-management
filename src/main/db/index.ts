// `sql.js` ships an Emscripten UMD bundle that may attempt to set `module.exports` when
// loaded in some bundling/ESM environments. To avoid runtime errors like
// "Cannot set properties of undefined (setting 'exports')" we dynamically import
// the module at runtime and ensure a CommonJS `module`/`exports` object exists.
import type { Database as SqlJsDatabase } from 'sql.js';
import { join } from 'path';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { app } from 'electron';

const userDataPath = app.getPath('userData');
const dbDir = join(userDataPath, 'data', 'db');

if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const dbPath = join(dbDir, 'qms.db');

let db: SqlJsDatabase;

async function initDatabase() {
  // Ensure `global.module`/`global.exports` exist for UMD/CommonJS interop
  const g: any = global as any;
  if (typeof g.module === 'undefined') g.module = { exports: {} };
  if (typeof g.exports === 'undefined') g.exports = g.module.exports;

  // Try multiple paths to load sql.js:
  // 1. First try the bundled main export (works if sql.js is bundled as CJS)
  // 2. Fall back to direct file import
  // 3. Fall back to require-style dynamic load
  let initSqlJs: any;

  try {
    // Primary approach: standard import of the sql.js module
    const sqlModule = await import('sql.js') as any;
    initSqlJs = sqlModule.default || sqlModule.initSqlJs || sqlModule;
  } catch (err1: any) {
    console.warn('Standard sql.js import failed, trying alternative paths:', err1?.message || String(err1));
    try {
      // Fallback: try the wasm variant directly
      const sqlModule = await import('sql.js/dist/sql-wasm.js') as any;
      initSqlJs = sqlModule.default || sqlModule.initSqlJs || sqlModule;
    } catch (err2: any) {
      console.warn('sql-wasm import failed, trying require:', err2?.message || String(err2));
      // Last resort: use createRequire to load sql.js as CommonJS
      try {
        const { createRequire } = await import('module');
        const require = createRequire(import.meta.url);
        const sqlModule = require('sql.js');
        initSqlJs = sqlModule.default || sqlModule.initSqlJs || sqlModule;
      } catch (err3: any) {
        console.error('All sql.js loading attempts failed:', err3?.message || String(err3));
        throw err3;
      }
    }
  }

  const SQL = await initSqlJs({
    locateFile: (file: string) => {
      if (app.isPackaged) {
        return join(app.getAppPath().replace('app.asar', 'app.asar.unpacked'), 'node_modules', 'sql.js', 'dist', file);
      }
      return join(process.cwd(), 'node_modules', 'sql.js', 'dist', file);
    }
  });

  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  return db;
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

const dbPromise = initDatabase().then((database) => {
  database.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id TEXT NOT NULL,
      template_id TEXT NOT NULL,
      latest_version INTEGER NOT NULL,
      title TEXT,
      status TEXT,
      product_name TEXT,
      complaint_date TEXT,
      source_record_id TEXT,
      due_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS document_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER NOT NULL,
      version INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      status TEXT,
      created_at TEXT NOT NULL,
      created_by TEXT NOT NULL,
      FOREIGN KEY (document_id) REFERENCES documents(id)
    );

    CREATE TABLE IF NOT EXISTS pdf_exports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER NOT NULL,
      version INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      exported_at TEXT NOT NULL,
      exported_by TEXT NOT NULL,
      purpose TEXT,
      FOREIGN KEY (document_id) REFERENCES documents(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      department TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_login TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS template_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id TEXT NOT NULL,
      template_name TEXT NOT NULL,
      action TEXT NOT NULL,
      created_at TEXT NOT NULL,
      created_by TEXT NOT NULL,
      details TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_documents_record_id ON documents(record_id);
    CREATE INDEX IF NOT EXISTS idx_documents_template_id ON documents(template_id);
    CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
    CREATE INDEX IF NOT EXISTS idx_pdf_exports_document_id ON pdf_exports(document_id);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_template_logs_template_id ON template_logs(template_id);
  `);

  // Migration: Add status column to document_versions if it doesn't exist
  try {
    const tableInfo = database.exec('PRAGMA table_info(document_versions)')[0].values;
    const hasStatus = tableInfo.some(col => col[1] === 'status');
    if (!hasStatus) {
      database.run('ALTER TABLE document_versions ADD COLUMN status TEXT');
    }
  } catch (e) {
    console.error('Migration error:', e);
  }

  // Check logic removed: defined default users are no longer inserted automatically.

  return database;
});


class DatabaseWrapper {
  private db: SqlJsDatabase;

  constructor(database: SqlJsDatabase) {
    this.db = database;
  }

  // Convert undefined to null for SQL binding compatibility
  private sanitizeParams(params: any[]): any[] {
    return params.map(p => p === undefined ? null : p);
  }

  prepare(sql: string) {
    return {
      get: (...params: any[]) => {
        try {
          const stmt = this.db.prepare(sql);
          stmt.bind(this.sanitizeParams(params));
          if (stmt.step()) {
            const columns = stmt.getColumnNames();
            const values = stmt.get();
            const result: any = {};
            columns.forEach((col, idx) => {
              result[col] = values[idx];
            });
            stmt.free();
            return result;
          }
          stmt.free();
          return undefined;
        } catch (error) {
          console.error('Error in prepare.get:', error);
          return undefined;
        }
      },
      all: (...params: any[]) => {
        try {
          const stmt = this.db.prepare(sql);
          stmt.bind(this.sanitizeParams(params));
          const columns = stmt.getColumnNames();
          const results: any[] = [];
          while (stmt.step()) {
            const values = stmt.get();
            const row: any = {};
            columns.forEach((col, idx) => {
              row[col] = values[idx];
            });
            results.push(row);
          }
          stmt.free();
          return results;
        } catch (error) {
          console.error('Error in prepare.all:', error);
          return [];
        }
      },
      run: (...params: any[]) => {
        try {
          this.db.run(sql, this.sanitizeParams(params));
          const changes = this.db.getRowsModified();
          const lastId = this.db.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0];
          saveDatabase();
          return {
            changes,
            lastInsertRowid: lastId
          };
        } catch (error) {
          console.error('Error in prepare.run:', error);
          throw error;
        }
      }
    };
  }

  exec(sql: string) {
    return this.db.exec(sql);
  }

  run(sql: string, params?: any[]) {
    this.db.run(sql, params);
    saveDatabase();
  }
}

let dbWrapper: DatabaseWrapper;

const dbWrapperPromise = dbPromise.then((database) => {
  dbWrapper = new DatabaseWrapper(database);
  return dbWrapper;
});

export { db, dbPromise, saveDatabase, dbWrapper, dbWrapperPromise };

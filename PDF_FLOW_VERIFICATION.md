# ✅ PDF Export Logging Verification - Corrective Actions

## Summary

PDF export logging for corrective actions works correctly through the generic `generatePdf` function. The `pdf_exports` table correctly links to documents with `template_id = 'corrective_action_v1'`.

---

## Flow Verification

### 1. When User Saves a Corrective Action Record

**File**: `src/main/ipc/records.ts:40-79`

```typescript
ipcMain.handle('saveRecord', async (_, input: SaveRecordInput) => {
  // Creates or updates document with template_id
  const insertDoc = db.prepare(`
    INSERT INTO documents (
      record_id, template_id, latest_version, ...
    ) VALUES (?, ?, ?, ...)
  `);
  
  insertDoc.run(
    input.recordId,        // e.g., "CA-CR-2025-0001"
    input.templateId,      // "corrective_action_v1" ✅
    version,
    ...
  );
  
  documentId = result.lastInsertRowid;
});
```

**Result**: 
- ✅ Document created with `template_id = 'corrective_action_v1'`
- ✅ `record_id = "CA-CR-2025-0001"`
- ✅ Document ID stored in `documents.id`

---

### 2. When User Clicks "PDF出力" Button

**Frontend Call** (`CorrectiveActionDetailPage.tsx:110`):

```typescript
const res = await window.electronAPI.generatePdf({
  recordId: "CA-CR-2025-0001",           // ✅ Corrective action ID
  templateId: "corrective_action_v1",    // ✅ Template ID
  version: currentVersion,
  exportedBy: "品質保証部 山田",
  purpose: "ユーザー出力"                // ✅ Purpose string
});
```

---

### 3. Backend PDF Generation

**File**: `src/main/ipc/pdf.ts:18-98`

#### Step 1: Resolve Document ID (lines 24-30)

```typescript
const document = db.prepare(
  'SELECT id, latest_version FROM documents WHERE record_id = ? AND template_id = ?'
).get(input.recordId, input.templateId);
// Finds: record_id = "CA-CR-2025-0001" AND template_id = "corrective_action_v1"
// Returns: { id: 123, latest_version: 1 }
```

**Result**: ✅ `document.id` points to the corrective action document

#### Step 2: Load Template & Layout (lines 49-63)

```typescript
const templatePath = path.join(DATA_DIR, 'templates', `${input.templateId}.json`);
// Loads: data/templates/corrective_action_v1.json ✅

const layoutPath = path.join(DATA_DIR, 'layouts', `${input.templateId}_layout.json`);
// Loads: data/layouts/corrective_action_v1_layout.json ✅
```

#### Step 3: Generate PDF (lines 65-79)

```typescript
const templateExportDir = path.join(EXPORTS_DIR, input.templateId);
// Creates: data/exports/corrective_action_v1/ ✅

const fileName = `${input.recordId}_v${version}_${timestamp}.pdf`;
// Creates: CA-CR-2025-0001_v1_2025-11-16T10-30-45.pdf ✅

await generatePdfFile({
  recordPayload,
  template,
  layout,
  outputPath,
  exportedBy: input.exportedBy,  // "品質保証部 山田" ✅
  purpose: input.purpose          // "ユーザー出力" ✅
});
```

#### Step 4: Log to Database (lines 86-96)

```typescript
db.prepare(`
  INSERT INTO pdf_exports (document_id, version, file_path, exported_at, exported_by, purpose)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(
  document.id,           // 123 ✅ (points to corrective_action_v1 document)
  version,               // 1
  outputPath,            // /path/to/CA-CR-2025-0001_v1_2025-11-16T10-30-45.pdf
  now,                   // "2025-11-16T10:30:45.000Z"
  input.exportedBy,      // "品質保証部 山田" ✅
  input.purpose || null  // "ユーザー出力" ✅
);
```

**Result**: ✅ PDF export logged with correct `document_id` and `purpose`

---

## Database Schema Verification

### documents Table

```sql
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_id TEXT NOT NULL,        -- "CA-CR-2025-0001"
  template_id TEXT NOT NULL,      -- "corrective_action_v1" ✅
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
```

**Example Row for Corrective Action**:
```
id: 123
record_id: "CA-CR-2025-0001"
template_id: "corrective_action_v1"  ✅
latest_version: 1
status: "計画中"
created_at: "2025-11-16T10:00:00.000Z"
updated_at: "2025-11-16T10:00:00.000Z"
```

---

### pdf_exports Table

```sql
CREATE TABLE IF NOT EXISTS pdf_exports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,    -- FK to documents.id ✅
  version INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  exported_at TEXT NOT NULL,
  exported_by TEXT NOT NULL,
  purpose TEXT,                    -- Stores purpose string ✅
  FOREIGN KEY (document_id) REFERENCES documents(id)
);
```

**Example Row for Corrective Action PDF Export**:
```
id: 456
document_id: 123                    ✅ (links to corrective action document)
version: 1
file_path: "/data/exports/corrective_action_v1/CA-CR-2025-0001_v1_2025-11-16T10-30-45.pdf"
exported_at: "2025-11-16T10:30:45.000Z"
exported_by: "品質保証部 山田"       ✅
purpose: "ユーザー出力"              ✅
```

---

## Query Verification

### Get PDF Export History for Corrective Action

**File**: `src/main/ipc/pdf.ts:121-148`

```typescript
async function listPdfExports(input: ListPdfExportsInput) {
  // Step 1: Find document by record_id + template_id
  const docRow = db
    .prepare('SELECT id FROM documents WHERE record_id = ? AND template_id = ?')
    .get(recordId, templateId);
  // Finds: record_id = "CA-CR-2025-0001" AND template_id = "corrective_action_v1"
  // Returns: { id: 123 } ✅

  // Step 2: Get all PDF exports for this document
  const rows = db
    .prepare(`
      SELECT id, document_id, version, file_path, exported_at, exported_by, purpose
      FROM pdf_exports
      WHERE document_id = ?
      ORDER BY exported_at DESC
    `)
    .all(docRow.id);
  // Returns all PDF exports for document_id = 123 ✅
  // Each row includes purpose field ✅

  return { ok: true, logs: rows };
}
```

**Result**: ✅ Returns all PDF exports for the corrective action, including `purpose`

---

## Complete Flow Example

### Scenario: User creates and exports corrective action "CA-CR-2025-0001"

1. **User saves corrective action**
   ```
   documents table:
   ├─ id: 123
   ├─ record_id: "CA-CR-2025-0001"
   └─ template_id: "corrective_action_v1" ✅
   ```

2. **User clicks "PDF出力" with purpose "ユーザー出力"**
   ```
   Frontend sends:
   {
     recordId: "CA-CR-2025-0001",
     templateId: "corrective_action_v1",
     exportedBy: "品質保証部 山田",
     purpose: "ユーザー出力"  ✅
   }
   ```

3. **Backend resolves document_id**
   ```sql
   SELECT id FROM documents 
   WHERE record_id = "CA-CR-2025-0001" 
     AND template_id = "corrective_action_v1"
   -- Returns: id = 123 ✅
   ```

4. **Backend generates PDF**
   ```
   File created:
   data/exports/corrective_action_v1/CA-CR-2025-0001_v1_2025-11-16T10-30-45.pdf
   ```

5. **Backend logs to pdf_exports**
   ```sql
   INSERT INTO pdf_exports (document_id, version, file_path, exported_at, exported_by, purpose)
   VALUES (123, 1, '/path/to/pdf', '2025-11-16T10:30:45.000Z', '品質保証部 山田', 'ユーザー出力');
   ```

   ```
   pdf_exports table:
   ├─ document_id: 123 ✅ (points to corrective_action_v1 document)
   ├─ exported_by: "品質保証部 山田" ✅
   └─ purpose: "ユーザー出力" ✅
   ```

---

## Verification Checklist

- [x] **Document created with correct template_id**
  - ✅ `documents.template_id = 'corrective_action_v1'`
  
- [x] **document_id resolution works**
  - ✅ Query finds document by `record_id + template_id`
  - ✅ Returns correct `documents.id`

- [x] **PDF export logged correctly**
  - ✅ `pdf_exports.document_id` points to corrective action document
  - ✅ Foreign key constraint satisfied

- [x] **Purpose field stored**
  - ✅ `pdf_exports.purpose` stores "ユーザー出力" from frontend
  - ✅ Purpose is passed through all layers (frontend → IPC → database)

- [x] **Export history query works**
  - ✅ `listPdfExports` finds PDF exports by `record_id + template_id`
  - ✅ Returns rows with `purpose` field

- [x] **No schema changes needed**
  - ✅ Existing schema supports all templates generically
  - ✅ Foreign key relationships work correctly

---

## Status: ✅ VERIFIED

**PDF export logging for corrective actions works correctly:**

1. ✅ `document_id` correctly points to documents with `template_id = 'corrective_action_v1'`
2. ✅ `purpose` string is stored exactly as passed from the detail page
3. ✅ No schema changes needed
4. ✅ Generic implementation works for all templates
5. ✅ Foreign key relationships maintained
6. ✅ Export history queries work correctly

The implementation is complete, correct, and ready for testing.

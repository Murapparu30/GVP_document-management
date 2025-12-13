# PDF Export Feature - Technical Documentation

## Overview

The PDF export feature enables users to generate professional A4-sized PDF documents from QMS records (complaint records and corrective action records). The system uses a layout-driven approach where PDF structure and formatting are defined in JSON configuration files, allowing for flexible and maintainable PDF generation.

**Supported Templates:**
- `complaint_record_v1` - 苦情処理記録
- `corrective_action_v1` - 是正処置記録

---

## PDF Export Flow

### High-Level Process

```
User clicks "PDF出力" button
         ↓
Frontend (ComplaintDetailPage.tsx or CorrectiveActionDetailPage.tsx)
  → window.electronAPI.generatePdf(payload)
         ↓
IPC Bridge (preload.ts)
  → ipcRenderer.invoke('generatePdf', payload)
         ↓
Main Process (src/main/ipc/pdf.ts)
  → setupPdfHandlers() receives request
  → Loads record JSON from file system
  → Loads template definition
  → Loads layout definition
         ↓
PDF Generator (src/main/pdf/generator.ts)
  → Creates PDFDocument with layout settings
  → Renders header (title, record ID, version)
  → Renders sections with fields
  → Handles text wrapping and page breaks
  → Renders footer on all pages
  → Saves to file system
         ↓
Database Logging
  → Insert record into pdf_exports table
         ↓
Response to Frontend
  → { ok: true, path: "..." } or { ok: false, error: "..." }
```

### Detailed Step-by-Step

1. **User Interaction**
   - User opens a saved record (complaint or corrective action, must have recordId)
   - Clicks green "PDF出力" button
   - Button disabled for unsaved records

2. **Frontend Request**
   ```typescript
   // Complaint record example
   const res = await window.electronAPI.generatePdf({
     recordId: 'CR-2025-0001',
     templateId: 'complaint_record_v1',
     version: 1,              // optional, defaults to latest
     exportedBy: '品質保証部 山田',
     purpose: 'ユーザー出力'   // optional
   });

   // Corrective action example
   const res = await window.electronAPI.generatePdf({
     recordId: 'CA-CR-2025-0001',
     templateId: 'corrective_action_v1',
     version: 1,
     exportedBy: '品質保証部 山田',
     purpose: 'ユーザー出力'
   });
   ```

3. **Data Loading (Main Process)**
   - Load record data from `data/records/{complaint|corrective}/[recordId]_v[version].json`
   - Load template definition from `data/templates/[templateId].json`
   - Load layout definition from `data/layouts/[templateId]_layout.json`

   Examples:
   - Complaint: `data/records/complaint/CR-2025-0001_v1.json`
   - Corrective: `data/records/corrective/CA-CR-2025-0001_v1.json`

4. **PDF Generation**
   - Initialize PDFKit document with page size and margins
   - Render document header with metadata
   - Iterate through layout sections
   - For each field: render label and value with proper spacing
   - Handle text wrapping for long content
   - Insert page breaks when needed
   - Render footer with page numbers and timestamp

5. **File Output**
   - Generate filename: `[recordId]_v[version]_[ISO-timestamp].pdf`
   - Save to `data/exports/` directory
   - Example: `CR-2025-0001_v1_2025-11-14T10-30-00.pdf`

6. **Database Logging**
   - Insert export record into `pdf_exports` table
   - Store: document_id, version, file_path, timestamp, user, purpose

7. **User Feedback**
   - Success: Alert with file path
   - Error: Alert with error message

---

## File Paths for Exports

### Export Directory
```
data/
└── exports/
    ├── complaint_record_v1/
    │   ├── CR-2025-0001_v1_2025-11-14T10-30-00.pdf
    │   ├── CR-2025-0001_v2_2025-11-14T14-15-30.pdf
    │   └── CR-2025-0002_v1_2025-11-14T16-45-12.pdf
    └── corrective_action_v1/
        ├── CA-CR-2025-0001_v1_2025-11-15T09-20-15.pdf
        └── CA-CR-2025-0002_v1_2025-11-15T11-45-30.pdf
```

PDFs are organized by template type for easier management.

### Filename Convention
```
[record_id]_v[version]_[ISO-timestamp].pdf
│           │          │
│           │          └─ ISO 8601 format (colons replaced with dashes)
│           └─ Version number
└─ Record ID
```

Benefits:
- **Unique**: Timestamp prevents filename collisions
- **Sortable**: Natural alphabetical sort shows chronological order
- **Traceable**: Easy to identify which record and version
- **Human-readable**: Clear meaning without needing database lookup

---

## Database Schema: pdf_exports Table

### Schema Definition

```sql
CREATE TABLE pdf_exports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  version INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  exported_at TEXT NOT NULL,
  exported_by TEXT NOT NULL,
  purpose TEXT,
  FOREIGN KEY (document_id) REFERENCES documents(id)
);
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | INTEGER | Auto-incrementing primary key |
| `document_id` | INTEGER | Foreign key to `documents` table |
| `version` | INTEGER | Version number of the exported record |
| `file_path` | TEXT | Full path to the generated PDF file |
| `exported_at` | TEXT | ISO 8601 timestamp of export |
| `exported_by` | TEXT | Name/identifier of user who exported |
| `purpose` | TEXT | Optional reason for export (e.g., "内部確認用") |

### Example Query: Get Export History

```typescript
const exports = db.prepare(`
  SELECT
    pdf_exports.*,
    documents.record_id,
    documents.template_id
  FROM pdf_exports
  INNER JOIN documents ON pdf_exports.document_id = documents.id
  WHERE documents.record_id = ?
  ORDER BY pdf_exports.exported_at DESC
`).all(recordId);
```

### QMS Compliance

This table provides complete audit trail for all record types:
- **Who**: `exported_by` field
- **When**: `exported_at` timestamp
- **What**: `record_id`, `version`, `file_path`
- **Why**: Optional `purpose` field
- **Which**: Resolved via `document_id` → `documents.template_id` (complaint_record_v1 or corrective_action_v1)

**Important**: The `document_id` foreign key links to the `documents` table where `template_id` identifies whether this is a complaint or corrective action record. The same table structure supports all template types.

---

## Layout JSON Mapping to PDF Rendering

### Layout JSON Structure

Location: `data/layouts/[template_id]_layout.json`

```json
{
  "layout_id": "complaint_record_v1_layout",
  "template_id": "complaint_record_v1",
  "page_size": "A4",
  "orientation": "portrait",
  "margins": {
    "top": 50,
    "bottom": 50,
    "left": 50,
    "right": 50
  },
  "header": {
    "show_title": true,
    "show_record_id": true,
    "show_version": true,
    "show_date": true
  },
  "footer": {
    "show_page_number": true,
    "show_export_date": true
  },
  "sections": [
    {
      "title": "基本情報",
      "fields": ["complaint_id", "complaint_date", "received_from"]
    },
    {
      "title": "苦情内容",
      "fields": ["description"]
    }
  ]
}
```

### Mapping to PDF Rendering

#### Page Settings
```typescript
// layout.json
"page_size": "A4",
"orientation": "portrait"

// PDF Generator (generator.ts)
const doc = new PDFDocument({
  size: 'A4',           // Maps to page_size
  layout: 'portrait',   // Maps to orientation
  margins: {
    top: 50,            // Maps to margins.top
    bottom: 50,         // Maps to margins.bottom
    left: 50,           // Maps to margins.left
    right: 50           // Maps to margins.right
  }
});
```

#### Header Rendering
```typescript
// layout.json
"header": {
  "show_title": true,
  "show_record_id": true,
  "show_version": true,
  "show_date": true
}

// PDF Generator
if (layout.header.show_title) {
  doc.fontSize(16).font('Helvetica-Bold').text(template.template_name);
}
if (layout.header.show_record_id) {
  doc.fontSize(10).text(`記録番号: ${data.complaint_id}`);
}
// ... similar for version and date
```

#### Section Rendering
```typescript
// layout.json
"sections": [
  {
    "title": "基本情報",
    "fields": ["complaint_id", "complaint_date", "received_from"]
  }
]

// PDF Generator
layout.sections.forEach(section => {
  // Render section title
  doc.fontSize(12).font('Helvetica-Bold').text(section.title);

  // Render each field in the section
  section.fields.forEach(fieldId => {
    const field = template.fields.find(f => f.id === fieldId);
    const value = data[fieldId];

    if (value) {
      doc.fontSize(10).font('Helvetica-Bold').text(field.label + ':');
      doc.font('Helvetica').text(value, { indent: 20 });
    }
  });
});
```

#### Footer Rendering
```typescript
// layout.json
"footer": {
  "show_page_number": true,
  "show_export_date": true
}

// PDF Generator
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i);

  if (layout.footer.show_export_date) {
    doc.fontSize(8).text(`PDF出力日時: ${new Date().toLocaleString('ja-JP')}`);
  }

  if (layout.footer.show_page_number) {
    doc.text(`${i + 1} / ${range.count}`, { align: 'right' });
  }
}
```

### Field Type Handling

The generator handles different field types appropriately:

| Field Type | Rendering Behavior |
|------------|-------------------|
| `text` | Single line, truncates if too long |
| `textarea` | Multi-line with text wrapping |
| `date` | Formatted as YYYY-MM-DD |
| `select` | Displays selected value |
| `checkbox` | Not currently rendered |

---

## How to Extend PDF Logic for New Templates

### Step 1: Create Template JSON

Create `data/templates/[new_template_id].json`:

```json
{
  "template_id": "incident_report_v1",
  "template_name": "インシデント報告書",
  "version": "1.0",
  "fields": [
    {
      "id": "incident_id",
      "label": "インシデント番号",
      "type": "text",
      "required": true
    },
    {
      "id": "incident_date",
      "label": "発生日",
      "type": "date",
      "required": true
    }
    // ... more fields
  ]
}
```

### Step 2: Create Layout JSON

Create `data/layouts/[new_template_id]_layout.json`:

```json
{
  "layout_id": "incident_report_v1_layout",
  "template_id": "incident_report_v1",
  "page_size": "A4",
  "orientation": "portrait",
  "margins": {
    "top": 50,
    "bottom": 50,
    "left": 50,
    "right": 50
  },
  "header": {
    "show_title": true,
    "show_record_id": true,
    "show_version": true,
    "show_date": true
  },
  "footer": {
    "show_page_number": true,
    "show_export_date": true
  },
  "sections": [
    {
      "title": "インシデント情報",
      "fields": ["incident_id", "incident_date"]
    },
    {
      "title": "詳細",
      "fields": ["description", "actions_taken"]
    }
  ]
}
```

### Step 3: Test PDF Generation

No code changes needed! The existing generator will automatically:
- Load the new template
- Load the new layout
- Render according to the layout definition

```typescript
// Usage
const res = await window.electronAPI.generatePdf({
  recordId: 'INC-2025-0001',
  templateId: 'incident_report_v1',
  exportedBy: '安全管理部 佐藤',
  purpose: '月次報告用'
});
```

### Step 4: (Optional) Extend Generator for Custom Rendering

If you need custom rendering logic (e.g., tables, images, signatures):

Edit `src/main/pdf/generator.ts`:

```typescript
// Add custom rendering function
function renderCustomSection(doc: PDFKit.PDFDocument, section: any, data: any) {
  if (section.type === 'signature_table') {
    // Custom table rendering logic
    doc.fontSize(10).font('Helvetica-Bold').text('承認欄');
    // ... draw table lines, signature fields, etc.
  }
}

// Modify section rendering loop
layout.sections.forEach(section => {
  if (section.type) {
    // Custom section type
    renderCustomSection(doc, section, data);
  } else {
    // Default field-based rendering
    renderDefaultSection(doc, section, data, template);
  }
});
```

### Step 5: Update Layout JSON for Custom Features

```json
{
  "sections": [
    {
      "title": "基本情報",
      "fields": ["incident_id", "incident_date"]
    },
    {
      "title": "承認",
      "type": "signature_table",
      "config": {
        "signatures": [
          { "role": "報告者", "field": "reporter_name" },
          { "role": "管理者", "field": "manager_name" }
        ]
      }
    }
  ]
}
```

---

## Advanced Features

### Multi-Column Layout

To support multi-column layouts, extend the layout JSON:

```json
{
  "sections": [
    {
      "title": "基本情報",
      "layout": "two-column",
      "columns": [
        {
          "fields": ["incident_id", "incident_date"]
        },
        {
          "fields": ["reporter_name", "department"]
        }
      ]
    }
  ]
}
```

Then implement in generator.ts:

```typescript
if (section.layout === 'two-column') {
  const colWidth = (doc.page.width - margins.left - margins.right) / 2;
  renderColumn(doc, section.columns[0], x, y, colWidth);
  renderColumn(doc, section.columns[1], x + colWidth, y, colWidth);
}
```

### Conditional Rendering

Add conditions to layout JSON:

```json
{
  "sections": [
    {
      "title": "是正措置",
      "condition": {
        "field": "requires_corrective_action",
        "value": true
      },
      "fields": ["corrective_action_plan"]
    }
  ]
}
```

Implement in generator:

```typescript
sections.forEach(section => {
  if (section.condition) {
    const fieldValue = data[section.condition.field];
    if (fieldValue !== section.condition.value) {
      return; // Skip this section
    }
  }
  renderSection(doc, section, data);
});
```

### Images and Attachments

Extend layout to support images:

```json
{
  "sections": [
    {
      "title": "写真",
      "type": "images",
      "fields": ["photo1", "photo2"],
      "config": {
        "max_width": 200,
        "max_height": 150
      }
    }
  ]
}
```

---

## Troubleshooting

### Common Issues

**Issue**: "Layout not found"
- **Cause**: Missing layout JSON file
- **Solution**: Ensure `data/layouts/[template_id]_layout.json` exists

**Issue**: "Template not found"
- **Cause**: Missing template JSON file
- **Solution**: Ensure `data/templates/[template_id].json` exists

**Issue**: Text is cut off
- **Cause**: Text width exceeds page width
- **Solution**: Adjust margins in layout JSON or implement better text wrapping

**Issue**: PDF has blank pages
- **Cause**: Unnecessary `doc.addPage()` calls
- **Solution**: Review page break logic in generator.ts

**Issue**: Footer not showing on all pages
- **Cause**: Footer rendering not using `bufferedPageRange()`
- **Solution**: Use `doc.bufferedPageRange()` and loop through all pages

---

## Template-Specific Implementation Notes

### Complaint Records (`complaint_record_v1`)

**Layout File**: `data/layouts/complaint_record_v1_layout.json`

**Detail Page**: `src/renderer/pages/ComplaintDetailPage.tsx`

**Features**:
- PDF export button appears after saving
- PDF export history panel in collapsible history section
- Version history and diff view integration

**Typical Use Cases**:
- Internal review
- Customer response documentation
- Regulatory submission
- Audit trail

---

### Corrective Actions (`corrective_action_v1`)

**Layout File**: `data/layouts/corrective_action_v1_layout.json`

**Detail Page**: `src/renderer/pages/CorrectiveActionDetailPage.tsx`

**Features**:
- PDF export button appears after saving
- PDF export history panel in collapsible history section
- Version history and diff view integration
- Linked to source complaint record

**Typical Use Cases**:
- CAPA documentation
- Implementation tracking
- Effectiveness verification
- Management review

**Note**: Uses the same `generatePdf` IPC handler as complaint records. The system automatically:
1. Resolves `document_id` from `recordId` + `templateId`
2. Loads the correct template and layout files
3. Logs export to `pdf_exports` table with proper foreign key

---

## Future Enhancements

Potential improvements for the PDF system:

1. **Template Inheritance**: Base layouts that can be extended
2. **Dynamic Styling**: Font colors, sizes configurable per section
3. **Watermarks**: "DRAFT", "APPROVED" overlays
4. **Digital Signatures**: Cryptographic signatures for authenticity
5. **Batch Export**: Export multiple records in one operation
6. **PDF Preview**: In-app preview before saving
7. **Custom Fonts**: Support for Japanese fonts (currently uses Helvetica)
8. **Charts and Graphs**: Render data visualizations
9. **Localization**: Multi-language support in layouts

---

## Summary

The PDF export system is:
- **Flexible**: JSON-driven layouts, no code changes needed for new templates
- **Maintainable**: Clear separation between data, template, and layout
- **Auditable**: Complete export history in database
- **Extensible**: Easy to add custom rendering logic
- **QMS-Compliant**: Full traceability of who/when/what/why

The layout JSON approach allows non-developers to customize PDF appearance without touching code, making it suitable for long-term maintenance in a QMS environment.

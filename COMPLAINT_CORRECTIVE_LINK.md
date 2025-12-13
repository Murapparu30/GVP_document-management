# Complaint ↔ Corrective Action Linking Feature

## Overview

This document describes the bidirectional linking feature between Complaint Records and Corrective Action Records.

## Implementation Date

2025-11-15

## Features Implemented

### 1. Navigation System

**App.tsx** now supports cross-navigation between complaints and corrective actions:
- Users can switch between "苦情処理記録" (Complaint Records) and "是正処置記録" (Corrective Action Records) using top navigation tabs
- Navigation state maintains context when switching between modules
- New handler: `handleNavigateToCorrectiveAction(recordId)` enables cross-module navigation

### 2. Linked Corrective Action Panel (ComplaintDetailPage)

When viewing a complaint record, users see a prominent panel showing:

**If No Corrective Action Exists:**
- Message: "まだ是正処置記録が作成されていません"
- Button: "関連是正処置を新規作成" (Create New Related Corrective Action)
- Icon: Plus icon

**If Corrective Action Already Exists:**
- Shows the linked corrective action ID (e.g., "CA-CR-2025-0001")
- Button: "関連是正処置を開く" (Open Related Corrective Action)
- Icon: ClipboardCheck icon

**Visual Design:**
- Amber-themed panel (bg-amber-50, border-amber-200) to stand out
- Located between the form and action buttons
- Responsive layout with icon and text

### 3. Automatic ID Generation

When creating a corrective action from a complaint:

**Generated ID Format:**
```
CA-{complaint_id}
```

**Example:**
- Complaint ID: `CR-2025-0001`
- Generated Corrective Action ID: `CA-CR-2025-0001`

### 4. Auto-Population of Corrective Action Fields

When a corrective action is created from a complaint, the following fields are automatically pre-filled:

| Field | Value |
|-------|-------|
| `ca_id` | `CA-{complaint_id}` |
| `source_record_type` | "苦情" (Complaint) |
| `source_record_id` | The complaint's ID |
| `related_complaint_id` | The complaint's ID |

### 5. Bidirectional Link Storage

**In Complaint Record:**
- `linked_corrective_id` field stores the corrective action ID
- Automatically saved when creating a new corrective action
- Persists across versions

**In Corrective Action Record:**
- `source_record_id` and `related_complaint_id` reference the complaint
- Enables reverse lookup

## User Flow

### Creating a New Corrective Action from Complaint

1. User opens a complaint record (e.g., CR-2025-0001)
2. User saves the complaint if not already saved
3. User clicks "関連是正処置を新規作成"
4. System:
   - Generates ID: `CA-CR-2025-0001`
   - Updates complaint's `linked_corrective_id` field
   - Saves the complaint record
   - Navigates to corrective action detail page
   - Pre-fills the corrective action form with:
     - ca_id: `CA-CR-2025-0001`
     - source_record_type: "苦情"
     - source_record_id: `CR-2025-0001`
     - related_complaint_id: `CR-2025-0001`
5. User completes and saves the corrective action

### Opening an Existing Corrective Action

1. User opens a complaint record with an existing linked corrective action
2. Panel shows: "是正処置記録: CA-CR-2025-0001"
3. User clicks "関連是正処置を開く"
4. System navigates to the linked corrective action detail page

## Technical Details

### Files Modified

1. **src/renderer/App.tsx**
   - Added `handleNavigateToCorrectiveAction` handler
   - Updated ComplaintDetailPage props to include navigation callback

2. **src/renderer/pages/ComplaintDetailPage.tsx**
   - Added `onNavigateToCorrectiveAction` prop
   - Implemented `handleOpenOrCreateCorrective` function
   - Added linked corrective action panel UI
   - Auto-saves complaint when creating new corrective action

3. **src/renderer/pages/CorrectiveActionDetailPage.tsx**
   - Enhanced pre-fill logic for new records from complaints
   - Detects `CA-CR-` prefix to identify complaint-originated records
   - Auto-populates source fields

### Data Flow

```
Complaint Record (CR-2025-0001)
    |
    | User clicks "新規作成"
    |
    v
Generate CA-CR-2025-0001
    |
    | Save complaint with linked_corrective_id
    |
    v
Navigate to Corrective Action Detail
    |
    | Pre-fill form data
    |
    v
User completes and saves corrective action
```

## Code Example

### Opening or Creating Corrective Action

```typescript
const handleOpenOrCreateCorrective = async () => {
  if (!template || !formData.complaint_id) {
    alert('苦情記録を先に保存してください');
    return;
  }

  let caId = formData.linked_corrective_id as string | undefined;

  if (!caId) {
    // Generate new ID
    caId = `CA-${formData.complaint_id}`;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      linked_corrective_id: caId
    }));

    // Save complaint with link
    const saveRecordId = recordId || formData.complaint_id as string;
    await window.electronAPI.saveRecord({
      templateId: template.template_id,
      recordId: saveRecordId,
      data: { ...formData, linked_corrective_id: caId },
      user: currentUserName
    });
  }

  // Navigate to corrective action
  if (onNavigateToCorrectiveAction) {
    onNavigateToCorrectiveAction(caId);
  }
};
```

### Pre-filling Corrective Action Data

```typescript
if (recordId.startsWith('CA-CR-')) {
  const complaintId = recordId.replace('CA-', '');
  setFormData({
    ca_id: recordId,
    source_record_type: '苦情',
    source_record_id: complaintId,
    related_complaint_id: complaintId
  });
}
```

## UI Screenshots Description

### Linked Corrective Action Panel (No Link)
- Amber background panel below the form
- Text: "まだ是正処置記録が作成されていません"
- Blue button with plus icon: "関連是正処置を新規作成"

### Linked Corrective Action Panel (With Link)
- Amber background panel below the form
- Text: "是正処置記録: CA-CR-2025-0001" (monospace font)
- Amber button with clipboard icon: "関連是正処置を開く"

## Benefits

1. **Traceability**: Clear linkage between complaints and corrective actions
2. **Efficiency**: Auto-generation and pre-filling reduces manual data entry
3. **Compliance**: Maintains QMS audit trail requirements
4. **User Experience**: Intuitive navigation between related records
5. **Data Integrity**: Bidirectional links ensure consistency

## Future Enhancements

Potential improvements for future development:

1. **Reverse Navigation**: Add "View Source Complaint" button in corrective action detail page
2. **Multiple Correctives**: Support multiple corrective actions per complaint
3. **Link Validation**: Verify linked records exist before navigation
4. **Status Synchronization**: Update complaint status when corrective action is completed
5. **Bulk Operations**: Create corrective actions for multiple complaints at once

## Testing Checklist

- [x] Create new corrective action from complaint
- [x] Open existing corrective action from complaint
- [x] Verify auto-generated ID format
- [x] Confirm pre-filled fields in corrective action
- [x] Test navigation between modules
- [x] Verify data persistence across saves
- [x] Check TypeScript compilation

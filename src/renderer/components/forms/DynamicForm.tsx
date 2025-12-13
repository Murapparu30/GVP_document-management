import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import type { TemplateDefinition, RecordData } from '../../types/template';

interface DynamicFormProps {
  template: TemplateDefinition;
  value: RecordData;
  onChange: (data: RecordData) => void;
}

type ValidationErrors = Record<string, string>;

export const DynamicForm: React.FC<DynamicFormProps> = ({ template, value, onChange }) => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (fieldId: string, val: any) => {
    onChange({ ...value, [fieldId]: val });
    // Clear error when user starts typing
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleBlur = (fieldId: string) => {
    setTouched(prev => ({ ...prev, [fieldId]: true }));
    validateField(fieldId);
  };

  const validateField = (fieldId: string): boolean => {
    const field = template.fields.find(f => f.id === fieldId);
    if (!field) return true;

    const fieldValue = value[fieldId];
    let error = '';

    // Required validation
    if (field.required && (!fieldValue || String(fieldValue).trim() === '')) {
      error = `${field.label}は必須です`;
    }

    // Email validation
    if (fieldValue && field.id.includes('email')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(fieldValue))) {
        error = '有効なメールアドレスを入力してください';
      }
    }

    // Record ID format validation
    if (fieldValue && (field.id === 'complaint_id' || field.id === 'corrective_action_id')) {
      const crRegex = /^CR-\d{4}-\d{4}$/;
      const caRegex = /^CA-CR-\d{4}-\d{4}$/;

      if (field.id === 'complaint_id' && !crRegex.test(String(fieldValue))) {
        error = '苦情番号の形式: CR-YYYY-NNNN';
      } else if (field.id === 'corrective_action_id' && !caRegex.test(String(fieldValue))) {
        error = '是正処置番号の形式: CA-CR-YYYY-NNNN';
      }
    }

    // Date logic validation
    if (field.type === 'date' && fieldValue) {
      // Check if start date is before end date
      if (field.id.includes('start') || field.id.includes('from') || field.id === 'received_date') {
        const endFieldId = field.id.replace('start', 'end').replace('from', 'to').replace('received_date', 'completed_date');
        const endDate = value[endFieldId];

        if (endDate && new Date(fieldValue) > new Date(endDate)) {
          error = '開始日は終了日より前である必要があります';
        }
      }

      if (field.id.includes('end') || field.id.includes('to') || field.id === 'completed_date') {
        const startFieldId = field.id.replace('end', 'start').replace('to', 'from').replace('completed_date', 'received_date');
        const startDate = value[startFieldId];

        if (startDate && new Date(fieldValue) < new Date(startDate)) {
          error = '終了日は開始日より後である必要があります';
        }
      }

      // Check if date is not in the future (for received_date, complaint_date, etc.)
      if (field.id.includes('received') || field.id.includes('complaint_date') || field.id.includes('occurred')) {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (new Date(fieldValue) > today) {
          error = '過去の日付を入力してください';
        }
      }
    }

    if (error) {
      setValidationErrors(prev => ({ ...prev, [fieldId]: error }));
      return false;
    } else {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
      return true;
    }
  };

  const validateAll = (): boolean => {
    let isValid = true;
    template.fields.forEach(field => {
      if (!validateField(field.id)) {
        isValid = false;
      }
    });
    setTouched(Object.fromEntries(template.fields.map(f => [f.id, true])));
    return isValid;
  };

  // Expose validation function to parent components via window
  useEffect(() => {
    (window as any).validateForm = validateAll;
    return () => {
      delete (window as any).validateForm;
    };
  }, [value, template]);

  return (
    <div className="space-y-4">
      {template.fields.map((field) => {
        const fieldError = touched[field.id] && validationErrors[field.id];
        const hasError = Boolean(fieldError);
        const inputClassName = `border rounded px-3 py-2 focus:outline-none focus:ring-2 ${hasError
          ? 'border-red-500 focus:ring-red-500'
          : 'border-gray-300 focus:ring-blue-500'
          }`;

        return (
          <div key={field.id} className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <label className="font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>

            {field.type === 'text' && (
              <input
                type="text"
                value={value[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                onBlur={() => handleBlur(field.id)}
                className={inputClassName}
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                value={value[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                onBlur={() => handleBlur(field.id)}
                rows={4}
                className={inputClassName}
              />
            )}

            {field.type === 'date' && (
              <input
                type="date"
                value={value[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                onBlur={() => handleBlur(field.id)}
                className={inputClassName}
              />
            )}

            {field.type === 'select' && field.options && (
              <select
                value={value[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                onBlur={() => handleBlur(field.id)}
                className={inputClassName}
              >
                <option value="">選択してください</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'link' && (
              <input
                type="text"
                value={value[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                onBlur={() => handleBlur(field.id)}
                placeholder={field.target_template ? `関連先: ${field.target_template}` : 'リンク先ID'}
                className={inputClassName}
              />
            )}

            {/* Validation Error Message */}
            {fieldError && (
              <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                <span>{fieldError}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

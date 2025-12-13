export type FieldType = 'text' | 'textarea' | 'date' | 'select' | 'link';

export interface TemplateField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  group?: string;
  target_template?: string;
}

export interface TemplateDefinition {
  template_id: string;
  template_name: string;
  category: string;
  version: string;
  regulation_ref?: string[];
  fields: TemplateField[];
}

export interface RecordData {
  [fieldId: string]: any;
}

import PDFDocument from 'pdfkit';
import fs from 'fs';

interface LayoutDefinition {
  layout_id: string;
  template_id: string;
  page_size: string;
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  header: {
    show_title: boolean;
    show_record_id: boolean;
    show_version: boolean;
    show_date: boolean;
  };
  footer: {
    show_page_number: boolean;
    show_export_date: boolean;
  };
  sections: Array<{
    title: string;
    fields: string[];
  }>;
}

interface TemplateField {
  id: string;
  label: string;
  type: string;
  required: boolean;
}

interface TemplateDefinition {
  template_id: string;
  template_name: string;
  fields: TemplateField[];
}

interface RecordData {
  [key: string]: any;
}

interface RecordVersionPayload {
  meta: {
    record_id: string;
    template_id: string;
    version: number;
    created_at: string;
    updated_at: string;
    updated_by: string;
  };
  data: RecordData;
}

export interface GeneratePdfOptions {
  recordPayload: RecordVersionPayload;
  template: TemplateDefinition;
  layout: LayoutDefinition;
  outputPath: string;
  exportedBy: string;
  purpose?: string;
}

export async function generatePdf(options: GeneratePdfOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const { recordPayload, template, layout, outputPath } = options;
      const { meta, data } = recordPayload;

      const doc = new PDFDocument({
        size: layout.page_size,
        margins: layout.margins,
        info: {
          Title: `${template.template_name} - ${meta.record_id}`,
          Author: options.exportedBy,
          Subject: `Version ${meta.version}`,
          CreationDate: new Date()
        }
      });

      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      let currentY = layout.margins.top;

      if (layout.header.show_title) {
        doc.fontSize(16).font('Helvetica-Bold').text(template.template_name, layout.margins.left, currentY);
        currentY += 25;
      }

      if (layout.header.show_record_id || layout.header.show_version) {
        doc.fontSize(10).font('Helvetica');
        let headerLine = '';
        if (layout.header.show_record_id) {
          headerLine += `記録番号: ${meta.record_id}`;
        }
        if (layout.header.show_version) {
          headerLine += `   版: v${meta.version}`;
        }
        doc.text(headerLine, layout.margins.left, currentY);
        currentY += 15;
      }

      if (layout.header.show_date) {
        doc.fontSize(9).font('Helvetica').text(
          `最終更新: ${new Date(meta.updated_at).toLocaleString('ja-JP')}   更新者: ${meta.updated_by}`,
          layout.margins.left,
          currentY
        );
        currentY += 25;
      }

      doc.moveTo(layout.margins.left, currentY)
        .lineTo(doc.page.width - layout.margins.right, currentY)
        .stroke();
      currentY += 15;

      const fieldMap = new Map<string, TemplateField>();
      template.fields.forEach(field => fieldMap.set(field.id, field));

      for (const section of layout.sections) {
        if (currentY > doc.page.height - layout.margins.bottom - 100) {
          doc.addPage();
          currentY = layout.margins.top;
        }

        doc.fontSize(12).font('Helvetica-Bold').text(section.title, layout.margins.left, currentY);
        currentY += 20;

        for (const fieldId of section.fields) {
          const field = fieldMap.get(fieldId);
          if (!field) continue;

          const value = data[fieldId];
          if (value === undefined || value === null || value === '') continue;

          if (currentY > doc.page.height - layout.margins.bottom - 60) {
            doc.addPage();
            currentY = layout.margins.top;
          }

          doc.fontSize(10).font('Helvetica-Bold').text(`${field.label}:`, layout.margins.left, currentY);
          currentY += 15;

          const valueText = String(value);
          const maxWidth = doc.page.width - layout.margins.left - layout.margins.right;

          doc.fontSize(10).font('Helvetica').text(valueText, layout.margins.left + 10, currentY, {
            width: maxWidth - 10,
            align: 'left'
          });

          const textHeight = doc.heightOfString(valueText, {
            width: maxWidth - 10
          });

          currentY += textHeight + 10;
        }

        currentY += 10;
      }

      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);

        const footerY = doc.page.height - layout.margins.bottom + 10;

        doc.fontSize(8).font('Helvetica').text(
          `記録番号: ${meta.record_id}   版: v${meta.version}   出力日時: ${new Date().toLocaleString('ja-JP')}   出力者: ${options.exportedBy}`,
          layout.margins.left,
          footerY,
          { align: 'left', width: doc.page.width - layout.margins.left - layout.margins.right }
        );

        if (layout.footer.show_page_number) {
          doc.fontSize(8).font('Helvetica').text(
            `${i + 1} / ${pageCount}`,
            layout.margins.left,
            footerY,
            { align: 'right' }
          );
        }
      }

      doc.end();

      writeStream.on('finish', () => {
        resolve();
      });

      writeStream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
}

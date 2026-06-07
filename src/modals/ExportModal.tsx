import { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useProjectStore } from '../store/projectStore';
import { SYMBOL_DEFS } from '../symbolDefs';
import type { SymbolObject, MaterialSpec } from '../types';
import jsPDF from 'jspdf';

export function ExportModal() {
  const { showExportModal, setShowExportModal, objects, projectId } = useEditorStore();
  const { projects } = useProjectStore();
  const project = projects.find(p => p.id === projectId);
  const [includeSpecs, setIncludeSpecs] = useState(true);
  const [includeExtras, setIncludeExtras] = useState(true);
  const [includeLegend, setIncludeLegend] = useState(true);
  const [includeDisclaimer, setIncludeDisclaimer] = useState(true);
  const [format, setFormat] = useState<'pdf' | 'png'>('pdf');
  const [pageSize, setPageSize] = useState<'a4' | 'a3'>('a4');
  const [loading, setLoading] = useState(false);

  if (!showExportModal || !project) return null;

  // Collect used symbols for legend
  const usedSymbols = objects
    .filter(o => o.objectType === 'symbol')
    .map(o => (o as SymbolObject).symbolType)
    .filter((v, i, a) => a.indexOf(v) === i)
    .map(code => SYMBOL_DEFS.find(s => s.code === code))
    .filter(Boolean);

  const doExport = async () => {
    setLoading(true);
    try {
      // 1. Get the Konva stage canvas
      const stageCanvas = document.querySelector('canvas') as HTMLCanvasElement | null;
      if (!stageCanvas) { setLoading(false); return; }
      const stageDataUrl = stageCanvas.toDataURL('image/png', 1.0);

      if (format === 'png') {
        const a = document.createElement('a');
        a.href = stageDataUrl;
        a.download = `${project.projectName || 'סקיצה'}.png`;
        a.click();
        setLoading(false);
        setShowExportModal(false);
        return;
      }

      // 2. Build PDF
      const isA3 = pageSize === 'a3';
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: pageSize });
      const pw = isA3 ? 420 : 297;
      const ph = isA3 ? 297 : 210;

      // Header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BuildSketch', pw - 20, 15, { align: 'right' });
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${project.clientName}  |  ${project.projectName}  |  ${project.date}`, pw - 20, 22, { align: 'right' });

      // Canvas image
      const imgY = 28;
      const imgH = ph - imgY - (includeDisclaimer ? 20 : 8) - (includeLegend ? 18 : 0);
      const imgW = includeLegend ? pw * 0.72 : pw - 16;
      pdf.addImage(stageDataUrl, 'PNG', 8, imgY, imgW, imgH, undefined, 'FAST');

      // Legend
      if (includeLegend && usedSymbols.length > 0) {
        const lx = imgW + 12;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('LEGEND', lx, imgY + 4);
        pdf.setFont('helvetica', 'normal');
        usedSymbols.forEach((sym, i) => {
          if (!sym) return;
          pdf.setTextColor(80, 80, 80);
          pdf.text(`${sym.code} = ${sym.name}`, lx, imgY + 10 + i * 6);
        });
        pdf.setTextColor(0, 0, 0);
      }

      // Disclaimer
      if (includeDisclaimer) {
        pdf.setFontSize(7);
        pdf.setTextColor(120, 120, 120);
        const disclaimer = '* מסמך זה הוא סקיצת תיאום בלבד. אינו מהווה תוכנית אדריכלית או הנדסית מאושרת.';
        pdf.text(disclaimer, pw - 10, ph - 6, { align: 'right' });
        pdf.setTextColor(0, 0, 0);
      }

      // Page 2: Material Specs
      if (includeSpecs && project.materialSpecs.length > 0) {
        pdf.addPage();
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Material Specifications', pw - 14, 14, { align: 'right' });

        const cols = ['Area', 'Component', 'Material', 'Thickness', 'Extra Layer', 'Notes'];
        const colW = [45, 35, 45, 25, 35, 40];
        let cx = 8;
        let cy = 22;

        // Header row
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        cols.forEach((col, i) => {
          pdf.rect(cx, cy, colW[i], 7);
          pdf.text(col, cx + 2, cy + 5);
          cx += colW[i];
        });
        cy += 7;

        // Data rows
        pdf.setFont('helvetica', 'normal');
        project.materialSpecs.forEach((spec: MaterialSpec) => {
          cx = 8;
          const row = [spec.area, spec.component, spec.material, spec.thickness ?? '', spec.extraLayer ?? '', spec.notes ?? ''];
          const rowH = 8;
          row.forEach((cell, i) => {
            pdf.rect(cx, cy, colW[i], rowH);
            pdf.text(cell.substring(0, 22), cx + 2, cy + 5);
            cx += colW[i];
          });
          cy += rowH;
          if (cy > ph - 20) {
            pdf.addPage();
            cy = 20;
          }
        });
      }

      // Page 3: Extras + Notes
      if (includeExtras && (project.extras.length > 0 || project.generalNotes)) {
        pdf.addPage();
        let ey = 14;
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Extras & Notes', pw - 14, ey, { align: 'right' });
        ey += 10;

        if (project.generalNotes) {
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.text('General Notes:', 10, ey);
          ey += 6;
          pdf.setFont('helvetica', 'normal');
          const lines = pdf.splitTextToSize(project.generalNotes, pw - 20);
          pdf.text(lines, 10, ey);
          ey += lines.length * 5 + 6;
        }

        if (project.extras.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Extras:', 10, ey);
          ey += 6;
          pdf.setFont('helvetica', 'normal');
          project.extras.forEach(ex => {
            pdf.text(`• ${ex.description}${ex.notes ? '  —  ' + ex.notes : ''}`, 12, ey);
            ey += 5;
          });
        }
      }

      pdf.save(`${project.projectName || 'סקיצה'}.pdf`);
    } catch (err) {
      console.error(err);
      alert('שגיאה בייצוא. נסה שוב.');
    }
    setLoading(false);
    setShowExportModal(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
      <div className="modal-box modal-box--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">ייצוא מסמך</h2>
          <button className="modal-close" onClick={() => setShowExportModal(false)}>×</button>
        </div>

        <div className="modal-body">
          <div className="prop-field">
            <label className="prop-label">פורמט</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" checked={format === 'pdf'} onChange={() => setFormat('pdf')} /> PDF
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" checked={format === 'png'} onChange={() => setFormat('png')} /> PNG (קנבס בלבד)
              </label>
            </div>
          </div>

          {format === 'pdf' && (
            <div className="prop-field">
              <label className="prop-label">גודל עמוד</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" checked={pageSize === 'a4'} onChange={() => setPageSize('a4')} /> A4
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" checked={pageSize === 'a3'} onChange={() => setPageSize('a3')} /> A3
                </label>
              </div>
            </div>
          )}

          <div className="prop-field">
            <label className="prop-label">מה לכלול</label>
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includeLegend} onChange={e => setIncludeLegend(e.target.checked)} />
                מקרא סמלים
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includeSpecs} onChange={e => setIncludeSpecs(e.target.checked)} />
                טבלת מפרט חומרים
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includeExtras} onChange={e => setIncludeExtras(e.target.checked)} />
                תוספות והערות כלליות
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includeDisclaimer} onChange={e => setIncludeDisclaimer(e.target.checked)} />
                דיסקליימר
              </label>
            </div>
          </div>

          <div className="export-info">
            <strong>לקוח:</strong> {project.clientName}<br />
            <strong>פרויקט:</strong> {project.projectName}<br />
            <strong>תאריך:</strong> {project.date}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => setShowExportModal(false)}>ביטול</button>
          <button className="btn-primary" onClick={doExport} disabled={loading}>
            {loading ? 'מייצא...' : `ייצא ${format.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}

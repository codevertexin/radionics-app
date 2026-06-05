import { jsPDF } from 'jspdf';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { svg2pdf } from 'svg2pdf.js';
import { GraphPdfExportError } from '@/lib/pdf/graphPdfErrors';
import { ptToMm, THERAPEUTIC_PDF_BACKGROUND } from '@/lib/pdf/graphPrintConstants';
import {
  computeGraphPrintLayoutGeometry,
  GRAPH_PRINT_TITLE,
} from '@/lib/pdf/graphPrintLayout';
import { filterWarningsForTherapist } from '@/lib/pdf/graphPrintWarnings';
import { isAppProduction } from '@/lib/pdf/graphPrintEnvironment';
import type { GraphPdfExportResult, GraphPrintSpec } from '@/lib/pdf/graphPrintTypes';

async function fetchSvgMarkup(url: string): Promise<string> {
  const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
  if (!response.ok) {
    throw new GraphPdfExportError(
      'Não foi possível carregar o ficheiro SVG (rede ou permissões).',
      'FETCH_FAILED',
    );
  }
  const text = await response.text();
  if (!text.includes('<svg')) {
    throw new GraphPdfExportError('O ficheiro não é um SVG válido.', 'UNSUPPORTED_FORMAT');
  }
  return text;
}

function parseSvgElement(svgText: string): SVGSVGElement {
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new GraphPdfExportError('SVG inválido ou corrompido.', 'UNSUPPORTED_FORMAT');
  }

  const svg = doc.documentElement;
  if (!(svg instanceof SVGSVGElement)) {
    throw new GraphPdfExportError('SVG inválido.', 'UNSUPPORTED_FORMAT');
  }

  if (!svg.getAttribute('viewBox')) {
    const w = parseFloat(svg.getAttribute('width') ?? '100');
    const h = parseFloat(svg.getAttribute('height') ?? '100');
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  }

  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');

  return svg;
}

function mountSvgInDom(svg: SVGSVGElement): () => void {
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText =
    'position:fixed;left:-10000px;top:0;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none;';
  host.appendChild(svg);
  document.body.appendChild(host);
  return () => host.remove();
}

async function measureLayoutGeometry(spec: GraphPrintSpec) {
  const measureDoc = await PDFDocument.create();
  const font = await measureDoc.embedFont(StandardFonts.HelveticaBold);
  return computeGraphPrintLayoutGeometry(spec.page, spec.layoutId, spec.title, font);
}

function drawTitleOnJsPdf(
  pdf: jsPDF,
  spec: GraphPrintSpec,
  geometry: ReturnType<typeof computeGraphPrintLayoutGeometry>,
): void {
  const pageHeightPt = spec.page.pageHeightPt;
  const pageWidthMm = ptToMm(spec.page.pageWidthPt);

  pdf.setTextColor(26, 26, 46);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(GRAPH_PRINT_TITLE.fontSize);

  let baselinePt = geometry.titleBaselineY;
  for (const line of geometry.titleLines) {
    const yMm = ptToMm(pageHeightPt - baselinePt);
    pdf.text(line, pageWidthMm / 2, yMm, { align: 'center', baseline: 'bottom' });
    baselinePt -= GRAPH_PRINT_TITLE.lineHeight;
  }

  const ruleYmm = ptToMm(pageHeightPt - geometry.titleRuleY);
  const ruleWidthMm = ptToMm(geometry.contentWidthPt * GRAPH_PRINT_TITLE.ruleWidthRatio);
  const ruleX = (pageWidthMm - ruleWidthMm) / 2;
  pdf.setDrawColor(201, 168, 76);
  pdf.setLineWidth(ptToMm(GRAPH_PRINT_TITLE.ruleThickness));
  pdf.line(ruleX, ruleYmm, ruleX + ruleWidthMm, ruleYmm);
}

/**
 * Final designer SVG layout — placed full-bleed on the selected physical size.
 * No title, margins, or graph rebuild.
 */
async function exportFinalLayoutSvgPdf(
  spec: GraphPrintSpec,
  svgElement: SVGSVGElement,
): Promise<GraphPdfExportResult> {
  const pageMm = spec.printSizeCm * 10;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [pageMm, pageMm],
    compress: true,
  });

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageMm, pageMm, 'F');

  await svg2pdf(svgElement, pdf, {
    x: 0,
    y: 0,
    width: pageMm,
    height: pageMm,
  });

  const buffer = pdf.output('arraybuffer') as ArrayBuffer;
  return {
    pdfBytes: new Uint8Array(buffer),
    warnings: filterWarningsForTherapist(spec.warnings, isAppProduction()),
  };
}

/**
 * DEV/debug only — composes preview image into a titled sheet template.
 */
async function exportComposedSvgPdf(
  spec: GraphPrintSpec,
  svgElement: SVGSVGElement,
): Promise<GraphPdfExportResult> {
  const pageMm = spec.printSizeCm * 10;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [pageMm, pageMm],
    compress: true,
  });

  pdf.setFillColor(
    Math.round(THERAPEUTIC_PDF_BACKGROUND.r * 255),
    Math.round(THERAPEUTIC_PDF_BACKGROUND.g * 255),
    Math.round(THERAPEUTIC_PDF_BACKGROUND.b * 255),
  );
  pdf.rect(0, 0, pageMm, pageMm, 'F');

  const geometry = await measureLayoutGeometry(spec);
  drawTitleOnJsPdf(pdf, spec, geometry);

  const pageHeightPt = spec.page.pageHeightPt;
  const box = geometry.imageBox;
  const xMm = ptToMm(box.x);
  const yMm = ptToMm(pageHeightPt - box.y - box.height);
  const wMm = ptToMm(box.width);
  const hMm = ptToMm(box.height);

  await svg2pdf(svgElement, pdf, {
    x: xMm,
    y: yMm,
    width: wMm,
    height: hMm,
  });

  const buffer = pdf.output('arraybuffer') as ArrayBuffer;
  return {
    pdfBytes: new Uint8Array(buffer),
    warnings: spec.warnings,
  };
}

/**
 * Vector PDF export — final print layout SVG is placed at physical print_size_cm.
 */
export async function exportSvgTherapeuticPdf(
  spec: GraphPrintSpec,
): Promise<GraphPdfExportResult> {
  if (!spec.printImageUrl?.trim()) {
    throw new GraphPdfExportError('Ficheiro de impressão não disponível.', 'NO_IMAGE');
  }

  const svgText = await fetchSvgMarkup(spec.printImageUrl);
  const svgElement = parseSvgElement(svgText);
  const cleanupDom = mountSvgInDom(svgElement);

  try {
    if (spec.isFinalPrintLayout) {
      return await exportFinalLayoutSvgPdf(spec, svgElement);
    }
    return await exportComposedSvgPdf(spec, svgElement);
  } catch (err) {
    if (err instanceof GraphPdfExportError) throw err;
    throw new GraphPdfExportError('Falha ao gerar PDF a partir do SVG.', 'RENDER_FAILED');
  } finally {
    cleanupDom();
  }
}

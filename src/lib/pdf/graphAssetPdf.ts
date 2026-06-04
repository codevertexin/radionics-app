import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { GraphPdfExportError } from '@/lib/pdf/graphPdfErrors';
import {
  computeContainedImageRect,
  computeGraphPrintLayoutGeometry,
  GRAPH_PRINT_TITLE,
} from '@/lib/pdf/graphPrintLayout';
import { THERAPEUTIC_PDF_BACKGROUND } from '@/lib/pdf/graphPrintConstants';
import { loadPrintImage } from '@/lib/pdf/graphPrintImage';
import { validatePrintImageResolution } from '@/lib/pdf/graphPrintQuality';
import { mergeGraphPrintWarnings, type GraphPrintWarning } from '@/lib/pdf/graphPrintWarnings';
import type { GraphPrintSpec } from '@/lib/pdf/graphPrintTypes';

export { GraphPdfExportError } from '@/lib/pdf/graphPdfErrors';

export interface GraphPdfExportResult {
  pdfBytes: Uint8Array;
  warnings: GraphPrintWarning[];
}

/**
 * Generates a deterministic therapeutic graph sheet PDF.
 * Page size follows physical print_size_cm (square), not A4 by default.
 */
export async function exportGraphAssetPdf(spec: GraphPrintSpec): Promise<GraphPdfExportResult> {
  if (!spec.printImageUrl?.trim()) {
    throw new GraphPdfExportError('Imagem do gráfico não disponível.', 'NO_IMAGE');
  }

  const loaded = await loadPrintImage(spec.printImageUrl);
  const resolutionWarnings = validatePrintImageResolution(
    loaded.widthPx,
    loaded.heightPx,
    spec,
  );
  const warnings = mergeGraphPrintWarnings(spec.warnings, resolutionWarnings);

  try {
    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const geometry = computeGraphPrintLayoutGeometry(
      spec.page,
      spec.layoutId,
      spec.title,
      fontBold,
    );

    const page = pdfDoc.addPage([geometry.pageWidthPt, geometry.pageHeightPt]);

    page.drawRectangle({
      x: 0,
      y: 0,
      width: geometry.pageWidthPt,
      height: geometry.pageHeightPt,
      color: rgb(
        THERAPEUTIC_PDF_BACKGROUND.r,
        THERAPEUTIC_PDF_BACKGROUND.g,
        THERAPEUTIC_PDF_BACKGROUND.b,
      ),
    });

    const titleColor = rgb(0.1, 0.1, 0.18);
    const ruleColor = rgb(201 / 255, 168 / 255, 76 / 255);

    let lineY = geometry.titleBaselineY;
    for (const line of geometry.titleLines) {
      const textWidth = fontBold.widthOfTextAtSize(line, GRAPH_PRINT_TITLE.fontSize);
      const x = (geometry.pageWidthPt - textWidth) / 2;
      page.drawText(line, {
        x,
        y: lineY,
        size: GRAPH_PRINT_TITLE.fontSize,
        font: fontBold,
        color: titleColor,
      });
      lineY -= GRAPH_PRINT_TITLE.lineHeight;
    }

    const ruleWidth = geometry.contentWidthPt * GRAPH_PRINT_TITLE.ruleWidthRatio;
    const ruleX = (geometry.pageWidthPt - ruleWidth) / 2;
    page.drawLine({
      start: { x: ruleX, y: geometry.titleRuleY },
      end: { x: ruleX + ruleWidth, y: geometry.titleRuleY },
      thickness: GRAPH_PRINT_TITLE.ruleThickness,
      color: ruleColor,
    });

    const embeddedImage =
      loaded.format === 'png'
        ? await pdfDoc.embedPng(loaded.bytes)
        : await pdfDoc.embedJpg(loaded.bytes);

    const drawRect = computeContainedImageRect(
      geometry.imageBox,
      embeddedImage.width,
      embeddedImage.height,
    );

    if (drawRect.width > 0 && drawRect.height > 0) {
      page.drawImage(embeddedImage, {
        x: drawRect.x,
        y: drawRect.y,
        width: drawRect.width,
        height: drawRect.height,
      });
    }

    const pdfBytes = await pdfDoc.save();
    return { pdfBytes, warnings };
  } catch (err) {
    if (err instanceof GraphPdfExportError) throw err;
    throw new GraphPdfExportError('Falha ao gerar o PDF do gráfico.', 'RENDER_FAILED');
  }
}

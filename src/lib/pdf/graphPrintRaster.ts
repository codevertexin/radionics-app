import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { GraphPdfExportError } from '@/lib/pdf/graphPdfErrors';
import { THERAPEUTIC_PDF_BACKGROUND } from '@/lib/pdf/graphPrintConstants';
import {
  computeContainedImageRect,
  computeGraphPrintLayoutGeometry,
  GRAPH_PRINT_TITLE,
} from '@/lib/pdf/graphPrintLayout';
import { loadPrintImage } from '@/lib/pdf/graphPrintImage';
import { validatePrintImageResolution } from '@/lib/pdf/graphPrintQuality';
import { filterWarningsForTherapist, mergeGraphPrintWarnings } from '@/lib/pdf/graphPrintWarnings';
import { isAppProduction } from '@/lib/pdf/graphPrintEnvironment';
import type { GraphPdfExportResult, GraphPrintSpec } from '@/lib/pdf/graphPrintTypes';

async function embedRasterImage(
  pdfDoc: PDFDocument,
  loaded: Awaited<ReturnType<typeof loadPrintImage>>,
) {
  return loaded.format === 'png'
    ? pdfDoc.embedPng(loaded.bytes)
    : pdfDoc.embedJpg(loaded.bytes);
}

/**
 * Final prepared print layout (PNG/JPG) — full-bleed on selected physical size.
 */
async function exportFinalLayoutRasterPdf(
  spec: GraphPrintSpec,
  loaded: Awaited<ReturnType<typeof loadPrintImage>>,
): Promise<GraphPdfExportResult> {
  const resolutionWarnings = validatePrintImageResolution(
    loaded.widthPx,
    loaded.heightPx,
    spec,
  );
  const warnings = filterWarningsForTherapist(
    mergeGraphPrintWarnings(spec.warnings, resolutionWarnings),
    isAppProduction(),
  );

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([spec.page.pageWidthPt, spec.page.pageHeightPt]);

  page.drawRectangle({
    x: 0,
    y: 0,
    width: spec.page.pageWidthPt,
    height: spec.page.pageHeightPt,
    color: rgb(
      THERAPEUTIC_PDF_BACKGROUND.r,
      THERAPEUTIC_PDF_BACKGROUND.g,
      THERAPEUTIC_PDF_BACKGROUND.b,
    ),
  });

  const embeddedImage = await embedRasterImage(pdfDoc, loaded);
  page.drawImage(embeddedImage, {
    x: 0,
    y: 0,
    width: spec.page.pageWidthPt,
    height: spec.page.pageHeightPt,
  });

  return { pdfBytes: await pdfDoc.save(), warnings };
}

/**
 * DEV/debug only — composes preview raster into a titled sheet template.
 */
async function exportComposedRasterPdf(
  spec: GraphPrintSpec,
  loaded: Awaited<ReturnType<typeof loadPrintImage>>,
): Promise<GraphPdfExportResult> {
  const resolutionWarnings = validatePrintImageResolution(
    loaded.widthPx,
    loaded.heightPx,
    spec,
  );
  const warnings = mergeGraphPrintWarnings(spec.warnings, resolutionWarnings);

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

  const embeddedImage = await embedRasterImage(pdfDoc, loaded);
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

  return { pdfBytes: await pdfDoc.save(), warnings };
}

export async function exportRasterTherapeuticPdf(
  spec: GraphPrintSpec,
): Promise<GraphPdfExportResult> {
  if (!spec.printImageUrl?.trim()) {
    throw new GraphPdfExportError('Ficheiro de impressão não disponível.', 'NO_IMAGE');
  }

  const loaded = await loadPrintImage(spec.printImageUrl);

  try {
    if (spec.isFinalPrintLayout) {
      return await exportFinalLayoutRasterPdf(spec, loaded);
    }
    return await exportComposedRasterPdf(spec, loaded);
  } catch (err) {
    if (err instanceof GraphPdfExportError) throw err;
    throw new GraphPdfExportError('Falha ao gerar o PDF do gráfico.', 'RENDER_FAILED');
  }
}

import type { PDFFont } from 'pdf-lib';
import { THERAPEUTIC_PDF_BACKGROUND } from '@/lib/pdf/graphPrintConstants';
import {
  GRAPH_PRINT_LAYOUT_IDS,
  resolveLayoutDefinition,
  type TherapeuticPageDimensions,
} from '@/lib/pdf/graphPrintLayouts';
import type { GraphPrintLayoutId } from '@/lib/pdf/graphPrintTypes';

/** Shared margins (pt) — deterministic on all devices. */
export const GRAPH_PRINT_MARGIN_PT = {
  top: 48,
  bottom: 40,
  left: 40,
  right: 40,
} as const;

export const GRAPH_PRINT_TITLE = {
  fontSize: 16,
  lineHeight: 20,
  maxLines: 2,
  gapAfterBlock: 16,
  ruleWidthRatio: 0.5,
  ruleThickness: 1,
  ruleGap: 8,
} as const;

export interface GraphPrintContentBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GraphPrintLayoutGeometry {
  pageWidthPt: number;
  pageHeightPt: number;
  layoutId: GraphPrintLayoutId;
  contentWidthPt: number;
  titleLines: string[];
  titleBlockHeightPt: number;
  titleBaselineY: number;
  titleRuleY: number;
  imageBox: GraphPrintContentBox;
}

export function getPageDimensionsFromSpec(page: TherapeuticPageDimensions): {
  widthPt: number;
  heightPt: number;
} {
  return { widthPt: page.pageWidthPt, heightPt: page.pageHeightPt };
}

export function normalizeLayoutId(
  layoutId: GraphPrintLayoutId,
): GraphPrintLayoutId {
  if (PRINT_LAYOUT_REGISTRY_HAS(layoutId)) {
    return layoutId;
  }
  return GRAPH_PRINT_LAYOUT_IDS.graphSheetV1;
}

function PRINT_LAYOUT_REGISTRY_HAS(layoutId: string): boolean {
  return Boolean(resolveLayoutDefinition(layoutId as GraphPrintLayoutId));
}

/** Word-wrap title to fit content width; truncate to max lines. */
export function wrapTitleLines(
  title: string,
  font: PDFFont,
  fontSize: number,
  maxWidthPt: number,
  maxLines: number = GRAPH_PRINT_TITLE.maxLines,
): string[] {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];

  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidthPt) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length >= maxLines) break;
  }

  if (lines.length < maxLines && current) {
    lines.push(current);
  } else if (lines.length >= maxLines) {
    const last = lines[maxLines - 1] ?? '';
    lines[maxLines - 1] = truncateLineWithEllipsis(last, font, fontSize, maxWidthPt);
    return lines.slice(0, maxLines);
  }

  if (lines.length === maxLines) {
    const lastIdx = maxLines - 1;
    lines[lastIdx] = truncateLineWithEllipsis(
      lines[lastIdx] ?? '',
      font,
      fontSize,
      maxWidthPt,
    );
  }

  return lines.length ? lines : [''];
}

function truncateLineWithEllipsis(
  line: string,
  font: PDFFont,
  fontSize: number,
  maxWidthPt: number,
): string {
  const ellipsis = '…';
  let trimmed = line;
  while (
    trimmed.length > 0 &&
    font.widthOfTextAtSize(`${trimmed}${ellipsis}`, fontSize) > maxWidthPt
  ) {
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed.length ? `${trimmed}${ellipsis}` : ellipsis;
}

/**
 * Computes printable regions (PDF origin bottom-left) for therapeutic page dimensions.
 */
export function computeGraphPrintLayoutGeometry(
  page: TherapeuticPageDimensions,
  layoutId: GraphPrintLayoutId,
  title: string,
  font: PDFFont,
): GraphPrintLayoutGeometry {
  const { widthPt: pageWidthPt, heightPt: pageHeightPt } = getPageDimensionsFromSpec(page);
  const normalizedLayoutId = normalizeLayoutId(layoutId);

  const contentWidthPt =
    pageWidthPt - GRAPH_PRINT_MARGIN_PT.left - GRAPH_PRINT_MARGIN_PT.right;

  const titleLines = wrapTitleLines(
    title,
    font,
    GRAPH_PRINT_TITLE.fontSize,
    contentWidthPt,
  );

  const titleTextHeight = titleLines.length * GRAPH_PRINT_TITLE.lineHeight;
  const titleRuleSpace = GRAPH_PRINT_TITLE.ruleGap + GRAPH_PRINT_TITLE.ruleThickness;
  const titleBlockHeightPt =
    titleTextHeight + titleRuleSpace + GRAPH_PRINT_TITLE.gapAfterBlock;

  const titleTopY = pageHeightPt - GRAPH_PRINT_MARGIN_PT.top;
  const titleBaselineY = titleTopY - GRAPH_PRINT_TITLE.fontSize;
  const titleRuleY = titleTopY - titleTextHeight - GRAPH_PRINT_TITLE.ruleGap;

  const imageBoxTop = pageHeightPt - GRAPH_PRINT_MARGIN_PT.top - titleBlockHeightPt;
  const imageBox: GraphPrintContentBox = {
    x: GRAPH_PRINT_MARGIN_PT.left,
    y: GRAPH_PRINT_MARGIN_PT.bottom,
    width: contentWidthPt,
    height: imageBoxTop - GRAPH_PRINT_MARGIN_PT.bottom,
  };

  return {
    pageWidthPt,
    pageHeightPt,
    layoutId: normalizedLayoutId,
    contentWidthPt,
    titleLines,
    titleBlockHeightPt,
    titleBaselineY,
    titleRuleY,
    imageBox,
  };
}

/** Center image with object-fit contain inside imageBox (no crop). */
export function computeContainedImageRect(
  imageBox: GraphPrintContentBox,
  imageWidthPx: number,
  imageHeightPx: number,
): GraphPrintContentBox {
  if (imageWidthPx <= 0 || imageHeightPx <= 0) {
    return { ...imageBox, width: 0, height: 0 };
  }

  const scale = Math.min(
    imageBox.width / imageWidthPx,
    imageBox.height / imageHeightPx,
  );
  const drawWidth = imageWidthPx * scale;
  const drawHeight = imageHeightPx * scale;

  return {
    x: imageBox.x + (imageBox.width - drawWidth) / 2,
    y: imageBox.y + (imageBox.height - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  };
}

export const graphPrintLayoutConstants = {
  margin: GRAPH_PRINT_MARGIN_PT,
  title: GRAPH_PRINT_TITLE,
  background: THERAPEUTIC_PDF_BACKGROUND,
} as const;

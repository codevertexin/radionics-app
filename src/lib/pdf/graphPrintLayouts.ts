import { cmToPt } from '@/lib/pdf/graphPrintConstants';
import type { GraphPrintLayoutId } from '@/lib/pdf/graphPrintTypes';

/** Future ISO page sizes — not primary for therapeutic graphs in v1. */
export type RecommendedPageSize =
  | 'A4_PORTRAIT'
  | 'A4_LANDSCAPE'
  | 'A3_PORTRAIT'
  | 'A3_LANDSCAPE'
  | (string & {});

export const GRAPH_PRINT_LAYOUT_IDS = {
  graphSheetV1: 'graph_sheet_v1',
  graphSheetLandscape: 'graph_sheet_landscape',
  mesaLayoutV1: 'mesa_layout_v1',
} as const satisfies Record<string, GraphPrintLayoutId>;

export type PrintLayoutEngineKind = 'physical_square' | 'iso_page';

export interface PhysicalSquarePageDimensions {
  kind: 'physical_square';
  sizeCm: number;
  pageWidthPt: number;
  pageHeightPt: number;
}

export interface IsoPageDimensions {
  kind: 'iso_page';
  pageSize: RecommendedPageSize;
  pageWidthPt: number;
  pageHeightPt: number;
}

export type TherapeuticPageDimensions = PhysicalSquarePageDimensions | IsoPageDimensions;

/** ISO A4 in points — used only when iso_page engine is selected (future). */
export const ISO_PAGE_DIMENSIONS_PT: Record<
  'A4_PORTRAIT' | 'A4_LANDSCAPE',
  { widthPt: number; heightPt: number }
> = {
  A4_PORTRAIT: { widthPt: 595.28, heightPt: 841.89 },
  A4_LANDSCAPE: { widthPt: 841.89, heightPt: 595.28 },
};

export interface PrintLayoutDefinition {
  id: GraphPrintLayoutId;
  engine: PrintLayoutEngineKind;
  /** Reserved for future layout-specific behaviour. */
  implemented: boolean;
}

/**
 * Layout registry — engine resolves dimensions; not all layouts are fully implemented.
 */
export const PRINT_LAYOUT_REGISTRY: Record<string, PrintLayoutDefinition> = {
  [GRAPH_PRINT_LAYOUT_IDS.graphSheetV1]: {
    id: GRAPH_PRINT_LAYOUT_IDS.graphSheetV1,
    engine: 'physical_square',
    implemented: true,
  },
  [GRAPH_PRINT_LAYOUT_IDS.graphSheetLandscape]: {
    id: GRAPH_PRINT_LAYOUT_IDS.graphSheetLandscape,
    engine: 'physical_square',
    implemented: false,
  },
  [GRAPH_PRINT_LAYOUT_IDS.mesaLayoutV1]: {
    id: GRAPH_PRINT_LAYOUT_IDS.mesaLayoutV1,
    engine: 'physical_square',
    implemented: false,
  },
};

export function resolveLayoutDefinition(layoutId: GraphPrintLayoutId): PrintLayoutDefinition {
  return (
    PRINT_LAYOUT_REGISTRY[layoutId] ??
    PRINT_LAYOUT_REGISTRY[GRAPH_PRINT_LAYOUT_IDS.graphSheetV1]
  );
}

export function buildPhysicalSquarePageDimensions(sizeCm: number): PhysicalSquarePageDimensions {
  const edgePt = cmToPt(sizeCm);
  return {
    kind: 'physical_square',
    sizeCm,
    pageWidthPt: edgePt,
    pageHeightPt: edgePt,
  };
}

export function buildIsoPageDimensions(
  pageSize: 'A4_PORTRAIT' | 'A4_LANDSCAPE',
): IsoPageDimensions {
  const dims = ISO_PAGE_DIMENSIONS_PT[pageSize];
  return {
    kind: 'iso_page',
    pageSize,
    pageWidthPt: dims.widthPt,
    pageHeightPt: dims.heightPt,
  };
}

/**
 * v1: all graph layouts use physical square page from print_size_cm.
 * iso_page engine reserved for A4/A3 when layouts are implemented.
 */
export function resolveTherapeuticPageDimensions(
  layoutId: GraphPrintLayoutId,
  sizeCm: number,
  _recommendedPageSize?: RecommendedPageSize,
): TherapeuticPageDimensions {
  const def = resolveLayoutDefinition(layoutId);

  if (def.engine === 'iso_page') {
    const pageSize =
      _recommendedPageSize === 'A4_LANDSCAPE' ? 'A4_LANDSCAPE' : 'A4_PORTRAIT';
    return buildIsoPageDimensions(pageSize);
  }

  void def.implemented;
  return buildPhysicalSquarePageDimensions(sizeCm);
}

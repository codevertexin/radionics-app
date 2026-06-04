import {
  DEFAULT_THERAPEUTIC_PRINT_DPI,
  DEFAULT_THERAPEUTIC_PRINT_SIZE_CM,
  normalizePrintDpi,
  normalizePrintSizeCm,
  type TherapeuticPrintSizeCm,
} from '@/lib/pdf/graphPrintConstants';
import {
  GRAPH_PRINT_LAYOUT_IDS,
  resolveLayoutDefinition,
  resolveTherapeuticPageDimensions,
  type RecommendedPageSize,
  type TherapeuticPageDimensions,
} from '@/lib/pdf/graphPrintLayouts';
import {
  mergeGraphPrintWarnings,
  previewImageFallbackWarning,
  type GraphPrintWarning,
} from '@/lib/pdf/graphPrintWarnings';
import type { ResourceAssetView } from '@/types';

export type { RecommendedPageSize, TherapeuticPageDimensions } from '@/lib/pdf/graphPrintLayouts';
export { GRAPH_PRINT_LAYOUT_IDS } from '@/lib/pdf/graphPrintLayouts';

/** Layout templates — extensible via PRINT_LAYOUT_REGISTRY. */
export type GraphPrintLayoutId =
  | 'graph_sheet_v1'
  | 'graph_sheet_landscape'
  | 'mesa_layout_v1'
  | (string & {});

/**
 * Therapeutic print fields from methodology_assets.metadata (no DB migration).
 * UI uses image_url / imageUrlResolved; PDF uses print_image_url when set.
 */
export interface GraphAssetPrintMetadata {
  print_image_url?: string;
  print_size_cm?: number;
  print_dpi?: number;
  print_layout?: GraphPrintLayoutId;
  recommended_page_size?: RecommendedPageSize;
  witness_area?: { enabled?: boolean; heightPt?: number };
  photo_area?: { enabled?: boolean; heightPt?: number };
  custom_template?: string;
}

export interface GraphPrintSpec {
  title: string;
  /** URL used for PDF generation (print asset or preview fallback). */
  printImageUrl: string;
  usedPreviewImageFallback: boolean;
  printSizeCm: TherapeuticPrintSizeCm;
  printDpi: number;
  layoutId: GraphPrintLayoutId;
  page: TherapeuticPageDimensions;
  filenameBase: string;
  warnings: GraphPrintWarning[];
}

export function parseGraphAssetPrintMetadata(
  metadata: Record<string, unknown> | undefined,
): GraphAssetPrintMetadata {
  if (!metadata || typeof metadata !== 'object') return {};

  const raw = metadata;
  return {
    print_image_url:
      typeof raw.print_image_url === 'string' ? raw.print_image_url.trim() : undefined,
    print_size_cm:
      typeof raw.print_size_cm === 'number' ? raw.print_size_cm : undefined,
    print_dpi: typeof raw.print_dpi === 'number' ? raw.print_dpi : undefined,
    print_layout:
      typeof raw.print_layout === 'string' ? raw.print_layout : undefined,
    recommended_page_size:
      typeof raw.recommended_page_size === 'string'
        ? raw.recommended_page_size
        : undefined,
    witness_area: raw.witness_area as GraphAssetPrintMetadata['witness_area'],
    photo_area: raw.photo_area as GraphAssetPrintMetadata['photo_area'],
    custom_template:
      typeof raw.custom_template === 'string' ? raw.custom_template : undefined,
  };
}

export function resolveGraphPrintLayoutId(
  meta: GraphAssetPrintMetadata,
): GraphPrintLayoutId {
  if (meta.print_layout) {
    return meta.print_layout;
  }
  if (meta.recommended_page_size === 'A4_LANDSCAPE') {
    return GRAPH_PRINT_LAYOUT_IDS.graphSheetLandscape;
  }
  return GRAPH_PRINT_LAYOUT_IDS.graphSheetV1;
}

/**
 * Dedicated print media row (future). Not implemented — returns null.
 */
export function resolveDedicatedPrintMediaUrl(
  _asset: Pick<ResourceAssetView, 'id' | 'toolId'>,
): string | null {
  // Future: methodology_asset_media with role/type for therapeutic print masters.
  return null;
}

/**
 * Print image resolution order:
 * 1. metadata.print_image_url
 * 2. dedicated print media (future)
 * 3. preview image (imageUrlResolved / image_url) + warning
 */
export function resolvePrintImageUrl(
  asset: Pick<ResourceAssetView, 'id' | 'toolId' | 'imageUrl' | 'imageUrlResolved' | 'metadata'>,
  meta: GraphAssetPrintMetadata,
): { url: string; usedPreviewImageFallback: boolean; warnings: GraphPrintWarning[] } | null {
  if (meta.print_image_url) {
    return { url: meta.print_image_url, usedPreviewImageFallback: false, warnings: [] };
  }

  const dedicated = resolveDedicatedPrintMediaUrl(asset);
  if (dedicated) {
    return { url: dedicated, usedPreviewImageFallback: false, warnings: [] };
  }

  const preview = asset.imageUrlResolved ?? asset.imageUrl;
  if (!preview?.trim()) {
    return null;
  }

  return {
    url: preview.trim(),
    usedPreviewImageFallback: true,
    warnings: [previewImageFallbackWarning()],
  };
}

export function buildGraphPrintSpec(
  asset: Pick<
    ResourceAssetView,
    'name' | 'slug' | 'id' | 'toolId' | 'imageUrl' | 'imageUrlResolved' | 'metadata'
  >,
): GraphPrintSpec | null {
  const meta = parseGraphAssetPrintMetadata(asset.metadata);
  const imageSource = resolvePrintImageUrl(asset, meta);
  if (!imageSource) return null;

  const layoutId = resolveGraphPrintLayoutId(meta);
  resolveLayoutDefinition(layoutId);

  const printSizeCm = normalizePrintSizeCm(meta.print_size_cm);
  const printDpi = normalizePrintDpi(meta.print_dpi);
  const page = resolveTherapeuticPageDimensions(
    layoutId,
    printSizeCm,
    meta.recommended_page_size,
  );

  const warnings = mergeGraphPrintWarnings(imageSource.warnings);

  return {
    title: asset.name.trim() || asset.slug,
    printImageUrl: imageSource.url,
    usedPreviewImageFallback: imageSource.usedPreviewImageFallback,
    printSizeCm,
    printDpi,
    layoutId,
    page,
    filenameBase: asset.slug || 'grafico',
    warnings,
  };
}

/** @deprecated Use buildGraphPrintSpec — preview route helper */
export function getPreviewImageUrl(
  asset: Pick<ResourceAssetView, 'imageUrl' | 'imageUrlResolved'>,
): string | undefined {
  return asset.imageUrlResolved ?? asset.imageUrl;
}

export function getPhysicalPrintLabel(spec: Pick<GraphPrintSpec, 'printSizeCm' | 'printDpi'>): string {
  return `${spec.printSizeCm}×${spec.printSizeCm} cm · ${spec.printDpi} DPI`;
}

export { DEFAULT_THERAPEUTIC_PRINT_SIZE_CM, DEFAULT_THERAPEUTIC_PRINT_DPI };

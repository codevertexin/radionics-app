import {
  DEFAULT_PRINT_MAX_SIZE_CM,
  DEFAULT_THERAPEUTIC_PRINT_DPI,
  DEFAULT_THERAPEUTIC_PRINT_SIZE_CM,
  getAvailablePrintSizesCm,
  normalizePrintDpi,
  normalizePrintMaxSizeCm,
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
import { isAppProduction } from '@/lib/pdf/graphPrintEnvironment';
import {
  mergeGraphPrintWarnings,
  previewImageFallbackWarning,
  type GraphPrintWarning,
} from '@/lib/pdf/graphPrintWarnings';
import type { MethodologyAssetType, ResourceAssetView } from '@/types';

export type { RecommendedPageSize, TherapeuticPageDimensions } from '@/lib/pdf/graphPrintLayouts';
export { GRAPH_PRINT_LAYOUT_IDS } from '@/lib/pdf/graphPrintLayouts';
export {
  getAvailablePrintSizesCm,
  SUPPORTED_THERAPEUTIC_PRINT_SIZES_CM,
  DEFAULT_THERAPEUTIC_PRINT_SIZE_CM,
} from '@/lib/pdf/graphPrintConstants';

/** Layout templates — extensible via PRINT_LAYOUT_REGISTRY. */
export type GraphPrintLayoutId =
  | 'graph_sheet_v1'
  | 'graph_sheet_landscape'
  | 'mesa_layout_v1'
  | (string & {});

/** Print master asset format (metadata.print_asset_type). */
export type PrintAssetType = 'svg' | 'raster';

/**
 * Therapeutic print fields from methodology_assets.metadata (no DB migration).
 *
 * - `image_url` (asset.imageUrl) — imagem de visualização (UI preview only).
 * - `print_image_url` — layout final de impressão preparado pelo admin/designer
 *   (ex.: prints/graphs/alta-vitalidade-emissor.svg). Não é uma versão HD do preview.
 */
export interface GraphAssetPrintMetadata {
  /** Layout final de impressão (SVG/PNG/JPG preparado para PDF). */
  print_image_url?: string;
  print_asset_type?: PrintAssetType | 'png' | 'jpg' | 'jpeg' | string;
  print_max_size_cm?: number;
  print_size_cm?: number;
  print_dpi?: number;
  print_layout?: GraphPrintLayoutId;
  recommended_page_size?: RecommendedPageSize;
  witness_area?: { enabled?: boolean; heightPt?: number };
  photo_area?: { enabled?: boolean; heightPt?: number };
  custom_template?: string;
}

export interface BuildGraphPrintSpecOptions {
  /** User-selected physical size (cm) — overrides metadata.print_size_cm. */
  printSizeCm?: TherapeuticPrintSizeCm;
}

export interface GraphPrintSpec {
  title: string;
  printImageUrl: string;
  printAssetType: PrintAssetType;
  /** True when print_image_url is set — final designer layout, not preview rebuild. */
  isFinalPrintLayout: boolean;
  usedPreviewImageFallback: boolean;
  printSizeCm: TherapeuticPrintSizeCm;
  printMaxSizeCm: TherapeuticPrintSizeCm;
  printDpi: number;
  layoutId: GraphPrintLayoutId;
  page: TherapeuticPageDimensions;
  filenameBase: string;
  warnings: GraphPrintWarning[];
}

export interface GraphPdfExportResult {
  pdfBytes: Uint8Array;
  warnings: GraphPrintWarning[];
}

/** Asset types that can use the therapeutic PDF pipeline (extensible). */
export const THERAPEUTIC_PDF_ASSET_TYPES: MethodologyAssetType[] = [
  'graph',
  'angel',
  'archangel',
  'chakra',
  'symbol',
  'other',
];

export function isTherapeuticPdfAssetType(assetType: MethodologyAssetType): boolean {
  return THERAPEUTIC_PDF_ASSET_TYPES.includes(assetType);
}

export function parseGraphAssetPrintMetadata(
  metadata: Record<string, unknown> | undefined,
): GraphAssetPrintMetadata {
  if (!metadata || typeof metadata !== 'object') return {};

  const raw = metadata;
  return {
    print_image_url:
      typeof raw.print_image_url === 'string' ? raw.print_image_url.trim() : undefined,
    print_asset_type:
      typeof raw.print_asset_type === 'string'
        ? (raw.print_asset_type as GraphAssetPrintMetadata['print_asset_type'])
        : undefined,
    print_max_size_cm:
      typeof raw.print_max_size_cm === 'number' ? raw.print_max_size_cm : undefined,
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

export function resolvePrintAssetType(
  meta: GraphAssetPrintMetadata,
  url: string,
): PrintAssetType {
  const declared = meta.print_asset_type?.toLowerCase();
  if (declared === 'svg') return 'svg';
  if (
    declared === 'raster' ||
    declared === 'png' ||
    declared === 'jpg' ||
    declared === 'jpeg'
  ) {
    return 'raster';
  }

  const path = url.split('?')[0]?.split('#')[0]?.toLowerCase() ?? '';
  if (path.endsWith('.svg')) return 'svg';

  return 'raster';
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

export function resolveDedicatedPrintMediaUrl(
  _asset: Pick<ResourceAssetView, 'id' | 'toolId'>,
): string | null {
  return null;
}

export function hasPrintImageUrl(meta: GraphAssetPrintMetadata): boolean {
  return Boolean(meta.print_image_url?.trim());
}

/** Production: export enabled only when admin prepared a final print layout. */
export function isPrintExportAvailable(
  asset: Pick<ResourceAssetView, 'imageUrl' | 'imageUrlResolved' | 'metadata'> | null | undefined,
): boolean {
  if (!asset) return false;
  const meta = parseGraphAssetPrintMetadata(asset.metadata);
  if (hasPrintImageUrl(meta)) return true;
  if (isAppProduction()) return false;
  return Boolean(getPreviewImageUrl(asset));
}

export function resolvePrintImageUrl(
  asset: Pick<ResourceAssetView, 'id' | 'toolId' | 'imageUrl' | 'imageUrlResolved' | 'metadata'>,
  meta: GraphAssetPrintMetadata,
): { url: string; isFinalPrintLayout: boolean; usedPreviewImageFallback: boolean; warnings: GraphPrintWarning[] } | null {
  if (meta.print_image_url?.trim()) {
    return {
      url: meta.print_image_url.trim(),
      isFinalPrintLayout: true,
      usedPreviewImageFallback: false,
      warnings: [],
    };
  }

  const dedicated = resolveDedicatedPrintMediaUrl(asset);
  if (dedicated) {
    return {
      url: dedicated,
      isFinalPrintLayout: true,
      usedPreviewImageFallback: false,
      warnings: [],
    };
  }

  // Production: no print layout → PDF export unavailable (no preview fallback).
  if (isAppProduction()) {
    return null;
  }

  const preview = asset.imageUrlResolved ?? asset.imageUrl;
  if (!preview?.trim()) {
    return null;
  }

  return {
    url: preview.trim(),
    isFinalPrintLayout: false,
    usedPreviewImageFallback: true,
    warnings: [previewImageFallbackWarning()],
  };
}

export function buildGraphPrintSpec(
  asset: Pick<
    ResourceAssetView,
    'name' | 'slug' | 'id' | 'toolId' | 'imageUrl' | 'imageUrlResolved' | 'metadata'
  >,
  options?: BuildGraphPrintSpecOptions,
): GraphPrintSpec | null {
  const meta = parseGraphAssetPrintMetadata(asset.metadata);
  const imageSource = resolvePrintImageUrl(asset, meta);
  if (!imageSource) return null;

  const printMaxSizeCm = normalizePrintMaxSizeCm(meta.print_max_size_cm);
  const selectedSize =
    options?.printSizeCm ??
    normalizePrintSizeCm(meta.print_size_cm, printMaxSizeCm);

  if (selectedSize > printMaxSizeCm) {
    return null;
  }

  const layoutId = resolveGraphPrintLayoutId(meta);
  resolveLayoutDefinition(layoutId);

  const printDpi = normalizePrintDpi(meta.print_dpi);
  const page = resolveTherapeuticPageDimensions(
    layoutId,
    selectedSize,
    meta.recommended_page_size,
  );

  const printAssetType = resolvePrintAssetType(meta, imageSource.url);
  const warnings = mergeGraphPrintWarnings(imageSource.warnings);

  return {
    title: asset.name.trim() || asset.slug,
    printImageUrl: imageSource.url,
    printAssetType,
    isFinalPrintLayout: imageSource.isFinalPrintLayout,
    usedPreviewImageFallback: imageSource.usedPreviewImageFallback,
    printSizeCm: selectedSize,
    printMaxSizeCm,
    printDpi,
    layoutId,
    page,
    filenameBase: asset.slug || 'grafico',
    warnings,
  };
}

/** UI preview only — imagem de visualização (image_url). Never used for production PDF. */
export function getPreviewImageUrl(
  asset: Pick<ResourceAssetView, 'imageUrl' | 'imageUrlResolved'>,
): string | undefined {
  return asset.imageUrlResolved ?? asset.imageUrl;
}

export function getPhysicalPrintLabel(
  spec: Pick<GraphPrintSpec, 'printSizeCm' | 'printDpi' | 'printAssetType'>,
): string {
  const size = `${spec.printSizeCm}×${spec.printSizeCm} cm`;
  if (spec.printAssetType === 'svg') {
    return `${size} · SVG`;
  }
  return `${size} · ${spec.printDpi} DPI`;
}

export { DEFAULT_THERAPEUTIC_PRINT_DPI };

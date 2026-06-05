import { cmToPixels } from '@/lib/pdf/graphPrintConstants';
import {
  lowPrintResolutionWarning,
  type GraphPrintWarning,
} from '@/lib/pdf/graphPrintWarnings';
import type { GraphPrintSpec } from '@/lib/pdf/graphPrintTypes';

/**
 * Validates intrinsic image pixels against therapeutic print target.
 * SVG assets skip this — vector is print-ready at any selected physical size.
 */
export function validatePrintImageResolution(
  widthPx: number,
  heightPx: number,
  spec: Pick<GraphPrintSpec, 'printSizeCm' | 'printDpi' | 'printAssetType'>,
): GraphPrintWarning[] {
  if (spec.printAssetType === 'svg') {
    return [];
  }

  const targetPx = cmToPixels(spec.printSizeCm, spec.printDpi);
  const warnings: GraphPrintWarning[] = [];

  if (widthPx < targetPx || heightPx < targetPx) {
    warnings.push(
      lowPrintResolutionWarning(
        widthPx,
        heightPx,
        targetPx,
        spec.printSizeCm,
        spec.printDpi,
      ),
    );
  }

  return warnings;
}

import { cmToPixels } from '@/lib/pdf/graphPrintConstants';
import {
  lowPrintResolutionWarning,
  type GraphPrintWarning,
} from '@/lib/pdf/graphPrintWarnings';
import type { GraphPrintSpec } from '@/lib/pdf/graphPrintTypes';

/**
 * Validates intrinsic image pixels against therapeutic print target.
 * Does not upscale — warnings only.
 */
export function validatePrintImageResolution(
  widthPx: number,
  heightPx: number,
  spec: Pick<GraphPrintSpec, 'printSizeCm' | 'printDpi'>,
): GraphPrintWarning[] {
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

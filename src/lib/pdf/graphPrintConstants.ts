/** 1 cm in PDF points (72 pt per inch, 2.54 cm per inch). */
export const CM_TO_PT = 72 / 2.54;

/** Supported square therapeutic print sizes (cm). */
export const SUPPORTED_THERAPEUTIC_PRINT_SIZES_CM = [21, 25, 33] as const;

export type TherapeuticPrintSizeCm = (typeof SUPPORTED_THERAPEUTIC_PRINT_SIZES_CM)[number];

export const DEFAULT_THERAPEUTIC_PRINT_SIZE_CM: TherapeuticPrintSizeCm = 21;
export const DEFAULT_THERAPEUTIC_PRINT_DPI = 300;

/** PDF background — always white for therapeutic sheets. */
export const THERAPEUTIC_PDF_BACKGROUND = {
  r: 1,
  g: 1,
  b: 1,
} as const;

export function cmToPt(cm: number): number {
  return cm * CM_TO_PT;
}

/** Target pixel dimension for one cm edge at given DPI. */
export function cmToPixels(cm: number, dpi: number): number {
  return Math.round((cm / 2.54) * dpi);
}

export function isSupportedPrintSizeCm(value: number): value is TherapeuticPrintSizeCm {
  return (SUPPORTED_THERAPEUTIC_PRINT_SIZES_CM as readonly number[]).includes(value);
}

export function normalizePrintSizeCm(value: unknown): TherapeuticPrintSizeCm {
  if (typeof value === 'number' && isSupportedPrintSizeCm(value)) {
    return value;
  }
  return DEFAULT_THERAPEUTIC_PRINT_SIZE_CM;
}

export function normalizePrintDpi(value: unknown): number {
  if (typeof value === 'number' && value > 0 && value <= 600) {
    return Math.round(value);
  }
  return DEFAULT_THERAPEUTIC_PRINT_DPI;
}

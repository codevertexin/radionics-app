export type MaterialsLibraryErrorCode =
  | 'MATERIALS_NOT_AVAILABLE'
  | 'MATERIAL_NOT_FOUND'
  | 'MATERIAL_FORBIDDEN'
  | 'MATERIALS_SCHEMA_MISSING'
  | 'CONFIG';

export class MaterialsLibraryError extends Error {
  readonly code: MaterialsLibraryErrorCode;

  constructor(message: string, code: MaterialsLibraryErrorCode) {
    super(message);
    this.name = 'MaterialsLibraryError';
    this.code = code;
  }
}

export function isMaterialsLibraryError(err: unknown): err is MaterialsLibraryError {
  return err instanceof MaterialsLibraryError;
}

export function mapMaterialsSupabaseError(
  context: string,
  error: { message: string; code?: string },
): never {
  const msg = error.message.toLowerCase();

  if (
    error.code === '42P01'
    || (msg.includes('does not exist') && msg.includes('library_material'))
  ) {
    throw new MaterialsLibraryError(
      `[${context}] Schema Materials Library não encontrado. Aplique a migração V2.8B.`,
      'MATERIALS_SCHEMA_MISSING',
    );
  }

  if (
    error.code === '42501'
    || msg.includes('row-level security')
    || msg.includes('permission denied')
  ) {
    throw new MaterialsLibraryError(
      `[${context}] Sem permissão para ler este material.`,
      'MATERIAL_FORBIDDEN',
    );
  }

  throw new MaterialsLibraryError(
    `[${context}] ${error.message}`,
    'MATERIALS_NOT_AVAILABLE',
  );
}

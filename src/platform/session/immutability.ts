/**
 * Deep clone + freeze helpers for sealed domain objects (F1 correction).
 * Framework-neutral; no React.
 */

export function deepClone<T>(value: T): T {
  return structuredClone(value);
}

export function deepFreeze<T>(value: T): Readonly<T> {
  if (value === null || typeof value !== 'object') {
    return value as Readonly<T>;
  }

  if (Object.isFrozen(value)) {
    return value as Readonly<T>;
  }

  const obj = value as Record<string, unknown> | unknown[];
  for (const key of Object.keys(obj)) {
    const child = (obj as Record<string, unknown>)[key];
    if (child !== null && typeof child === 'object') {
      deepFreeze(child);
    }
  }

  return Object.freeze(value) as Readonly<T>;
}

/** Clone then freeze so later mutation of the input cannot affect the result. */
export function immutableClone<T>(value: T): Readonly<T> {
  return deepFreeze(deepClone(value));
}

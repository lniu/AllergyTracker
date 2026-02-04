/**
 * Type guard utilities for safer TypeScript filtering operations.
 * These replace filter(Boolean) which loses type information.
 */

/**
 * Type guard to check if a value is defined (not null or undefined).
 * Preserves type information when filtering arrays.
 * 
 * @example
 * const items = [allergen1, undefined, allergen2].filter(isDefined);
 * // items is now Allergen[] instead of (Allergen | undefined)[]
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if a value is not null.
 * 
 * @example
 * const items = [allergen1, null, allergen2].filter(isNotNull);
 * // items is now Allergen[] instead of (Allergen | null)[]
 */
export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

/**
 * Type guard to check if a value is not undefined.
 * 
 * @example
 * const items = [allergen1, undefined, allergen2].filter(isNotUndefined);
 * // items is now Allergen[] instead of (Allergen | undefined)[]
 */
export function isNotUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * Type guard for string values - checks if truthy string.
 * Filters out empty strings, null, and undefined.
 */
export function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.length > 0;
}

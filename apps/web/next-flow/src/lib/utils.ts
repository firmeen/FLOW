export type ClassDictionary = Readonly<Record<string, unknown>>;

export type ClassValue =
  | string
  | number
  | ClassDictionary
  | readonly ClassValue[]
  | false
  | null
  | undefined;

function appendClassNames(value: ClassValue, names: string[]): void {
  if (!value && value !== 0) {
    return;
  }

  if (typeof value === "string" || typeof value === "number") {
    names.push(String(value));
    return;
  }

  if (Array.isArray(value)) {
    for (const nestedValue of value) {
      appendClassNames(nestedValue, names);
    }
    return;
  }

  for (const [className, enabled] of Object.entries(value)) {
    if (enabled) {
      names.push(className);
    }
  }
}

/**
 * Joins conditional class names without requiring a runtime dependency.
 * It accepts strings, nested arrays, and object maps.
 */
export function cn(...values: readonly ClassValue[]): string {
  const names: string[] = [];

  for (const value of values) {
    appendClassNames(value, names);
  }

  return names.join(" ");
}

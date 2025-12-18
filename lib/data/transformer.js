/**
 * Convert snake_case or PascalCase to camelCase
 */
export function toCamelCase(str) {
  return str
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toLowerCase());
}

/**
 * Recursively transform object keys to camelCase
 */
export function transform(value) {
  if (Array.isArray(value)) {
    return value.map(item => transform(item));
  }
  
  if (value !== null && typeof value === 'object') {
    const result = {};
    
    for (const [key, val] of Object.entries(value)) {
      // Skip _kf key
      if (key === '_kf') {
        continue;
      }
      
      const camelKey = toCamelCase(key);
      result[camelKey] = transform(val);
    }
    
    return result;
  }
  
  return value;
}

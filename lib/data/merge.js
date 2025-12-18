/**
 * Deep merge two objects/values
 * Arrays are extended, objects are merged recursively
 */
export function merge(base, update) {
  // Both are objects - merge keys
  if (base && typeof base === 'object' && !Array.isArray(base) &&
      update && typeof update === 'object' && !Array.isArray(update)) {
    for (const [key, value] of Object.entries(update)) {
      if (base[key] === undefined) {
        base[key] = value;
      } else {
        base[key] = merge(base[key], value);
      }
    }
    return base;
  }
  
  // Both are arrays - extend
  if (Array.isArray(base) && Array.isArray(update)) {
    return [...base, ...update];
  }
  
  // Base is array, update is object - treat object keys as indices
  if (Array.isArray(base) && update && typeof update === 'object') {
    const result = [...base];
    for (const [key, value] of Object.entries(update)) {
      const index = parseInt(key);
      if (!isNaN(index)) {
        if (result[index] !== undefined) {
          result[index] = merge(result[index], value);
        } else {
          result.push(value);
        }
      }
    }
    return result;
  }
  
  // Otherwise, update replaces base
  return update;
}

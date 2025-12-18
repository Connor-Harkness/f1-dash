import pako from 'pako';

/**
 * Compress data using deflate and encode to base64
 */
export function deflate(data) {
  try {
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
    const compressed = pako.deflate(jsonStr);
    return Buffer.from(compressed).toString('base64');
  } catch (error) {
    console.error('Failed to deflate data:', error);
    return null;
  }
}

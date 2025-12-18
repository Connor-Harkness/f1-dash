import { transform, toCamelCase } from '@f1-dash/data';

/**
 * Message types from F1 SignalR
 */
export class Message {
  constructor(type, data) {
    this.type = type; // 'initial' or 'updates'
    this.data = data;
  }
}

/**
 * Parse SignalR message
 */
export function parseMessage(data) {
  try {
    const msg = JSON.parse(data);
    
    // Initial state message
    if (msg.R) {
      const transformed = transform(msg.R);
      return new Message('initial', transformed);
    }
    
    // Updates message
    if (msg.M && Array.isArray(msg.M)) {
      if (msg.M.length === 0) {
        return null;
      }
      
      const updates = [];
      
      for (const update of msg.M) {
        const category = update.A?.[0];
        const data = update.A?.[1];
        
        if (!category || !data) {
          continue;
        }
        
        const transformed = transform(data);
        updates.push([toCamelCase(category), transformed]);
      }
      
      return new Message('updates', updates);
    }
    
    return null;
  } catch (error) {
    console.error('Failed to parse message:', error);
    return null;
  }
}

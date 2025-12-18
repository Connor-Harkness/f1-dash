import { EventEmitter } from 'events';
import { createConnection } from './client.js';
import { parseMessage } from './message.js';

/**
 * Manages F1 WebSocket connection with auto-reconnect
 */
export class ClientManager extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.reconnecting = false;
  }
  
  async start() {
    await this.connect();
  }
  
  async connect() {
    if (this.reconnecting) {
      return;
    }
    
    this.reconnecting = true;
    
    // Wait before reconnecting
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      this.ws = await createConnection();
      
      this.ws.on('message', (data) => {
        const message = parseMessage(data.toString());
        
        if (message) {
          // Check if we need to restart (new session detected)
          if (this.shouldRestart(message)) {
            console.log('Session change detected, restarting connection');
            this.reconnect();
            return;
          }
          
          this.emit('message', message);
        }
      });
      
      this.ws.on('close', () => {
        console.log('WebSocket closed, reconnecting...');
        this.reconnect();
      });
      
      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error.message);
        this.reconnect();
      });
      
      // Set up timeout to detect stale connections
      this.setupTimeout();
      
      this.reconnecting = false;
      console.log('Client manager started successfully');
    } catch (error) {
      console.error('Failed to connect:', error.message);
      this.reconnecting = false;
      this.reconnect();
    }
  }
  
  setupTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = setTimeout(() => {
      console.log('No message received in 30 seconds, reconnecting...');
      this.reconnect();
    }, 30000);
  }
  
  shouldRestart(message) {
    if (message.type !== 'updates') {
      return false;
    }
    
    for (const [category, update] of message.data) {
      if (category === 'sessionInfo' && update.name !== undefined) {
        return true;
      }
    }
    
    return false;
  }
  
  reconnect() {
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close();
      this.ws = null;
    }
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    this.reconnecting = false;
    this.connect();
  }
  
  close() {
    if (this.ws) {
      this.ws.close();
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}

export function createManager() {
  return new ClientManager();
}

import WebSocket from 'ws';
import https from 'https';
import { URL } from 'url';
import { F1_BASE_URL, SIGNALR_HUB, SIGNALR_SUBSCRIBE } from './consts.js';

/**
 * Negotiate with F1 SignalR hub
 */
async function negotiate() {
  const url = new URL(`https://${F1_BASE_URL}/negotiate`);
  url.searchParams.append('clientProtocol', '1.5');
  url.searchParams.append('connectionData', SIGNALR_HUB);
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Negotiation timeout')), 5000);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        clearTimeout(timeout);
        try {
          const json = JSON.parse(data);
          const cookie = res.headers['set-cookie']?.[0] || '';
          
          resolve({
            token: json.ConnectionToken || '',
            cookie: cookie
          });
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

/**
 * Create WebSocket connection to F1 SignalR
 */
export async function createConnection() {
  // Check for custom WebSocket URL (for simulator/testing)
  const customUrl = process.env.WS_URL;
  if (customUrl) {
    const ws = new WebSocket(customUrl);
    return new Promise((resolve, reject) => {
      ws.on('open', () => resolve(ws));
      ws.on('error', reject);
      setTimeout(() => reject(new Error('Connection timeout')), 10000);
    });
  }
  
  // Negotiate with F1 API
  const negotiation = await negotiate();
  
  // Build WebSocket URL
  const wsUrl = new URL(`wss://${F1_BASE_URL}/connect`);
  wsUrl.searchParams.append('clientProtocol', '1.5');
  wsUrl.searchParams.append('transport', 'webSockets');
  wsUrl.searchParams.append('connectionToken', negotiation.token);
  wsUrl.searchParams.append('connectionData', SIGNALR_HUB);
  
  // Create WebSocket with headers
  const ws = new WebSocket(wsUrl, {
    headers: {
      'User-Agent': 'BestHTTP',
      'Accept-Encoding': 'gzip,identity',
      'Cookie': negotiation.cookie
    }
  });
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Connection timeout'));
    }, 10000);
    
    ws.on('open', () => {
      clearTimeout(timeout);
      console.log('WebSocket connected');
      
      // Subscribe to F1 data streams
      ws.send(SIGNALR_SUBSCRIBE);
      console.log('Subscribed to F1 streams');
      
      resolve(ws);
    });
    
    ws.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

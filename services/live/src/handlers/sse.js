/**
 * Server-Sent Events handler for live F1 timing data
 */
export function sseHandler(req, res, appState) {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
  
  console.log(`New SSE connection (total: ${appState.clients.size + 1})`);
  
  // Create client object
  const client = {
    sendInitial: (data) => {
      res.write(`event: initial\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    },
    sendUpdate: (data) => {
      res.write(`event: update\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    },
    sendKeepAlive: () => {
      res.write(`:keep-alive\n\n`);
    }
  };
  
  // Add client to active clients
  appState.clients.add(client);
  
  // Send initial state immediately
  if (Object.keys(appState.state).length > 0) {
    console.log('Sending initial state to new client');
    client.sendInitial(appState.state);
  }
  
  // Set up keep-alive interval
  const keepAliveInterval = setInterval(() => {
    client.sendKeepAlive();
  }, 10000); // 10 seconds
  
  // Clean up on connection close
  req.on('close', () => {
    console.log(`SSE connection closed (remaining: ${appState.clients.size - 1})`);
    clearInterval(keepAliveInterval);
    appState.clients.delete(client);
  });
  
  req.on('error', (error) => {
    console.error('SSE connection error:', error.message);
    clearInterval(keepAliveInterval);
    appState.clients.delete(client);
  });
}

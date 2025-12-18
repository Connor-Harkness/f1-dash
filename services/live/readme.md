# Live

Connects to the F1 SignalR websocket endpoint or the simulator and maintains the full current state.
Also spins up a HTTP server with a SSE endpoint where initially the maintained full state gets sent and then the partial updates get forwarded.

## Usage

```bash
cd services/live
npm install
npm start
```

Or from the root:

```bash
npm run start:live
```

## Configuration

You can set the port and address, origin and websocket URL with these env vars:

```bash
# The address and port where it starts
LIVE_ADDRESS=0.0.0.0:4000

# The origin for CORS (semicolon separated)
ORIGIN=http://localhost:3000

# Optional: Custom WebSocket URL (for simulator/testing)
WS_URL=ws://localhost:8080
```

## Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/sse` - Server-Sent Events stream for live timing data
- `GET /api/drivers` - Get current driver list
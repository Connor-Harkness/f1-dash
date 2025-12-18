# API

Parses an iCal file and returns JSON for the current F1 season schedule.

## Usage

```bash
cd services/api
npm install
npm start
```

Or from the root:

```bash
npm run start:api
```

## Configuration

You can set the port, address and origin with these env vars:

```bash
# The address and port where it starts
API_ADDRESS=0.0.0.0:4001

# The origin for CORS (semicolon separated)
ORIGIN=http://localhost:3000
```

## Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/schedule` - Get full F1 schedule for current year
- `GET /api/schedule/next` - Get next upcoming race
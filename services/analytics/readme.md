# Analytics

Saves live timing data in a timeseries database and provides analytics of said data.

## Usage

```bash
cd services/analytics
npm install
npm start
```

Or from the root:

```bash
npm run start:analytics
```

## Configuration

You can set the port and address with these env vars:

```bash
# The address and port where it starts
ANALYTICS_ADDRESS=0.0.0.0:4002

# The origin for CORS (semicolon separated)
ORIGIN=http://localhost:3000

# Database connection string
DATABASE_URL=postgres://postgres:password@localhost:5432/postgres
```

## Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/laptime/:driverNr` - Get lap times for a specific driver
- `GET /api/gap/:driverNr` - Get gap data for a specific driver

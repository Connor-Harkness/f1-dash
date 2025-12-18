import { getLaptimes } from '@f1-dash/timescale';

export async function laptimesHandler(req, res) {
  const { driverNr } = req.params;
  const dbPool = req.app.locals.dbPool;
  
  try {
    const laptimes = await getLaptimes(dbPool, driverNr);
    res.json(laptimes);
  } catch (error) {
    console.error('Failed to get laptimes for driver', driverNr, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

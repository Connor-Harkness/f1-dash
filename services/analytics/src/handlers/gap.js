import { getGaps } from '@f1-dash/timescale';

export async function gapHandler(req, res) {
  const { driverNr } = req.params;
  const dbPool = req.app.locals.dbPool;
  
  try {
    const gaps = await getGaps(dbPool, driverNr);
    res.json(gaps);
  } catch (error) {
    console.error('Failed to get gaps for driver', driverNr, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

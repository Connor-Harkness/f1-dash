export function driversHandler(req, res, appState) {
  const driverList = appState.state.driverList;
  
  if (!driverList) {
    return res.status(500).json({ error: 'Driver list not available' });
  }
  
  // Convert object to array
  const drivers = Object.values(driverList);
  
  res.json(drivers);
}

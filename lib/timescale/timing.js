/**
 * Insert timing data for a driver
 */
export async function insertTimingDriver(pool, driver) {
  const query = `
    INSERT INTO timing_driver (nr, lap, gap, leader_gap, laptime, sector_1, sector_2, sector_3)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
  
  const values = [
    driver.nr,
    driver.lap,
    driver.gap,
    driver.leaderGap,
    driver.laptime,
    driver.sector1,
    driver.sector2,
    driver.sector3
  ];
  
  await pool.query(query, values);
}

/**
 * Get lap times for a driver
 */
export async function getLaptimes(pool, driverNr) {
  const query = `
    SELECT
      lap,
      MIN(laptime) AS laptime,
      MIN(time) AS time
    FROM
      timing_driver
    WHERE
      nr = $1
      AND laptime != 0
    GROUP BY
      lap
    ORDER BY
      lap
  `;
  
  const result = await pool.query(query, [driverNr]);
  
  return result.rows.map(row => ({
    time: row.time,
    lap: row.lap,
    laptime: parseInt(row.laptime)
  }));
}

/**
 * Get gaps for a driver
 */
export async function getGaps(pool, driverNr) {
  const query = `
    SELECT
      gap,
      time
    FROM
      timing_driver
    WHERE
      nr = $1
      AND gap != 0
  `;
  
  const result = await pool.query(query, [driverNr]);
  
  return result.rows.map(row => ({
    time: row.time,
    gap: parseInt(row.gap)
  }));
}

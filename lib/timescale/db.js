import pg from 'pg';
const { Pool } = pg;

/**
 * Initialize TimescaleDB connection pool
 */
export async function initTimescaleDB() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 10
  });
  
  // Test connection
  try {
    await pool.query('SELECT NOW()');
    console.log('TimescaleDB connection established');
  } catch (error) {
    console.error('Failed to connect to TimescaleDB:', error);
    throw error;
  }
  
  return pool;
}

import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// Use individual variables from Vercel Integration as priority
const config = {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
  ssl: {
    rejectUnauthorized: false
  }
};

// Fallback to connection string if individual variables aren't present (Local Dev)
const pool = (config.user && config.host) 
  ? new Pool(config)
  : new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

// Test connection immediately
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Database connected successfully!');
    if (release) release();
  }
});

export default pool;

import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;


export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false } // enable if using hosted Postgres with SSL
});
const result = await pool.query("SELECT current_user");
console.log("Connected as:", result.rows[0].current_user);
const result2 = await pool.query("SELECT current_database()");
console.log("Connected DB:", result2.rows[0].current_database);
const result3 = await pool.query("SHOW search_path");
console.log("Search path:", result3.rows[0].search_path);
// helper: query(text, params)
export const q = (text, params) => pool.query(text, params);

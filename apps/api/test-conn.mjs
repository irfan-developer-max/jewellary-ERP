import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '../../.env' });
console.log('Testing raw connection with channel_binding=require:');
const pool1 = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  const res1 = await pool1.query('SELECT 1 as test');
  console.log('Pool 1 (with channel_binding): SUCCESS!', res1.rows);
} catch (e) {
  console.log('Pool 1 (with channel_binding): FAILED ->', e.message);
} finally {
  await pool1.end();
}

console.log('\nTesting connection WITHOUT channel_binding:');
const cleanUrl = new URL(process.env.DATABASE_URL);
cleanUrl.searchParams.delete('channel_binding');
const pool2 = new pg.Pool({ connectionString: cleanUrl.toString() });
try {
  const res2 = await pool2.query('SELECT 1 as test');
  console.log('Pool 2 (WITHOUT channel_binding): SUCCESS!', res2.rows);
} catch (e) {
  console.log('Pool 2 (WITHOUT channel_binding): FAILED ->', e.message);
} finally {
  await pool2.end();
}

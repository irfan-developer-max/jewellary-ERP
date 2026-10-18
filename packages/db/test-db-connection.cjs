const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '../../.env');
const env = {};
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (match) env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
}

console.log('--- Testing Database Connection ---');
console.log('DATABASE_URL:', env.DATABASE_URL.replace(/:[^:@]+@/, ':***@'));
console.log('NODE_ENV:', env.NODE_ENV);

// Test with original connection string
const pool1 = new Pool({ connectionString: env.DATABASE_URL });
pool1.query('SELECT 1 as test', (err, res) => {
  if (err) {
    console.error('❌ Connection WITH channel_binding FAILED:');
    console.error('  Error message:', err.message);
  } else {
    console.log('✅ Connection WITH channel_binding SUCCEEDED:', res.rows);
  }
  pool1.end();

  const pool2 = new Pool({ connectionString: env.DATABASE_URL });
  async function checkTables() {
    try {
      const users = await pool2.query('SELECT count(*) as count from "User"');
      const products = await pool2.query('SELECT count(*) as count from "Product"');
      const categories = await pool2.query('SELECT count(*) as count from "Category"');
      const sales = await pool2.query('SELECT count(*) as count from "Sale"');
      const customers = await pool2.query('SELECT count(*) as count from "Customer"');
      const vendors = await pool2.query('SELECT count(*) as count from "Vendor"');

      console.log('📊 Table Record Counts:');
      console.log('  Users:', users.rows[0].count);
      console.log('  Products:', products.rows[0].count);
      console.log('  Categories:', categories.rows[0].count);
      console.log('  Sales:', sales.rows[0].count);
      console.log('  Customers:', customers.rows[0].count);
      console.log('  Vendors:', vendors.rows[0].count);
    } catch (e) {
      console.error('Query error:', e.message);
    } finally {
      await pool2.end();
    }
  }
  checkTables();
});

import { db } from '@vercel/postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

async function createTable() {
  const client = await db.connect();
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await client.sql`
      CREATE TABLE IF NOT EXISTS guestbook_entries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );`;
    // Ensure ip column exists for rate limiting by IP
    await client.sql`
      ALTER TABLE guestbook_entries
      ADD COLUMN IF NOT EXISTS ip VARCHAR(45);
    `;
    // Ensure blacklisted_ips table exists for storing blocked IP addresses
    await client.sql`
      CREATE TABLE IF NOT EXISTS blacklisted_ips (
        ip VARCHAR(45) PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Table "guestbook_entries" created successfully or already exists.');
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  } finally {
    await client.release();
  }
}

createTable()
  .then(() => console.log('Script finished successfully.'))
  .catch((err) => {
    console.error('Script failed:', err);
    process.exit(1);
  }); 
import { pool } from './config/db';

const queries = [
  `CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
      content TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb;`
];

async function run() {
  if (!pool) {
    console.log('Database pool not initialized (using mock mode). Skipping live migration.');
    process.exit(0);
  }
  console.log('Running Phase 2 database migrations...');
  for (const q of queries) {
    try {
      await pool.query(q);
      console.log('Executed query successfully.');
    } catch (e: any) {
      console.error('Error running migration query:', e.message);
    }
  }
  console.log('Migrations completed.');
  process.exit(0);
}

run();

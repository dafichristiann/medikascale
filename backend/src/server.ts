import { config } from './config/index.js';
import { createApp, setupWebSocket } from './app.js';
import runMigrations from './db/migrate.js';
import seed from './db/seed.js';
import pool from './db/pool.js';

async function start() {
  try {
    console.log('Testing database connection...');
    await pool.query('SELECT 1');
    console.log('✓ Database connected');

    console.log('Running migrations...');
    await runMigrations();
    console.log('✓ Migrations complete');

    const { rows } = await pool.query('SELECT COUNT(*)::int AS c FROM users');
    if (rows[0].c === 0) {
      console.log('Seeding demo data...');
      await seed();
      console.log('✓ Demo data seeded');
    } else {
      console.log('Skipping seed (data exists)');
    }

    const app = createApp();
    const io = setupWebSocket(app);
    const httpServer = io.httpServer;

    httpServer?.listen(config.port, () => {
      console.log(`✓ Server running on http://localhost:${config.port}`);
      console.log(`✓ WebSocket available on ws://localhost:${config.port}`);
      console.log('\nDemo credentials:');
      console.log('  admin / admin123');
      console.log('  dokter / dokter123');
      console.log('  perawat / perawat123');
    });
  } catch (error) {
    console.error('Failed to start:', error);
    process.exit(1);
  }
}

start();

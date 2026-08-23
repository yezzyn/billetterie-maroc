// Local PostgreSQL runner for dev machines without Docker.
// Usage: node scripts/db.mjs start|stop
import EmbeddedPostgres from 'embedded-postgres';
import { existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const dataDir = join(homedir(), '.billetterie-pg');
const pidFile = join(dataDir, 'postmaster.pid');
const isRunning = () => existsSync(pidFile);

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'user',
  password: 'password',
  port: 5432,
  persistent: true
});

const command = process.argv[2];

if (command === 'stop') {
  if (!isRunning()) {
    console.log('PostgreSQL is not running.');
    process.exit(0);
  }
  await pg.stop();
  console.log('PostgreSQL stopped.');
} else if (command === 'start') {
  if (isRunning()) {
    console.log('PostgreSQL already running on port 5432.');
    process.exit(0);
  }
  mkdirSync(dataDir, { recursive: true });
  if (!existsSync(join(dataDir, 'PG_VERSION'))) {
    await pg.initialise();
    console.log('PostgreSQL data directory initialised.');
  }
  await pg.start();
  await pg.createDatabase('billetterie_maroc').catch((e) => {
    if (!String(e).includes('already exists')) throw e;
  });
  console.log('PostgreSQL running on localhost:5432 (db: billetterie_maroc).');
} else {
  console.log('Usage: node scripts/db.mjs start|stop');
  process.exit(1);
}
process.exit(0);

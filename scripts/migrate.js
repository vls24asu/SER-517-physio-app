require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');
const mysql = require('mysql2/promise');

const migrationsDir = path.join(__dirname, '..', 'database', 'migrations');

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizeSql(sql) {
  return sql
    .replace(/^\s*USE\s+`?physio`?\s*;\s*$/gim, '')
    .trim();
}

async function ensureMigrationsTable(connection) {
  await connection.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  );
}

async function getAppliedMigrations(connection) {
  const [rows] = await connection.query(
    'SELECT filename FROM schema_migrations ORDER BY filename ASC'
  );

  return new Set(rows.map(row => row.filename));
}

async function getMigrationFiles() {
  const entries = await fs.readdir(migrationsDir, { withFileTypes: true });

  return entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.sql'))
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

async function applyMigration(connection, filename) {
  const fullPath = path.join(migrationsDir, filename);
  const rawSql = await fs.readFile(fullPath, 'utf8');
  const sql = normalizeSql(rawSql);

  if (!sql) {
    console.log(`Skipping ${filename}: empty after normalization`);
    return;
  }

  console.log(`Applying ${filename}`);
  await connection.query(sql);
  await connection.query(
    'INSERT INTO schema_migrations (filename) VALUES (?)',
    [filename]
  );
}

async function main() {
  const connection = await mysql.createConnection({
    host: requiredEnv('DB_HOST'),
    user: requiredEnv('DB_USER'),
    password: requiredEnv('DB_PASSWORD'),
    database: requiredEnv('DB_NAME'),
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    multipleStatements: true
  });

  try {
    await ensureMigrationsTable(connection);

    const applied = await getAppliedMigrations(connection);
    const files = await getMigrationFiles();

    for (const filename of files) {
      if (applied.has(filename)) {
        console.log(`Skipping ${filename}: already applied`);
        continue;
      }

      await applyMigration(connection, filename);
    }

    console.log('Migrations complete');
  } finally {
    await connection.end();
  }
}

main().catch(err => {
  console.error('Migration run failed');
  console.error(err.message);
  process.exit(1);
});

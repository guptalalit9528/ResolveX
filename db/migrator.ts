import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

export interface MigrationResult {
  version: string;
  name: string;
  status: 'APPLIED' | 'SKIPPED' | 'FAILED';
  durationMs?: number;
  error?: string;
}

export interface DatabaseExecutor {
  query(sql: string, params?: any[]): Promise<{ rows: any[] }>;
}

export class Migrator {
  private migrationsDir: string;

  constructor(migrationsDir?: string) {
    this.migrationsDir = migrationsDir || path.resolve(__dirname, './migrations');
  }

  async initSchema(db: DatabaseExecutor): Promise<void> {
    await db.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  async getAppliedMigrations(db: DatabaseExecutor): Promise<Set<string>> {
    await this.initSchema(db);
    const result = await db.query('SELECT version FROM schema_migrations ORDER BY version ASC');
    return new Set(result.rows.map((row: any) => row.version));
  }

  async getMigrationFiles(): Promise<{ version: string; name: string; fullPath: string }[]> {
    if (!fs.existsSync(this.migrationsDir)) {
      throw new Error(`Migrations directory not found: ${this.migrationsDir}`);
    }

    const files = fs.readdirSync(this.migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    return files.map((file) => {
      const parts = file.split('_');
      const version = parts[0];
      return {
        version,
        name: file,
        fullPath: path.join(this.migrationsDir, file),
      };
    });
  }

  async run(db: DatabaseExecutor): Promise<MigrationResult[]> {
    const applied = await this.getAppliedMigrations(db);
    const files = await this.getMigrationFiles();
    const results: MigrationResult[] = [];

    for (const file of files) {
      if (applied.has(file.version)) {
        results.push({ version: file.version, name: file.name, status: 'SKIPPED' });
        continue;
      }

      const sql = fs.readFileSync(file.fullPath, 'utf-8');
      const start = Date.now();

      try {
        if (typeof (db as any).exec === 'function') {
          await (db as any).exec('BEGIN;');
          await (db as any).exec(sql);
          await db.query(
            'INSERT INTO schema_migrations (version, name, applied_at) VALUES ($1, $2, NOW())',
            [file.version, file.name],
          );
          await (db as any).exec('COMMIT;');
        } else {
          await db.query('BEGIN');
          await db.query(sql);
          await db.query(
            'INSERT INTO schema_migrations (version, name, applied_at) VALUES ($1, $2, NOW())',
            [file.version, file.name],
          );
          await db.query('COMMIT');
        }

        results.push({
          version: file.version,
          name: file.name,
          status: 'APPLIED',
          durationMs: Date.now() - start,
        });
      } catch (err: any) {
        await db.query('ROLLBACK');
        results.push({
          version: file.version,
          name: file.name,
          status: 'FAILED',
          durationMs: Date.now() - start,
          error: err.message,
        });
        throw new Error(`Migration ${file.name} failed: ${err.message}`);
      }
    }

    return results;
  }
}

// CLI Execution entry point
if (require.main === module) {
  (async () => {
    const connectionString =
      process.env.DATABASE_OWNER_URL ||
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres_superuser_pass@localhost:5432/resolvex_db';

    console.log(`[Migrator] Connecting to database...`);
    const client = new Client({ connectionString });
    try {
      await client.connect();
      console.log(`[Migrator] Connected. Running migrations...`);
      const migrator = new Migrator();
      const results = await migrator.run(client);
      for (const res of results) {
        console.log(`  [${res.status}] ${res.version} - ${res.name} (${res.durationMs || 0}ms)`);
      }
      console.log(`[Migrator] All migrations executed successfully.`);
    } catch (err: any) {
      console.error(`[Migrator] Error:`, err.message);
      process.exit(1);
    } finally {
      await client.end().catch(() => {});
    }
  })();
}

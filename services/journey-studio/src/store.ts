import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { StudioError } from './security';

export function openStore(directory: string) {
  const db = new Database(path.join(directory, 'studio.sqlite'));
  fs.chmodSync(path.join(directory, 'studio.sqlite'), 0o600);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY, owner TEXT NOT NULL, email TEXT NOT NULL, profile TEXT NOT NULL,
      submitted INTEGER NOT NULL, expires INTEGER NOT NULL, status TEXT NOT NULL,
      current_version INTEGER NOT NULL DEFAULT 1, approved_version INTEGER,
      idempotency TEXT NOT NULL, input_hash TEXT NOT NULL, UNIQUE(owner,idempotency)
    );
    CREATE INDEX IF NOT EXISTS requests_owner ON requests(owner,submitted);
    CREATE INDEX IF NOT EXISTS requests_expiry ON requests(expires);
    CREATE TABLE IF NOT EXISTS versions (
      request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE, version INTEGER NOT NULL,
      snapshot TEXT NOT NULL, hash TEXT, manifest TEXT, state TEXT NOT NULL DEFAULT 'queued',
      PRIMARY KEY(request_id,version)
    );
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY, request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      version INTEGER NOT NULL, kind TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'queued',
      attempts INTEGER NOT NULL DEFAULT 0, available INTEGER NOT NULL, lease INTEGER, error TEXT,
      UNIQUE(request_id,version,kind)
    );
    CREATE INDEX IF NOT EXISTS jobs_pending ON jobs(state,available);
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY, request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      version INTEGER NOT NULL, decision TEXT NOT NULL, reviewer TEXT NOT NULL, notes TEXT NOT NULL,
      created INTEGER NOT NULL, hash TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS outbox (
      id INTEGER PRIMARY KEY, request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      version INTEGER NOT NULL, kind TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'queued',
      attempts INTEGER NOT NULL DEFAULT 0, available INTEGER NOT NULL, first_attempt INTEGER,
      provider_id TEXT, mode TEXT, error TEXT, UNIQUE(request_id,version,kind)
    );
    CREATE TABLE IF NOT EXISTS mail_budget (id TEXT PRIMARY KEY, day TEXT NOT NULL, month TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS limits (key TEXT NOT NULL, bucket INTEGER NOT NULL, count INTEGER NOT NULL, expires INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(key,bucket));
  `);
  if (
    !(db.pragma('table_info(limits)') as { name: string }[]).some(
      (column) => column.name === 'expires',
    )
  )
    db.exec('ALTER TABLE limits ADD COLUMN expires INTEGER NOT NULL DEFAULT 0');
  return db;
}
export type Store = ReturnType<typeof openStore>;
export function rateLimit(
  db: Store,
  key: string,
  maximum: number,
  period = 60_000,
  now = Date.now(),
) {
  const bucket = Math.floor(now / period);
  db.transaction(() => {
    db.prepare('DELETE FROM limits WHERE bucket < ? AND key = ?').run(
      bucket - 1,
      key,
    );
    db.prepare(
      'INSERT INTO limits(key,bucket,count,expires) VALUES(?,?,1,?) ON CONFLICT(key,bucket) DO UPDATE SET count=count+1',
    ).run(key, bucket, (bucket + 2) * period);
    const row = db
      .prepare('SELECT count FROM limits WHERE key=? AND bucket=?')
      .get(key, bucket) as { count: number };
    if (row.count > maximum)
      throw new StudioError(
        'RATE_LIMITED',
        429,
        'Please wait before trying again.',
      );
  })();
}

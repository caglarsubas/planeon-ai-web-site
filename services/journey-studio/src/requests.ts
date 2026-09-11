import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  packRequestSchema,
  retentionMs,
  REVIEWER_EMAIL,
  type RequestProfile,
} from '../../../lib/studio/account';
import {
  validateRecipe,
  type RecipeSnapshot,
} from '../../../lib/studio/contract';
import type { Store } from './store';
import { rateLimit } from './store';
import { canonical, sign, sameSecret, StudioError } from './security';
import {
  hashBytes,
  readArtifact,
  prepareDocuments,
  type Manifest,
} from './documents';
import type { StudioConfig } from './config';
import type { Inference, InferenceLane } from './inference';
import type { Mailer } from './mail';

export type Identity = { id: string; email: string; emailVerified: boolean };
type RequestRow = {
  id: string;
  owner: string;
  email: string;
  profile: string;
  submitted: number;
  expires: number;
  status: string;
  current_version: number;
  approved_version: number | null;
  input_hash: string;
};
type VersionRow = {
  version: number;
  snapshot: string;
  manifest: string | null;
  hash: string | null;
  state: string;
};
export class RequestService {
  private ticking = false;
  constructor(
    readonly db: Store,
    readonly config: StudioConfig,
    readonly inference: Inference,
    readonly lane: InferenceLane,
    readonly mailer: Mailer,
  ) {}
  reviewer(user: Identity) {
    return user.emailVerified && user.email.toLowerCase() === REVIEWER_EMAIL;
  }
  private verified(user: Identity) {
    if (!user.emailVerified)
      throw new StudioError('VERIFICATION_REQUIRED', 401);
  }
  private row(id: string) {
    const row = this.db.prepare('SELECT * FROM requests WHERE id=?').get(id) as
      | RequestRow
      | undefined;
    if (!row || row.expires <= Date.now() || row.status === 'deleted')
      throw new StudioError('NOT_FOUND', 404);
    return row;
  }
  private version(id: string, version: number) {
    const row = this.db
      .prepare('SELECT * FROM versions WHERE request_id=? AND version=?')
      .get(id, version) as VersionRow | undefined;
    if (!row) throw new StudioError('NOT_FOUND', 404);
    return row;
  }
  submit(user: Identity, raw: unknown) {
    this.verified(user);
    const input = packRequestSchema.parse(raw);
    validateRecipe(input.snapshot.recipe);
    if (!sameSecret(sign(this.config.secret, input.snapshot), input.signature))
      throw new StudioError(
        'RECIPE_SIGNATURE_INVALID',
        400,
        'Generate and confirm a fresh proposal before requesting a pack.',
      );
    const inputHash = hashBytes(canonical(input));
    const existing = this.db
      .prepare('SELECT * FROM requests WHERE owner=? AND idempotency=?')
      .get(user.id, input.idempotencyKey) as RequestRow | undefined;
    if (existing) {
      if (existing.input_hash !== inputHash)
        throw new StudioError('IDEMPOTENCY_CONFLICT', 409);
      return { id: existing.id, status: existing.status };
    }
    rateLimit(this.db, `submission:${user.id}`, 3, 24 * 60 * 60 * 1000);
    const queued = this.db
      .prepare(
        "SELECT count(*) n FROM jobs WHERE state IN ('queued','running')",
      )
      .get() as { n: number };
    if (queued.n >= 20) throw new StudioError('PREPARATION_QUEUE_FULL', 503);
    const id = randomUUID();
    const now = Date.now();
    this.db.transaction(() => {
      this.db
        .prepare(
          'INSERT INTO requests(id,owner,email,profile,submitted,expires,status,idempotency,input_hash) VALUES(?,?,?,?,?,?,?,?,?)',
        )
        .run(
          id,
          user.id,
          user.email,
          JSON.stringify(input.profile),
          now,
          now + retentionMs,
          'preparing',
          input.idempotencyKey,
          inputHash,
        );
      this.db
        .prepare(
          'INSERT INTO versions(request_id,version,snapshot) VALUES(?,?,?)',
        )
        .run(id, 1, JSON.stringify(input.snapshot));
      this.db
        .prepare(
          'INSERT INTO jobs(request_id,version,kind,available) VALUES(?,?,?,?)',
        )
        .run(id, 1, 'prepare', now);
    })();
    return { id, status: 'preparing' };
  }
  list(user: Identity, review = false) {
    this.verified(user);
    if (review && !this.reviewer(user)) throw new StudioError('FORBIDDEN', 403);
    const rows = this.db
      .prepare(
        `SELECT * FROM requests WHERE expires>? AND status!='deleted' ${review ? '' : 'AND owner=?'} ORDER BY submitted DESC LIMIT 300`,
      )
      .all(...(review ? [Date.now()] : [Date.now(), user.id])) as RequestRow[];
    return rows.map((r) => this.details(user, r.id, review));
  }
  details(user: Identity, id: string, review = false) {
    this.verified(user);
    const r = this.row(id);
    if (review ? !this.reviewer(user) : r.owner !== user.id)
      throw new StudioError('NOT_FOUND', 404);
    const released =
      !review && r.status === 'approved' && r.approved_version !== null;
    const v =
      review || released
        ? this.version(id, review ? r.current_version : r.approved_version!)
        : null;
    const delivery = this.db
      .prepare(
        "SELECT state,mode,error FROM outbox WHERE request_id=? AND version=? AND kind='delivery'",
      )
      .get(id, r.approved_version) as
      | { state: string; mode: string; error: string }
      | undefined;
    return {
      id: r.id,
      submitted: r.submitted,
      expires: r.expires,
      status: r.status,
      version: review ? r.current_version : r.approved_version,
      title: (JSON.parse((v || this.version(id, 1)).snapshot) as RecipeSnapshot)
        .recipe.title,
      delivery: delivery
        ? { state: delivery.state, mode: delivery.mode }
        : null,
      ...(v?.manifest ? { manifest: JSON.parse(v.manifest) as Manifest } : {}),
      ...(review
        ? {
            email: r.email,
            profile: JSON.parse(r.profile),
            snapshot: JSON.parse(v!.snapshot),
            history: this.db
              .prepare(
                'SELECT version,decision,notes,created,hash FROM reviews WHERE request_id=? ORDER BY id',
              )
              .all(id),
          }
        : {}),
    };
  }
  async artifact(
    user: Identity,
    id: string,
    version: number,
    name: string,
    review = false,
  ) {
    this.verified(user);
    const r = this.row(id);
    if (review ? !this.reviewer(user) : r.owner !== user.id)
      throw new StudioError('NOT_FOUND', 404);
    if (
      review
        ? r.current_version !== version ||
          !['review', 'approved'].includes(r.status)
        : r.status !== 'approved' || r.approved_version !== version
    )
      throw new StudioError('NOT_FOUND', 404);
    const v = this.version(id, version);
    if (!v.manifest) throw new StudioError('NOT_FOUND', 404);
    const result = await readArtifact(
      this.config.directory,
      id,
      JSON.parse(v.manifest),
      name,
    );
    const latest = this.row(id);
    if (
      review
        ? latest.current_version !== version ||
          !['review', 'approved'].includes(latest.status)
        : latest.approved_version !== version || latest.status !== 'approved'
    )
      throw new StudioError('NOT_FOUND', 404);
    return result;
  }
  async decide(
    user: Identity,
    id: string,
    input: {
      version: number;
      hash: string;
      decision: 'approve' | 'revise' | 'reject';
      notes: string;
      confirm: boolean;
    },
    reauthenticate: () => Promise<Identity> = async () => user,
  ) {
    this.verified(user);
    if (!this.reviewer(user)) throw new StudioError('FORBIDDEN', 403);
    if (
      !input.confirm ||
      !['approve', 'revise', 'reject'].includes(input.decision) ||
      input.notes.length > 2000 ||
      (input.decision === 'revise' && input.notes.trim().length < 10)
    )
      throw new StudioError('REVIEW_CONFIRMATION_REQUIRED');
    const r = this.row(id);
    const v = this.version(id, input.version);
    if (
      r.status !== 'review' ||
      r.current_version !== input.version ||
      v.hash !== input.hash ||
      !v.manifest
    )
      throw new StudioError(
        'STALE_REVIEW',
        409,
        'This review is stale. Open the current prepared version.',
      );
    const manifest = JSON.parse(v.manifest) as Manifest;
    for (const file of manifest.artifacts)
      await readArtifact(this.config.directory, id, manifest, file.name);
    const currentIdentity = await reauthenticate();
    this.verified(currentIdentity);
    if (currentIdentity.id !== user.id || !this.reviewer(currentIdentity))
      throw new StudioError('SIGN_IN_REQUIRED', 401);
    this.db.transaction(() => {
      const current = this.row(id);
      if (
        current.status !== 'review' ||
        current.current_version !== input.version
      )
        throw new StudioError('STALE_REVIEW', 409);
      this.db
        .prepare(
          'INSERT INTO reviews(request_id,version,decision,reviewer,notes,created,hash) VALUES(?,?,?,?,?,?,?)',
        )
        .run(
          id,
          input.version,
          input.decision,
          user.email,
          input.notes.trim(),
          Date.now(),
          input.hash,
        );
      this.db
        .prepare(
          "UPDATE outbox SET state='cancelled' WHERE request_id=? AND kind='review' AND state!='accepted'",
        )
        .run(id);
      if (input.decision === 'approve') {
        this.db
          .prepare(
            "UPDATE requests SET status='approved', approved_version=? WHERE id=?",
          )
          .run(input.version, id);
        this.db
          .prepare(
            "UPDATE versions SET state='approved' WHERE request_id=? AND version=?",
          )
          .run(id, input.version);
        this.db
          .prepare(
            "INSERT OR IGNORE INTO outbox(request_id,version,kind,available) VALUES(?,?,'delivery',?)",
          )
          .run(id, input.version, Date.now());
      } else if (input.decision === 'reject') {
        this.db
          .prepare("UPDATE requests SET status='rejected' WHERE id=?")
          .run(id);
      } else {
        const queued = this.db
          .prepare(
            "SELECT count(*) n FROM jobs WHERE state IN ('queued','running')",
          )
          .get() as { n: number };
        if (queued.n >= 20)
          throw new StudioError('PREPARATION_QUEUE_FULL', 503);
        const next = input.version + 1;
        if (next > 6) throw new StudioError('REVISION_LIMIT', 409);
        this.db
          .prepare(
            "UPDATE requests SET status='preparing', current_version=?, approved_version=NULL WHERE id=?",
          )
          .run(next, id);
        this.db
          .prepare(
            'INSERT INTO versions(request_id,version,snapshot) VALUES(?,?,?)',
          )
          .run(id, next, v.snapshot);
        this.db
          .prepare(
            "INSERT INTO jobs(request_id,version,kind,available) VALUES(?,?,'revise',?)",
          )
          .run(id, next, Date.now());
      }
    })();
    return this.details(user, id, true);
  }
  async remove(user: Identity, id: string) {
    this.verified(user);
    const r = this.row(id);
    if (r.owner !== user.id) throw new StudioError('NOT_FOUND', 404);
    await this.erase(id);
  }
  private async erase(id: string) {
    if (!/^[a-f0-9-]{36}$/.test(id)) throw new StudioError('INVALID_ID');
    this.db.prepare("UPDATE requests SET status='deleted' WHERE id=?").run(id);
    this.db
      .prepare(
        "UPDATE outbox SET state='cancelled' WHERE request_id=? AND state!='accepted'",
      )
      .run(id);
    this.db
      .prepare("UPDATE jobs SET state='cancelled' WHERE request_id=?")
      .run(id);
    await fs.rm(path.join(this.config.directory, 'packs', id), {
      recursive: true,
      force: true,
    });
    this.db.prepare('DELETE FROM requests WHERE id=?').run(id);
  }
  async cleanup() {
    const rows = this.db
      .prepare("SELECT id FROM requests WHERE expires<=? OR status='deleted'")
      .all(Date.now()) as { id: string }[];
    for (const row of rows) await this.erase(row.id);
    this.db.prepare('DELETE FROM limits WHERE expires < ?').run(Date.now());
    this.db
      .prepare('DELETE FROM verification WHERE expiresAt < ?')
      .run(Date.now());
    this.db.prepare('DELETE FROM session WHERE expiresAt < ?').run(Date.now());
    // Accounts with no active requests expire after 90 days too. Re-verification creates a new account.
    this.db
      .prepare(
        'DELETE FROM user WHERE updatedAt < ? AND id NOT IN (SELECT owner FROM requests)',
      )
      .run(Date.now() - retentionMs);
  }
  recover() {
    this.db
      .prepare(
        "UPDATE jobs SET state='queued', lease=NULL WHERE state='running'",
      )
      .run();
    this.db
      .prepare(
        "UPDATE outbox SET state=CASE WHEN first_attempt<? THEN 'uncertain' ELSE 'queued' END WHERE state='sending'",
      )
      .run(Date.now() - 23 * 3600000);
  }
  async tick() {
    if (this.ticking) return;
    this.ticking = true;
    try {
      await this.cleanup();
      await this.prepareNext();
      await this.deliverNext();
    } finally {
      this.ticking = false;
    }
  }
  private async prepareNext() {
    const job = this.db
      .prepare(
        "SELECT * FROM jobs WHERE state='queued' AND available<=? ORDER BY id LIMIT 1",
      )
      .get(Date.now()) as
      | {
          id: number;
          request_id: string;
          version: number;
          kind: string;
          attempts: number;
        }
      | undefined;
    if (!job) return;
    this.db
      .prepare(
        "UPDATE jobs SET state='running', attempts=attempts+1, lease=? WHERE id=?",
      )
      .run(Date.now(), job.id);
    try {
      const r = this.row(job.request_id);
      if (r.current_version !== job.version || r.status !== 'preparing')
        throw new StudioError('STALE_JOB');
      const v = this.version(r.id, job.version);
      let snapshot = JSON.parse(v.snapshot) as RecipeSnapshot;
      if (job.kind === 'revise' && v.state === 'queued') {
        const note = this.db
          .prepare(
            "SELECT notes FROM reviews WHERE request_id=? AND version=? AND decision='revise' ORDER BY id DESC LIMIT 1",
          )
          .get(r.id, job.version - 1) as { notes: string };
        const result = await this.lane.use(() =>
          this.inference.turn({
            intent: 'revise',
            message: note.notes,
            brief: snapshot.brief,
            confirmed: true,
            recipe: snapshot.recipe,
            history: [],
            context: { harness: '', feature: '', scenario: '' },
          }),
        );
        if (!result.turn.recipe)
          throw new StudioError('INVALID_MODEL_RESPONSE');
        snapshot = {
          recipe: validateRecipe(result.turn.recipe),
          brief: snapshot.brief,
          provenance: result.provenance,
        };
        this.db
          .prepare(
            "UPDATE versions SET snapshot=?,state='rendering' WHERE request_id=? AND version=?",
          )
          .run(JSON.stringify(snapshot), r.id, job.version);
      }
      validateRecipe(snapshot.recipe);
      const manifest = await prepareDocuments(
        this.config.directory,
        r.id,
        job.version,
        snapshot,
        JSON.parse(r.profile) as RequestProfile,
      );
      this.db.transaction(() => {
        const latest = this.row(r.id);
        if (
          latest.current_version !== job.version ||
          latest.status !== 'preparing'
        )
          throw new StudioError('STALE_JOB');
        this.db
          .prepare(
            "UPDATE versions SET manifest=?,hash=?,state='prepared' WHERE request_id=? AND version=?",
          )
          .run(
            JSON.stringify(manifest),
            manifest.snapshotHash,
            r.id,
            job.version,
          );
        this.db
          .prepare("UPDATE requests SET status='review' WHERE id=?")
          .run(r.id);
        this.db
          .prepare(
            "UPDATE jobs SET state='done', lease=NULL,error=NULL WHERE id=?",
          )
          .run(job.id);
        this.db
          .prepare(
            "INSERT OR IGNORE INTO outbox(request_id,version,kind,available) VALUES(?,?,'review',?)",
          )
          .run(r.id, job.version, Date.now());
      })();
    } catch (e) {
      const code = e instanceof StudioError ? e.code : 'PREPARATION_FAILED';
      const deferred = code === 'ASSISTANT_UNAVAILABLE';
      this.db
        .prepare(
          'UPDATE jobs SET state=?,available=?,lease=NULL,error=? WHERE id=?',
        )
        .run(
          deferred || job.attempts < 2 ? 'queued' : 'failed',
          Date.now() + (deferred ? 60_000 : 15_000),
          code,
          job.id,
        );
      if (!deferred && job.attempts >= 2)
        this.db
          .prepare(
            "UPDATE requests SET status='preparation_failed' WHERE id=? AND status='preparing'",
          )
          .run(job.request_id);
      if (
        !this.db
          .prepare('SELECT id FROM requests WHERE id=?')
          .get(job.request_id)
      )
        await fs.rm(path.join(this.config.directory, 'packs', job.request_id), {
          recursive: true,
          force: true,
        });
    }
  }
  private async deliverNext() {
    if (!this.mailer.available()) return;
    const item = this.db
      .prepare(
        "SELECT * FROM outbox WHERE state IN ('queued','deferred') AND available<=? ORDER BY id LIMIT 1",
      )
      .get(Date.now()) as
      | {
          id: number;
          request_id: string;
          version: number;
          kind: string;
          attempts: number;
          first_attempt: number | null;
          mode: string | null;
        }
      | undefined;
    if (!item) return;
    try {
      const r = this.row(item.request_id);
      if (
        item.kind === 'delivery'
          ? r.status !== 'approved' || r.approved_version !== item.version
          : r.status !== 'review' || r.current_version !== item.version
      ) {
        this.db
          .prepare("UPDATE outbox SET state='cancelled' WHERE id=?")
          .run(item.id);
        return;
      }
      if (
        item.first_attempt &&
        Date.now() - item.first_attempt >= 23 * 3600000
      ) {
        this.db
          .prepare("UPDATE outbox SET state='uncertain' WHERE id=?")
          .run(item.id);
        return;
      }
      const manifest = JSON.parse(
        this.version(r.id, item.version).manifest!,
      ) as Manifest;
      const files = await Promise.all(
        manifest.artifacts.map((f) =>
          readArtifact(this.config.directory, r.id, manifest, f.name),
        ),
      );
      const withAttachments =
        item.mode !== 'notification' &&
        files.reduce((n, f) => n + Math.ceil((f.bytes * 4) / 3), 0) <=
          this.config.attachmentLimit;
      const mode = withAttachments ? 'attachments' : 'notification';
      // Recheck immediately before send; all recipients and links are application-owned.
      const latest = this.row(r.id);
      if (
        latest.status !== r.status ||
        latest.current_version !== r.current_version
      )
        throw new StudioError('STALE_JOB');
      this.db
        .prepare(
          "UPDATE outbox SET state='sending',attempts=attempts+1,first_attempt=COALESCE(first_attempt,?),mode=? WHERE id=?",
        )
        .run(Date.now(), mode, item.id);
      const link = `${this.config.websiteOrigin}/journey/${item.kind === 'review' ? 'review' : 'requests'}?request=${r.id}`;
      const providerId = await this.mailer.send(
        {
          to: item.kind === 'review' ? REVIEWER_EMAIL : r.email,
          subject:
            item.kind === 'review'
              ? `Planeon pack v${item.version} is ready for your review`
              : `Your approved Planeon pack v${item.version} is available`,
          text: `${item.kind === 'review' ? 'Inspect this exact prepared version. Opening this link does not approve it; sign in and explicitly confirm your decision.' : 'Your approved engineering proposal is available. Sign in with your verified company email to download the same reviewed files.'}\n\n${link}\n\nRetention ends ${new Date(r.expires).toISOString().slice(0, 10)}. Files are design proposals, not assessed maturity or certification.`,
          ...(withAttachments
            ? {
                attachments: files.map((f) => ({
                  filename: f.name,
                  content: f.data.toString('base64'),
                })),
              }
            : {}),
        },
        `studio-${item.id}-${mode}`,
      );
      this.db
        .prepare(
          "UPDATE outbox SET state='accepted',provider_id=?,error=NULL WHERE id=?",
        )
        .run(providerId, item.id);
    } catch (e) {
      const code = e instanceof StudioError ? e.code : 'MAIL_OUTCOME_UNKNOWN';
      if (code === 'ATTACHMENTS_REJECTED') {
        this.db
          .prepare(
            "UPDATE outbox SET state='queued',mode='notification',first_attempt=NULL,available=?,error=? WHERE id=?",
          )
          .run(Date.now(), code, item.id);
      } else {
        const state =
          code === 'NOT_FOUND'
            ? 'cancelled'
            : code === 'MAIL_QUOTA_DEFERRED' || code === 'MAIL_UNAVAILABLE'
              ? 'deferred'
              : item.attempts >= 3
                ? code === 'MAIL_OUTCOME_UNKNOWN'
                  ? 'uncertain'
                  : 'failed'
                : 'queued';
        this.db
          .prepare('UPDATE outbox SET state=?,available=?,error=? WHERE id=?')
          .run(state, Date.now() + 60_000, code, item.id);
      }
    }
  }
}

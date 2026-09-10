'use client';
/* oxlint-disable next/no-html-link-for-pages -- Preserve native navigation in the Sites runtime. */
import { useCallback, useEffect, useState } from 'react';
import { useUrlState } from '@/lib/url-state';
import {
  studioFetch,
  type StudioSession,
  type PublicRequest,
} from '@/lib/studio/client';
import { StudioAuth } from './StudioAuth';
import type { RecipeSnapshot } from '@/lib/studio/contract';
import { RecipeCanvas } from './RecipeCanvas';

type ReviewRequest = PublicRequest & {
  email: string;
  profile: {
    fullName: string;
    company: string;
    role: string;
    intendedUse: string;
  };
  snapshot: RecipeSnapshot;
  history: {
    version: number;
    decision: string;
    notes: string;
    created: number;
  }[];
};
const statusNames: Record<string, string> = {
  preparing: 'Preparing privately',
  review: 'Awaiting Caglar’s review',
  approved: 'Approved · downloads available',
  rejected: 'Not approved',
  preparation_failed: 'Preparation needs attention',
};
export function StudioRequests({ reviewer = false }: { reviewer?: boolean }) {
  const { params, update } = useUrlState();
  const requestedId = params.get('request');
  const [session, setSession] = useState<StudioSession>({ user: null });
  const [checked, setChecked] = useState(false);
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const refresh = useCallback(async () => {
    setBusy(true);
    setMessage('');
    try {
      const current = await studioFetch<StudioSession>('/session');
      setSession(current);
      if (current.user) {
        const result = await studioFetch<{ requests: ReviewRequest[] }>(
          reviewer ? '/review' : '/requests',
        );
        if (
          requestedId &&
          /^[a-f0-9-]{36}$/.test(requestedId) &&
          !result.requests.some((r) => r.id === requestedId)
        ) {
          const requested = await studioFetch<ReviewRequest>(
            `/${reviewer ? 'review' : 'requests'}/${requestedId}`,
          );
          result.requests.push(requested);
        }
        setRequests(result.requests);
      }
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : 'The local service is unavailable.',
      );
    } finally {
      setChecked(true);
      setBusy(false);
    }
  }, [reviewer, requestedId]);
  useEffect(() => {
    const timer = setTimeout(() => {
      void refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);
  const selected = requests.find((r) => r.id === params.get('request')) || null;
  async function remove(id: string) {
    setBusy(true);
    try {
      await studioFetch(`/requests/${id}`, { confirm: true }, 'DELETE');
      setDeleteId('');
      update({ request: null });
      await refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Deletion failed.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="section-shell studio-account">
      <div className="studio-account-heading">
        <div>
          <span className="eyebrow">Journey Studio / Private</span>
          <h1>{reviewer ? 'Review prepared packs.' : 'My requests.'}</h1>
        </div>
        <a href="/journey?mode=design">Back to Journey Studio →</a>
      </div>
      <p>
        {reviewer
          ? 'Inspect the exact documents, then explicitly confirm a decision. Email links and page visits never approve a pack.'
          : 'Follow preparation and review here. Approved packs are downloadable even if their email notification fails.'}
      </p>
      <p className="studio-fine">
        This area uses Planeon’s laptop-backed service. Downloads and review are
        unavailable while it is offline. Files expire 90 days after submission.
      </p>
      {message && (
        <p role="alert" className="studio-notice">
          {message}
        </p>
      )}
      {!checked ? (
        <output>Checking your session…</output>
      ) : !session.user ? (
        <StudioAuth
          onVerified={(s) => {
            setSession(s);
            void refresh();
          }}
        />
      ) : (
        <>
          <div className="studio-actions">
            <span>Signed in: {session.user.email}</span>
            <button
              disabled={busy}
              onClick={() => {
                void refresh();
              }}
            >
              Refresh status
            </button>
            <button
              onClick={async () => {
                try {
                  await studioFetch('/auth/sign-out', {});
                  setSession({ user: null });
                  setRequests([]);
                } catch {
                  setMessage(
                    'Sign-out could not be confirmed while the local service is unavailable. Close this page and retry when it returns.',
                  );
                }
              }}
            >
              Sign out
            </button>
            {session.user.reviewer && (
              <a href={reviewer ? '/journey/requests' : '/journey/review'}>
                {reviewer ? 'My requests' : 'Review queue'} →
              </a>
            )}
          </div>
          {!requests.length && (
            <p>
              No{' '}
              {reviewer
                ? 'prepared requests in this review queue'
                : 'requests yet'}
              .{' '}
              {reviewer
                ? 'New verified requests appear after submission.'
                : 'Apply a proposal in Journey Studio, then request an engineering pack.'}
            </p>
          )}
          <div className="studio-request-layout">
            <nav aria-label="Private requests">
              {requests.map((r) => (
                <button
                  key={r.id}
                  aria-current={selected?.id === r.id ? 'true' : undefined}
                  onClick={() => {
                    update({ request: r.id });
                    setDeleteId('');
                  }}
                >
                  <strong>{r.title}</strong>
                  <span>{statusNames[r.status] || r.status}</span>
                  <span className="studio-fine">
                    Submitted {new Date(r.submitted).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </nav>
            {selected ? (
              <article key={`${selected.id}:${selected.version}`}>
                <h2>{selected.title}</h2>
                <p>
                  <strong>
                    {statusNames[selected.status] || selected.status}
                  </strong>
                </p>
                <p>
                  Retention ends{' '}
                  {new Date(selected.expires).toLocaleDateString()}.
                </p>
                {selected.manifest &&
                  (reviewer || selected.status === 'approved') && (
                    <section className="studio-downloads">
                      <h3>
                        {reviewer
                          ? 'Exact prepared files'
                          : `Approved version ${selected.version}`}
                      </h3>
                      <ul>
                        {selected.manifest.artifacts.map((f) => (
                          <li key={f.name}>
                            <a
                              href={`/api/studio/${reviewer ? 'review' : 'requests'}/${selected.id}/files?version=${selected.version}&name=${encodeURIComponent(f.name)}`}
                            >
                              {f.name} ↓
                            </a>
                            <span className="studio-fine">
                              {Math.ceil(f.bytes / 1024)} KB
                            </span>
                            <details>
                              <summary>Integrity checksum</summary>
                              <code>{f.sha256}</code>
                            </details>
                          </li>
                        ))}
                      </ul>
                      <p className="studio-fine">
                        These links check account ownership and approval on
                        every download. Forwarding a link gives another person
                        no access.
                      </p>
                    </section>
                  )}
                {selected.delivery && (
                  <p className="studio-fine">
                    Email notification:{' '}
                    {selected.delivery.state === 'accepted'
                      ? 'accepted by the email provider (not an inbox receipt confirmation)'
                      : selected.delivery.state === 'queued' ||
                          selected.delivery.state === 'deferred'
                        ? 'pending; approved downloads remain available'
                        : `${selected.delivery.state}; approved downloads remain available`}
                    .
                  </p>
                )}
                {reviewer ? (
                  <ReviewDecision request={selected} onDone={refresh} />
                ) : (
                  <div className="studio-delete">
                    <button onClick={() => setDeleteId(selected.id)}>
                      Delete this request and local files
                    </button>
                    {deleteId === selected.id && (
                      <div>
                        <p>
                          This permanently deletes the local request and files.
                          Copies already emailed cannot be removed.
                        </p>
                        <button
                          disabled={busy}
                          onClick={() => {
                            void remove(selected.id);
                          }}
                        >
                          Confirm permanent deletion
                        </button>
                        <button onClick={() => setDeleteId('')}>
                          Keep request
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            ) : requests.length ? (
              <p>
                Select a request to inspect its status. Nothing changes
                automatically while you read.
              </p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
function ReviewDecision({
  request: r,
  onDone,
}: {
  request: ReviewRequest;
  onDone: () => Promise<void>;
}) {
  const [decision, setDecision] = useState('approve');
  const [notes, setNotes] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await studioFetch(`/review/${r.id}/decision`, {
        version: r.version,
        hash: r.manifest!.snapshotHash,
        decision,
        notes,
        confirm,
      });
      await onDone();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Review unavailable.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <h3>Request context</h3>
      <p>
        {r.profile.fullName} · {r.profile.role} · {r.profile.company}
      </p>
      <p>{r.email}</p>
      <p>{r.profile.intendedUse}</p>
      <p>Confirmed brief: {r.snapshot.brief.workflow}</p>
      <details>
        <summary>Inspect the recipe canvas</summary>
        <RecipeCanvas recipe={r.snapshot.recipe} />
      </details>
      {r.status === 'review' && r.manifest && (
        <form className="studio-form" onSubmit={submit}>
          <h3>Decision for version {r.version}</h3>
          <label>
            Decision
            <select
              value={decision}
              onChange={(e) => {
                setDecision(e.target.value);
                setConfirm(false);
              }}
            >
              <option value="approve">Approve this exact version</option>
              <option value="revise">Request a revision</option>
              <option value="reject">Reject this request</option>
            </select>
          </label>
          <label>
            Internal review notes
            <textarea
              rows={4}
              value={notes}
              maxLength={2000}
              minLength={decision === 'revise' ? 10 : undefined}
              required={decision === 'revise'}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <p className="studio-fine">
            Notes are private to the reviewer. Revision notes guide the next
            proposal; do not include secrets.
          </p>
          <label className="studio-check">
            <input
              type="checkbox"
              required
              checked={confirm}
              onChange={(e) => setConfirm(e.target.checked)}
            />
            <span>
              I inspected version {r.version} and its files, and confirm this
              decision for the displayed snapshot.
            </span>
          </label>
          <button disabled={!confirm || busy} className="studio-primary">
            {busy ? 'Recording decision…' : 'Confirm decision'}
          </button>
          {message && <p role="alert">{message}</p>}
        </form>
      )}
      <details>
        <summary>Internal review history</summary>
        {r.history.map((h, i) => (
          <p key={i}>
            Version {h.version} · {h.decision} ·{' '}
            {new Date(h.created).toLocaleString()}
            <br />
            {h.notes || 'No notes'}
          </p>
        ))}
      </details>
    </section>
  );
}

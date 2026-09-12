'use client';
/* oxlint-disable next/no-html-link-for-pages -- Preserve native navigation in the Sites runtime. */
import { useEffect, useState } from 'react';
import type { SignedRecipe } from '@/lib/studio/account';
import { studioFetch, type StudioSession } from '@/lib/studio/client';
import { StudioAuth } from './StudioAuth';
import { EngineeringPackGuide } from './EngineeringPackGuide';

export function StudioPackRequest({ signed }: { signed: SignedRecipe }) {
  const [session, setSession] = useState<StudioSession>({ user: null });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [id, setId] = useState('');
  const [key] = useState(() => crypto.randomUUID());
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    void studioFetch<StudioSession>('/session')
      .then(setSession)
      .catch(() =>
        setMessage(
          'Account access is unavailable while the local service is offline. Your selected draft stays in this tab.',
        ),
      )
      .finally(() => setChecking(false));
    void studioFetch<{ email: boolean }>('/health')
      .then((health) => setEmailAvailable(health.email))
      .catch(() => setEmailAvailable(false));
  }, []);
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setMessage('');
    try {
      const read = (key: string) => {
        const value = form.get(key);
        return typeof value === 'string' ? value : '';
      };
      const result = await studioFetch<{ id: string }>('/requests', {
        ...signed,
        idempotencyKey: key,
        profile: {
          fullName: read('fullName'),
          company: read('company'),
          role: read('role'),
          intendedUse: read('intendedUse'),
          consent: form.get('consent') === 'on',
          confirmed: form.get('confirmed') === 'on',
        },
      });
      setId(result.id);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Request unavailable.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="studio-pack" id="engineering-pack">
      <EngineeringPackGuide />
      {id ? (
        <output>
          Request accepted for private preparation.{' '}
          <a
            href={`/journey/requests?request=${id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open My requests (new tab) ↗
          </a>
        </output>
      ) : checking ? (
        <output>Checking verified account access…</output>
      ) : !session.user ? (
        <>
          {emailAvailable === false && (
            <output className="studio-notice">
              Verification email is currently unavailable. New requests and
              sign-in need an inbox code; downloads cannot be unlocked without
              verification. Try again when the service is available, or{' '}
              <a href="/contact" target="_blank" rel="noopener noreferrer">
                contact Planeon (new tab)
              </a>
              .
            </output>
          )}
          {message && <output>{message}</output>}
          <StudioAuth onVerified={setSession} />
        </>
      ) : (
        <form className="studio-form" onSubmit={submit} aria-busy={busy}>
          <p>
            Verified inbox: <strong>{session.user.email}</strong>
          </p>
          <div className="studio-field-grid">
            <label>
              Full name
              <input
                name="fullName"
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
              />
            </label>
            <label>
              Company name
              <input
                name="company"
                required
                minLength={2}
                maxLength={160}
                autoComplete="organization"
              />
            </label>
            <label>
              Role or job title
              <input
                name="role"
                required
                minLength={2}
                maxLength={120}
                autoComplete="organization-title"
              />
            </label>
          </div>
          <label>
            How will you use this pack?
            <textarea
              name="intendedUse"
              required
              minLength={10}
              maxLength={2000}
              rows={3}
            />
          </label>
          <label className="studio-check">
            <input type="checkbox" name="confirmed" required />
            <span>
              I have reviewed this workflow brief and the applied proposal,
              including its assumptions and missing information.
            </span>
          </label>
          <label className="studio-check">
            <input type="checkbox" name="consent" required />
            <span>
              I consent to Planeon processing this information to prepare,
              review and deliver my requested pack.{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                Privacy and retention (new tab)
              </a>
              .
            </span>
          </label>
          <p className="studio-fine">
            Company and role are self-reported. Requests and local files expire
            90 days after submission; earlier deletion is available. Email
            copies cannot be recalled. No marketing subscription is included.
          </p>
          <button className="studio-primary" disabled={busy}>
            {busy ? 'Submitting…' : 'Request private engineering pack'}
          </button>
          {message && <p role="alert">{message}</p>}
        </form>
      )}
    </section>
  );
}

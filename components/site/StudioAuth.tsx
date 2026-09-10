'use client';
/* oxlint-disable next/no-html-link-for-pages -- Preserve native navigation in the Sites runtime. */
import { useState } from 'react';
import { companyEmail } from '@/lib/studio/account';
import { studioFetch, type StudioSession } from '@/lib/studio/client';

export function StudioAuth({
  onVerified,
}: {
  onVerified: (session: StudioSession) => void;
}) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function act(verify: boolean) {
    setBusy(true);
    setMessage('');
    try {
      const normalized = companyEmail(email);
      if (verify) {
        await studioFetch('/auth/sign-in/email-otp', {
          email: normalized,
          otp: code,
        });
        const session = await studioFetch<StudioSession>('/session');
        if (!session.user)
          throw new Error('Mailbox verification has not completed.');
        onVerified(session);
      } else {
        await studioFetch('/auth/email-otp/send-verification-otp', {
          email: normalized,
          type: 'sign-in',
        });
        setSent(true);
        setCode('');
        setMessage(
          'Check the declared inbox. Enter the newest code within five minutes.',
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Verification is unavailable.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      className="studio-form"
      onSubmit={(event) => {
        event.preventDefault();
        void act(sent);
      }}
      aria-busy={busy}
    >
      <h3>Verify your company email</h3>
      <p>
        Public drafting needs no sign-in. Private requests and downloads require
        a code from your company inbox.
      </p>
      <label>
        Company email
        <input
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setSent(false);
            setMessage('');
          }}
        />
      </label>
      {sent && (
        <label>
          Six-digit email code
          <input
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]{6}"
            required
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </label>
      )}
      <div className="studio-actions">
        <button className="studio-primary" disabled={busy}>
          {busy
            ? 'Please wait…'
            : sent
              ? 'Verify and sign in'
              : 'Send verification code'}
        </button>
        {sent && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              void act(false);
            }}
          >
            Send a new code
          </button>
        )}
      </div>
      {message && <output>{message}</output>}
      <p className="studio-fine">
        Verification establishes mailbox access—not company legitimacy or
        authority. Personal or disposable address?{' '}
        <a href="/contact">Contact Planeon for a legitimate exception.</a>
      </p>
    </form>
  );
}

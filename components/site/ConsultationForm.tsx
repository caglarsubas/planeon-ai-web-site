'use client';
/* oxlint-disable next/no-html-link-for-pages -- Preserve native navigation in the Sites runtime. */
import { useState } from 'react';
import { Surface, ActionLabel } from './VisualPrimitives';
import { useUrlState } from '@/lib/url-state';
import { reviewedContext, appendReviewedContext } from '@/lib/consultation-context';
import { enquiryCategories } from '@/lib/consultation';

export function ConsultationForm({ currentReading = 'The self-assessment has not been completed yet.' }: { currentReading?: string }) {
  const { params } = useUrlState();
  const context = reviewedContext(params);
  const [brief, setBrief] = useState('');
  const [contextMessage, setContextMessage] = useState('');
  const [requestState, setRequestState] = useState<
    'idle' | 'sending' | 'sent' | 'error'
  >('idle');
  const [requestMessage, setRequestMessage] = useState('');
  const [formStartedAt] = useState(() => Date.now());

  const submitConsultancyRequest = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const readField = (key: string, fallback = '') => {
      const value = form.get(key);
      return typeof value === 'string' ? value : fallback;
    };
    const service = readField('service', 'Workflow consultation');
    const name = readField('name');
    const email = readField('email');
    const organisation = readField('organisation');
    const timeframe = readField('timeframe', 'Exploring options');
    const brief = readField('brief');
    setRequestState('sending');
    setRequestMessage('Sending your request securely…');

    try {
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service,
          name,
          email,
          organisation,
          timeframe,
          brief,
          currentReading,
          companyWebsite: readField('company_website'),
          startedAt: formStartedAt,
          consent: form.get('consent') === 'on',
        }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };
      if (!response.ok || !result.ok)
        throw new Error(result.message || 'The request could not be sent.');

      setRequestState('sent');
      setRequestMessage(
        'Request sent. Planeon will review your context and respond by email.',
      );
      formElement.reset();
      setBrief('');
    } catch (error) {
      setRequestState('error');
      setRequestMessage(
        error instanceof Error
          ? error.message
          : 'The request could not be sent. Please try again.',
      );
    }
  };

  return (
          <Surface className="consultation-form-surface">
            <form
              className="professional-request-form"
              onSubmit={submitConsultancyRequest}
              aria-busy={requestState === 'sending'}
            >
              <fieldset>
                <legend>What do you need?</legend>
                <div className="request-service-options">
                  {enquiryCategories.map(({ value, label }, index) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name="service"
                        value={value}
                        defaultChecked={index === 0}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="request-field-grid">
                <label>
                  Name
                  <input name="name" autoComplete="name" required />
                </label>
                <label>
                  Work email
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  Organisation
                  <input
                    name="organisation"
                    autoComplete="organization"
                    required
                  />
                </label>
                <label>
                  Preferred timeframe (optional)
                  <select name="timeframe" defaultValue="Exploring options">
                    <option>Within 30 days</option>
                    <option>This quarter</option>
                    <option>Next quarter</option>
                    <option>Exploring options</option>
                  </select>
                </label>
              </div>
              {context.length > 0 && (
                <section className="consultation-context">
                  <h3>Review your selected context</h3>
                  <p>
                    Only add this if it belongs in your request. It is not sent
                    until you submit.
                  </p>
                  <ul>
                    {context.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <button
                    className="outline-button"
                    type="button"
                    onClick={() => {
                      const next = appendReviewedContext(brief, context);
                      if (next === null)
                        setContextMessage(
                          'Please shorten the brief before adding this context; the limit is 1,200 characters.',
                        );
                      else {
                        setBrief(next);
                        setContextMessage(
                          'Added to the editable brief below. Review before sending.',
                        );
                      }
                    }}
                  >
                    Add reviewed context to brief
                  </button>
                  <output>{contextMessage}</output>
                </section>
              )}
              <label className="request-brief">
                Workflow and objective
                <textarea
                  name="brief"
                  rows={5}
                  maxLength={1200}
                  value={brief}
                  onChange={(event) => setBrief(event.target.value)}
                  required
                  placeholder="What outcome matters, which systems are involved, and what is getting in the way?"
                />
              </label>
              <label className="request-trap" aria-hidden="true">
                Company website
                <input
                  name="company_website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
              <label className="request-consent">
                <input name="consent" type="checkbox" required />
                <span>
                  I agree that Planeon may use these details to respond to this
                  consultation request.
                </span>
              </label>
              <div className="request-submit-row">
                <button
                  className="button-primary"
                  type="submit"
                  aria-describedby="request-privacy"
                  disabled={
                    requestState === 'sending' || requestState === 'sent'
                  }
                >
                  <ActionLabel>
                    {requestState === 'sending'
                      ? 'Sending request…'
                      : requestState === 'sent'
                        ? 'Request sent'
                        : 'Send consultation request'}
                  </ActionLabel>
                </button>
                <p id="request-privacy">
                  Your details are sent securely to Planeon only when you submit
                  this form. No questionnaire is required. Read our <a href="/privacy">privacy notice</a>.
                </p>
              </div>
              <output
                className={`request-status request-status-${requestState}`}
                aria-live="polite"
              >
                {requestMessage}
              </output>
            </form>
          </Surface>
  );
}

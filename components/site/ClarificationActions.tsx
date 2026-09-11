import React from 'react';
import type { clarificationSubmission } from '../../lib/studio/clarification';

export function ClarificationActions({
  submission,
  busy,
  sending,
  onSend,
  position,
  error,
}: {
  submission: ReturnType<typeof clarificationSubmission>;
  busy: boolean;
  sending: boolean;
  onSend: () => void;
  position: 'top' | 'bottom';
  error?: string;
}) {
  const helpId = `studio-send-help-${position}`;
  return (
    <div className={`studio-answer-actions studio-answer-actions-${position}`}>
      <div className="studio-actions">
        <button
          type="button"
          className="studio-primary"
          disabled={busy || !submission.canSend}
          aria-describedby={helpId}
          onClick={onSend}
        >
          {sending ? 'Sending answers…' : submission.label}
        </button>
        <span className="studio-fine">
          {submission.addressed} of {submission.total} addressed
        </span>
        {submission.sent && submission.complete && submission.ready && (
          <a href="#studio-brief-heading">Continue to brief →</a>
        )}
      </div>
      <p
        id={helpId}
        className="studio-fine"
        role={position === 'top' ? (error ? 'alert' : 'status') : undefined}
      >
        {error ||
          (sending
            ? 'The assistant is reviewing all your matched answers and checking for remaining gaps…'
            : submission.help)}
      </p>
    </div>
  );
}

import React from 'react';
import type { Clarification } from '../../lib/studio/contract';
import { clarificationLabels } from '../../lib/studio/clarification';

export function ClarificationQuestions({
  questions,
  onChange,
  id = 'studio-questions',
}: {
  questions: Clarification[];
  onChange: (questions: Clarification[]) => void;
  id?: string;
}) {
  const update = (id: string, patch: Partial<Clarification>) =>
    onChange(questions.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  return (
    <div className="studio-questions" id={id}>
      <p className="studio-fine">
        One answer per question. These pairs stay in your brief even after older
        chat turns are removed. You can edit them at any time before requesting
        a new proposal.
      </p>
      {questions.map((q) => (
        <fieldset key={q.id} className="studio-question">
          <legend>
            <span className="studio-question-number">{q.id.slice(1)}.</span>{' '}
            {q.question}
          </legend>
          <label htmlFor={`studio-${q.id}-answer`}>
            Your answer to question {q.id.slice(1)}
          </label>
          <textarea
            id={`studio-${q.id}-answer`}
            rows={3}
            maxLength={1200}
            aria-describedby={`studio-${q.id}-status`}
            aria-invalid={
              q.status === 'assumption' && !q.answer.trim() ? true : undefined
            }
            placeholder={
              q.status === 'deferred'
                ? 'Optional: what still needs to be decided?'
                : 'Answer this question here…'
            }
            value={q.answer}
            onChange={(event) => {
              const answer = event.target.value;
              update(q.id, {
                answer,
                status:
                  q.status === 'deferred' || q.status === 'assumption'
                    ? q.status
                    : answer.trim()
                      ? 'answered'
                      : 'unanswered',
              });
            }}
          />
          <div className="studio-answer-meta">
            <label htmlFor={`studio-${q.id}-kind`}>
              Treat this as
              <select
                id={`studio-${q.id}-kind`}
                value={q.status === 'unanswered' ? 'answered' : q.status}
                onChange={(event) => {
                  const status = event.target.value as Clarification['status'];
                  update(q.id, {
                    status:
                      status === 'answered' && !q.answer.trim()
                        ? 'unanswered'
                        : status,
                  });
                }}
              >
                <option value="answered">My answer</option>
                <option value="assumption">An assumption to validate</option>
                <option value="deferred">Not decided yet</option>
              </select>
            </label>
            <span id={`studio-${q.id}-status`} className="studio-fine">
              {q.status === 'assumption' && !q.answer.trim()
                ? 'Add your assumption or choose “Not decided yet”'
                : clarificationLabels[q.status]}{' '}
              · {q.answer.length}/1200
            </span>
          </div>
        </fieldset>
      ))}
    </div>
  );
}

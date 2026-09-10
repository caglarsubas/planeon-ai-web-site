import { randomUUID } from 'node:crypto';
import type { StudioConfig } from './config';
import type { Store } from './store';
import { StudioError } from './security';

export type Mail = {
  to: string;
  subject: string;
  text: string;
  attachments?: { filename: string; content: string }[];
};
export interface Mailer {
  available(): boolean;
  send(mail: Mail, key: string): Promise<string>;
}
export function resendMailer(
  config: StudioConfig,
  db: Store,
  transport: typeof fetch = fetch,
): Mailer {
  const available = () =>
    config.mailEnabled &&
    Boolean(config.mailKey) &&
    config.mailBudgetDay === new Date().toISOString().slice(0, 10) &&
    config.mailDailyBudget > 0 &&
    config.mailMonthlyBudget > 0;
  return {
    available,
    async send(mail, key) {
      if (!available())
        throw new StudioError(
          'MAIL_UNAVAILABLE',
          503,
          'Email verification and delivery are temporarily unavailable.',
        );
      const day = new Date().toISOString().slice(0, 10);
      const month = day.slice(0, 7);
      // Reserved operator-approved allocation, with no chargeable overrun. Failed attempts consume budget conservatively.
      db.transaction(() => {
        const daily = db
          .prepare('SELECT count(*) AS n FROM mail_budget WHERE day=?')
          .get(day) as { n: number };
        const monthly = db
          .prepare('SELECT count(*) AS n FROM mail_budget WHERE month=?')
          .get(month) as { n: number };
        if (
          daily.n >= Math.min(config.mailDailyBudget, 90) ||
          monthly.n >= Math.min(config.mailMonthlyBudget, 2900)
        )
          throw new StudioError(
            'MAIL_QUOTA_DEFERRED',
            503,
            'Email is temporarily deferred to stay within the approved allowance.',
          );
        db.prepare('INSERT INTO mail_budget(id,day,month) VALUES(?,?,?)').run(
          randomUUID(),
          day,
          month,
        );
      })();
      let response: Response;
      try {
        response = await transport('https://api.resend.com/emails', {
          method: 'POST',
          redirect: 'error',
          signal: AbortSignal.timeout(15000),
          headers: {
            Authorization: `Bearer ${config.mailKey}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': key,
          },
          body: JSON.stringify({ from: config.mailFrom, ...mail }),
        });
      } catch {
        throw new StudioError('MAIL_OUTCOME_UNKNOWN', 503);
      }
      if (!response.ok) {
        if (
          response.status === 413 ||
          (response.status === 422 && mail.attachments?.length)
        )
          throw new StudioError('ATTACHMENTS_REJECTED', 422);
        if (response.status >= 500)
          throw new StudioError('MAIL_OUTCOME_UNKNOWN', 503);
        throw new StudioError(
          response.status === 429 ? 'MAIL_QUOTA_DEFERRED' : 'MAIL_REJECTED',
          503,
        );
      }
      const result = (await response.json()) as { id?: string };
      if (!result.id) throw new StudioError('MAIL_OUTCOME_UNKNOWN', 503);
      return result.id;
    },
  };
}

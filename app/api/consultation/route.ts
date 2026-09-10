const services = new Set([
  'Professional readiness assessment',
  'Roadmap consultancy',
  'Combined assessment and roadmap',
  'Workflow consultation',
  'Phased implementation',
  'Continuing partnership',
]);

const timeframes = new Set([
  'Within 30 days',
  'This quarter',
  'Next quarter',
  'Exploring options',
]);

const allowedOrigins = new Set([
  'https://planeon.ai',
  'https://www.planeon.ai',
  'https://planeon-blueprint.caglarsubas.chatgpt.site',
  'http://localhost:3001',
]);

type ConsultationPayload = {
  service?: unknown;
  name?: unknown;
  email?: unknown;
  organisation?: unknown;
  timeframe?: unknown;
  brief?: unknown;
  currentReading?: unknown;
  companyWebsite?: unknown;
  startedAt?: unknown;
  consent?: unknown;
};

const clean = (value: unknown, limit: number) =>
  typeof value === 'string' ? value.trim().slice(0, limit) : '';

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] ?? character);

const json = (body: object, status = 200) => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store' },
});

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || !allowedOrigins.has(origin)) {
    return json({ ok: false, message: 'This request origin is not allowed.' }, 403);
  }

  let payload: ConsultationPayload;
  try {
    payload = await request.json() as ConsultationPayload;
  } catch {
    return json({ ok: false, message: 'The request could not be read.' }, 400);
  }

  const companyWebsite = clean(payload.companyWebsite, 200);
  const startedAt = typeof payload.startedAt === 'number' ? payload.startedAt : 0;
  if (companyWebsite || !startedAt || Date.now() - startedAt < 2500) {
    return json({ ok: true });
  }

  const service = clean(payload.service, 80);
  const name = clean(payload.name, 120);
  const email = clean(payload.email, 254).toLowerCase();
  const organisation = clean(payload.organisation, 160);
  const timeframe = clean(payload.timeframe, 80);
  const brief = clean(payload.brief, 1200);
  const currentReading = clean(payload.currentReading, 1800);

  if (
    !services.has(service)
    || !timeframes.has(timeframe)
    || !name
    || !organisation
    || !brief
    || !currentReading
    || payload.consent !== true
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return json({ ok: false, message: 'Please check the required fields and try again.' }, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return json({ ok: false, message: 'Email delivery is temporarily unavailable.' }, 503);
  }

  const text = [
    `Name: ${name}`,
    `Work email: ${email}`,
    `Organisation: ${organisation}`,
    `Requested service: ${service}`,
    `Preferred timeframe: ${timeframe}`,
    '',
    'Current readiness reading:',
    currentReading,
    '',
    'Workflow and objective:',
    brief,
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.CONSULTATION_FROM ?? 'Planeon consultation <consultation@notifications.planeon.ai>',
      to: [process.env.CONSULTATION_TO ?? 'caglar.subasi@planeon.ai'],
      reply_to: email,
      subject: `Planeon consultation request · ${service}`,
      text,
      html: `
        <h1>Planeon consultation request</h1>
        <p><strong>Requested service:</strong> ${escapeHtml(service)}</p>
        <p><strong>Name:</strong> ${escapeHtml(name)}<br>
        <strong>Work email:</strong> ${escapeHtml(email)}<br>
        <strong>Organisation:</strong> ${escapeHtml(organisation)}<br>
        <strong>Preferred timeframe:</strong> ${escapeHtml(timeframe)}</p>
        <h2>Current readiness reading</h2>
        <p>${escapeHtml(currentReading).replace(/\n/g, '<br>')}</p>
        <h2>Workflow and objective</h2>
        <p>${escapeHtml(brief).replace(/\n/g, '<br>')}</p>
      `,
    }),
  });

  if (!response.ok) {
    console.error('Consultation email delivery failed with status', response.status);
    return json({ ok: false, message: 'We could not send your request. Please try again shortly.' }, 502);
  }

  return json({ ok: true });
}

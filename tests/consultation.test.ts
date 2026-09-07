import test from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../app/api/consultation/route';
const valid = () => ({
  service: 'Combined assessment and roadmap',
  name: 'Test Visitor',
  email: 'visitor@example.com',
  organisation: 'Synthetic test',
  timeframe: 'Within 30 days',
  brief: 'Mocked delivery only. <script>alert(1)</script>',
  currentReading: 'Self-reported: not completed.',
  companyWebsite: '',
  startedAt: Date.now() - 5000,
  consent: true,
});
const request = (body: unknown, origin = 'http://localhost:3001') =>
  new Request('http://localhost:3001/api/consultation', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
void test('consultation regression: all delivery is mocked; ownership, consent and validation preserved', async () => {
  const previous = globalThis.fetch;
  let calls = 0;
  let sent: Record<string, unknown> = {};
  globalThis.fetch = async (url, init) => {
    calls++;
    assert.equal(url, 'https://api.resend.com/emails');
    sent = JSON.parse(typeof init?.body === 'string' ? init.body : '{}');
    return Response.json({ id: 'mock-only' });
  };
  try {
    assert.equal(
      (await POST(request(valid(), 'https://invalid.example'))).status,
      403,
    );
    assert.equal(
      (await POST(request({ ...valid(), consent: false }))).status,
      400,
    );
    assert.equal(
      (await POST(request({ ...valid(), email: 'invalid' }))).status,
      400,
    );
    assert.equal(
      (await POST(request({ ...valid(), service: 'Invalid' }))).status,
      400,
    );
    assert.equal(
      (await POST(request({ ...valid(), companyWebsite: 'bot' }))).status,
      200,
    );
    assert.equal(
      (await POST(request({ ...valid(), startedAt: Date.now() }))).status,
      200,
    );
    assert.equal(calls, 0);
    assert.equal((await POST(request(valid()))).status, 200);
    assert.equal(calls, 1);
    assert.deepEqual(sent.to, ['caglar.subasi@planeon.ai']);
    assert.ok(String(sent.from).includes('@notifications.planeon.ai'));
    assert.equal(sent.reply_to, 'visitor@example.com');
    assert.ok(String(sent.html).includes('&lt;script&gt;'));
    assert.ok(!String(sent.html).includes('<script>'));
    globalThis.fetch = async () =>
      Response.json({ error: 'mock failure' }, { status: 500 });
    assert.equal((await POST(request(valid()))).status, 502);
    const key = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;
    assert.equal((await POST(request(valid()))).status, 503);
    process.env.RESEND_API_KEY = key;
  } finally {
    globalThis.fetch = previous;
  }
});

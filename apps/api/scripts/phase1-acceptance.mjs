#!/usr/bin/env node

/**
 * Phase 1 kernel acceptance runner.
 *
 * Prerequisites:
 *   1. MongoDB running (MONGODB_URI)
 *   2. npm run seed:metadata --workspace @redios/api
 *   3. API running: npm run start:dev --workspace @redios/api
 *
 * Usage:
 *   npm run acceptance:phase1 --workspace @redios/api
 */

const API_BASE = process.env.REDIOS_API_URL ?? 'http://localhost:3000/api';
const LOGIN_EMAIL = process.env.REDIOS_ACCEPTANCE_EMAIL ?? 'admin@redios.local';
const LOGIN_PASSWORD = process.env.REDIOS_ACCEPTANCE_PASSWORD ?? 'admin123';

const results = [];

function pass(name, detail) {
  results.push({ name, status: 'PASS', detail });
  console.log(`✔ ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, detail) {
  results.push({ name, status: 'FAIL', detail });
  console.error(`✖ ${name}${detail ? ` — ${detail}` : ''}`);
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const text = await response.text();
  let body;

  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = text;
  }

  return { response, body };
}

function assert(condition, name, detail) {
  if (condition) {
    pass(name, detail);
    return true;
  }

  fail(name, detail);
  return false;
}

async function main() {
  console.log(`Phase 1 acceptance against ${API_BASE}\n`);

  let token;

  // CASE 1 — JWT login (no manual runtime headers)
  {
    const { response, body } = await request('/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: LOGIN_EMAIL,
        password: LOGIN_PASSWORD,
        applicationCode: 'ASSET_MAINTENANCE',
      }),
    });

    assert(response.ok, 'CASE 1: POST /auth/login', `status ${response.status}`);
    token = body?.accessToken;
    assert(typeof token === 'string' && token.length > 10, 'CASE 1: access token issued');
    assert(body?.context?.tenantId === 'demo', 'CASE 1: tenant isolation context', `tenantId=${body?.context?.tenantId}`);
  }

  const authHeaders = {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  };

  // CASE 2 — Profile from JWT
  {
    const { response, body } = await request('/auth/me', { headers: authHeaders });
    assert(response.ok, 'CASE 2: GET /auth/me', `status ${response.status}`);
    assert(body?.user?.email === LOGIN_EMAIL, 'CASE 2: profile email matches login');
    assert(body?.context?.applicationCode === 'ASSET_MAINTENANCE', 'CASE 2: runtime context in profile');
  }

  // CASE 3 — Compiled runtime package (metadata compile + cache path)
  {
    const { response, body } = await request('/runtime-package/current', { headers: authHeaders });
    assert(response.ok, 'CASE 3: GET /runtime-package/current', `status ${response.status}`);
    assert(body?.definition?.status === 'ACTIVE', 'CASE 3: active runtime package');
    const workflow = body?.definition?.content?.workflows?.WORK_ORDER;
    assert(Boolean(workflow?.transitionMap?.['OPEN.START']), 'CASE 3: compiled WORK_ORDER transitionMap');
  }

  // CASE 4 — Dynamic object create
  let workOrderId;
  {
    const { response, body } = await request('/runtime/WORK_ORDER/create', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        data: {
          title: `Phase1 Acceptance WO ${Date.now()}`,
          priority: 'HIGH',
          description: 'Automated Phase 1 acceptance test',
        },
      }),
    });

    assert(response.ok, 'CASE 4: POST /runtime/WORK_ORDER/create', `status ${response.status}`);
    workOrderId = body?.document?.id;
    assert(Boolean(workOrderId), 'CASE 4: WORK_ORDER document created', `id=${workOrderId}`);
    assert(body?.document?.status === 'OPEN', 'CASE 4: initial workflow status OPEN', `status=${body?.document?.status}`);
  }

  // CASE 5 — Action + workflow transition (compiled package)
  let actionResult;
  {
    const { response, body } = await request(`/runtime/WORK_ORDER/${workOrderId}/actions/START`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({}),
    });

    assert(response.ok, 'CASE 5: POST /runtime/WORK_ORDER/:id/actions/START', `status ${response.status}`);
    actionResult = body;
    assert(body?.workflow?.transitioned === true, 'CASE 5: workflow transitioned');
    assert(body?.workflow?.from === 'OPEN' && body?.workflow?.to === 'IN_PROGRESS', 'CASE 5: OPEN → IN_PROGRESS');
  }

  // CASE 6 — Event publish + subscribe foundation
  {
    const events = actionResult?.events;
    assert(events?.status === 'EVENT_PUBLISHED', 'CASE 6: event engine published');
    const startedEvent = events?.events?.find((event) => event.eventCode === 'WORK_ORDER_STARTED_EVENT');
    assert(Boolean(startedEvent), 'CASE 6: WORK_ORDER_STARTED_EVENT resolved');
    const executedHandler = startedEvent?.handlers?.some((handler) => handler.status === 'EXECUTED');
    assert(executedHandler, 'CASE 6: at least one event handler executed');
  }

  // CASE 7 — Document persisted with new status
  {
    const { response, body } = await request(`/runtime/WORK_ORDER/${workOrderId}`, { headers: authHeaders });
    assert(response.ok, 'CASE 7: GET /runtime/WORK_ORDER/:id', `status ${response.status}`);
    assert(body?.status === 'IN_PROGRESS', 'CASE 7: document status persisted', `status=${body?.status}`);
  }

  const failed = results.filter((result) => result.status === 'FAIL');

  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);

  if (failed.length > 0) {
    process.exitCode = 1;
    return;
  }

  console.log('\nPhase 1 acceptance: PASS');
}

main().catch((error) => {
  console.error('\nPhase 1 acceptance aborted:', error instanceof Error ? error.message : error);
  console.error('\nEnsure MongoDB, seed, and API are running:');
  console.error('  npm run seed:metadata --workspace @redios/api');
  console.error('  npm run start:dev --workspace @redios/api');
  process.exitCode = 1;
});

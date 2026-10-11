import { createHash } from 'node:crypto';

const PROJECT_HOST = 'uvdkzsbjackpjvpoxtyk.supabase.co';
const PREVIEW_HOST = 'website-launch-engine-bp4kubfrm-strategic-minds-advisory.vercel.app';
const TENANT_ID = '666f23bf-61bd-4be0-b5cb-4872e04fad9b';
const PACKET = 'WLE-SB-RAILWAY-20261011-001';
const WORKER_ID = 'wle-staging-railway-targeted-20261011';
const TYPE = 'WLE_SYNTHETIC_ROOFING_PREVIEW_V1';
const SOURCE_SHA = '56f5cf7a0f6bffbe8e9ecb44ebbd69aece4e9d99';
const EXPECTED_HASH = '3db4e69029722995f4fd01ddd235f3e60520b64a3fc859db3df8978ba8e3c75f';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TARGET = Object.freeze({
  template: 'https://' + PREVIEW_HOST + '/templates/roofing.html',
  artifact: 'https://' + PREVIEW_HOST + '/proof/roofing-canary.html'
});
function assert(c, code) { if (!c) throw Error(code); }
function cleanHtml(html) {
  const i = html.lastIndexOf('</html>');
  assert(i > 0, 'HTML_INVALID');
  return html.slice(0, i + 7);
}
export function buildSyntheticHtml(template) {
  assert(template.includes('PREMIUM WEBSITE DESIGN DEMO · FICTIONAL SAMPLE BRAND'), 'TEMPLATE_LOCK_MISMATCH');
  assert(template.includes('name="robots" content="noindex,nofollow"'), 'NOINDEX_REQUIRED');
  const result = template.replace(
    'PREMIUM WEBSITE DESIGN DEMO · FICTIONAL SAMPLE BRAND',
    'X1 STAGING PREVIEW CANARY · FICTIONAL SAMPLE BRAND · NOT A CUSTOMER SITE'
  ).replace('</body></html>',
    '<!-- WLE X1 SYNTHETIC ONLY; location: Pompano Beach, FL; no real local presence claimed -->' +
    '</body></html>');
  assert(result.includes('NOT A REAL CONTRACTOR') && result.includes('noindex,nofollow'), 'ARTIFACT_POLICY_BLOCKED');
  return result;
}
export function validateClaim(claim, workId) {
  assert(claim?.work_id === workId && claim?.tenant_id === TENANT_ID, 'TENANT_OR_WORK_MISMATCH');
  assert(claim?.work_packet_id === PACKET && claim?.source_sha === SOURCE_SHA, 'SOURCE_LOCK_MISMATCH');
  assert(claim?.action_class === 'NON_PRODUCTION_MUTATION', 'ACTION_NOT_ALLOWED');
  assert(claim?.payload?.kind === TYPE && claim?.payload?.release_mode === 'preview_only' &&
    claim?.payload?.no_customer_data === true && claim?.payload?.uses_external_model === false &&
    claim?.payload?.requires_domain_purchase === false, 'UNSAFE_PAYLOAD');
  assert(claim?.lease?.holderAgentId === WORKER_ID && uuid.test(claim?.lease?.leaseId || ''), 'LEASE_INVALID');
  assert(Date.parse(claim.lease.expiresAt) > Date.now(), 'LEASE_EXPIRED');
  return claim.lease.leaseId;
}
async function fetchLocked(url) {
  assert(Object.values(TARGET).includes(url), 'EGRESS_NOT_ALLOWED');
  const response = await fetch(url, { method: 'GET', redirect: 'error',
    signal: AbortSignal.timeout(12000), headers: { accept: 'text/html' } });
  assert(response.ok, 'UPSTREAM_NOT_READY');
  const text = await response.text();
  assert(text.length < 150000, 'UPSTREAM_TOO_LARGE');
  return cleanHtml(text);
}
async function rpc(name, data, env) {
  assert(['wle_claim_targeted_canary', 'wle_submit_targeted_canary'].includes(name),
    'RPC_NOT_ALLOWED');
  const response = await fetch('https://' + PROJECT_HOST + '/rest/v1/rpc/' + name, {
    method: 'POST', redirect: 'error',
    headers: { apikey: env.SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data), signal: AbortSignal.timeout(15000)
  });
  assert(response.ok, 'RPC_' + name.toUpperCase() + '_FAILED_' + response.status);
  return await response.json();
}
export async function main(env = process.env) {
  assert(env.WLE_STAGING_SUPABASE_URL === 'https://' + PROJECT_HOST,
    'WRONG_SUPABASE_PROJECT');
  assert(typeof env.SUPABASE_PUBLISHABLE_KEY === 'string' &&
    env.SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_'), 'PUBLISHABLE_KEY_REQUIRED');
  assert(typeof env.WLE_ONE_SHOT_CAPABILITY === 'string' &&
    /^[a-f0-9]{64}$/.test(env.WLE_ONE_SHOT_CAPABILITY), 'CAPABILITY_REQUIRED');
  const workId = env.WLE_TARGET_WORK_ID;
  assert(uuid.test(workId || ''), 'WORK_ID_INVALID');
  const claim = await rpc('wle_claim_targeted_canary', {
    p_token: env.WLE_ONE_SHOT_CAPABILITY, p_work_id: workId
  }, env);
  assert(claim, 'NO_PENDING_TARGETED_WORK');
  const leaseId = validateClaim(claim, workId);
  const source = await fetchLocked(TARGET.template);
  const html = buildSyntheticHtml(source);
  const sha256 = createHash('sha256').update(html, 'utf8').digest('hex');
  assert(sha256 === EXPECTED_HASH, 'HASH_LOCK_MISMATCH');
  const live = await fetchLocked(TARGET.artifact);
  assert(live === html, 'PREVIEW_SOURCE_MISMATCH');
  const result = await rpc('wle_submit_targeted_canary', {
    p_token: env.WLE_ONE_SHOT_CAPABILITY, p_work_id: workId,
    p_lease_id: leaseId, p_content_hash: sha256,
    p_byte_length: Buffer.byteLength(html, 'utf8'),
    p_preview_url: TARGET.artifact
  }, env);
  assert(result?.status === 'AWAITING_INDEPENDENT_VALIDATION', 'RESULT_NOT_STORED');
  console.log(JSON.stringify({ event: 'WLE_CANARY_SUBMITTED', workId, packet: PACKET,
    previewUrl: TARGET.artifact, sha256,
    status: result.status, railwayService: env.RAILWAY_SERVICE_ID || 'unknown' }));
  return result;
}
if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  main().catch(e => {
    console.error(JSON.stringify({ event: 'WLE_CANARY_FAILED',
      errorCode: /^[-_A-Z0-9]{3,100}$/.test(e.message) ? e.message : 'UNEXPECTED_FAILURE' }));
    process.exitCode = 1;
  });
}

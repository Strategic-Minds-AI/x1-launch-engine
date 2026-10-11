import { createHash } from 'node:crypto';

// Preview-only helper. This module does not request release approval, retrieve
// credentials, buy domains, process customer data, or run unattended jobs.
export const SCOPE = Object.freeze({
  projectId: 'prj_JbkX4yKWygqBFRhkHL6nbeQXM46f',
  projectName: 'website-launch-engine',
  teamId: 'team_aFdds8lsbHMwe2ip4aQdbQ3d',
  sourceMarker: 'PREMIUM WEBSITE DESIGN DEMO · FICTIONAL SAMPLE BRAND',
  studioDemoUrl: 'https://website-launch-engine.vercel.app/studio.html',
  syntheticMarker: 'NOT A REAL CONTRACTOR',
});

const MISSION_PATTERN = /^WLE-X1-FRESH-PREVIEW-20\d{6}-\d{3}$/;
const SHA_PATTERN = /^[a-f0-9]{40}$/;
const HOST_PATTERN = /^website-launch-engine-[a-z0-9-]+\.vercel\.app$/;
const MAX_HTML_BYTES = 150_000;
function insist(value, code) { if (!value) throw new Error(code); }
export function sha256(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export function buildSyntheticPreview(donor, missionId) {
  insist(typeof donor === 'string' && typeof missionId === 'string', 'INVALID_INPUT');
  insist(MISSION_PATTERN.test(missionId), 'INVALID_MISSION_ID');
  insist(donor.includes(SCOPE.sourceMarker), 'SOURCE_MARKER_MISSING');
  insist(donor.includes(SCOPE.syntheticMarker), 'SOURCE_NOT_FICTIONAL');
  insist(donor.includes('noindex,nofollow'), 'SOURCE_MUST_BE_NOINDEX');
  insist(donor.includes('</body></html>'), 'SOURCE_HTML_INVALID');
  insist(!donor.includes(missionId), 'MISSION_ALREADY_PRESENT');
  const html = donor.replace(SCOPE.sourceMarker,
    'X1 FRESH PREVIEW · FICTIONAL SAMPLE BRAND · NOT A CUSTOMER SITE')
    .replace('</body></html>', '<!-- ' + missionId +
      '; synthetic; noindex; no customer data --></body></html>')
    // Standalone preview contains no /studio.html route: link to the existing
    // explicitly demo-only Studio, rather than shipping dead portal buttons.
    .replaceAll('href="/studio.html', 'href="' + SCOPE.studioDemoUrl);
  insist(html.includes(missionId) && html.includes('noindex,nofollow'), 'PREVIEW_POLICY_FAILED');
  insist(Buffer.byteLength(html, 'utf8') <= MAX_HTML_BYTES, 'PREVIEW_TOO_LARGE');
  return Object.freeze({
    html, missionId, sha256: sha256(html),
    byteLength: Buffer.byteLength(html, 'utf8'),
  });
}

export function buildPreviewRequest(artifact, sourceBlobSha) {
  insist(artifact && MISSION_PATTERN.test(artifact.missionId), 'INVALID_ARTIFACT');
  insist(typeof artifact.html === 'string' && artifact.html.includes(artifact.missionId), 'ARTIFACT_DRIFT');
  insist(artifact.html.includes('noindex,nofollow') &&
    artifact.html.includes(SCOPE.syntheticMarker), 'NOT_A_SYNTHETIC_PREVIEW');
  insist(SHA_PATTERN.test(sourceBlobSha || ''), 'SOURCE_BLOB_REQUIRED');
  insist(sha256(artifact.html) === artifact.sha256, 'HASH_MISMATCH');
  insist(Buffer.byteLength(artifact.html, 'utf8') <= MAX_HTML_BYTES, 'PREVIEW_TOO_LARGE');

  // Existing Vercel project root is src/. File API entries are relative to
  // that root. Using src/index.html here produces a READY but 404 deployment.
  return {
    name: SCOPE.projectName,
    project: SCOPE.projectId,
    files: [
      { file: 'index.html', data: artifact.html, encoding: 'utf-8' },
      { file: 'vercel.json', encoding: 'utf-8', data: JSON.stringify({
        version: 2,
        headers: [{ source: '/(.*)', headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store' },
        ] }],
      }) },
    ],
    meta: {
      wleMission: artifact.missionId,
      wleSourceBlob: sourceBlobSha,
      wleRelease: 'PREVIEW_ONLY',
      wleSha256: artifact.sha256,
    },
    // Intentionally absent: target, alias, gitSource, DNS and projectSettings.
    // The verified Vercel API defaults an omitted target to preview/null.
  };
}

export async function provisionSyntheticPreview({
  artifact, sourceBlobSha, token, fetchImpl = fetch,
}) {
  insist(typeof token === 'string' && token.length > 15, 'VERCEL_DEPLOY_TOKEN_REQUIRED');
  insist(typeof fetchImpl === 'function', 'FETCH_REQUIRED');
  const payload = buildPreviewRequest(artifact, sourceBlobSha);
  const response = await fetchImpl(
    'https://api.vercel.com/v13/deployments?teamId=' + SCOPE.teamId, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  insist(response?.ok, 'VERCEL_PREVIEW_REQUEST_FAILED_' + (response?.status || 0));
  const body = await response.json();
  const deployment = body.deployment || body.result?.deployment || body;
  insist(deployment?.target == null, 'UNEXPECTED_NON_PREVIEW_TARGET');
  insist(!deployment.alias?.length, 'UNEXPECTED_ALIAS_ASSIGNMENT');
  insist(/^dpl_[a-zA-Z0-9]+$/.test(deployment.id || ''), 'DEPLOYMENT_ID_INVALID');
  const url = new URL('https://' + deployment.url);
  insist(url.protocol === 'https:' && HOST_PATTERN.test(url.hostname) &&
    url.pathname === '/', 'DEPLOYMENT_URL_INVALID');
  return Object.freeze({
    deploymentId: deployment.id,
    url: url.toString(),
    state: deployment.readyState || deployment.state || 'UNKNOWN',
    target: 'preview',
    missionId: artifact.missionId,
    sha256: artifact.sha256,
    sourceBlobSha,
    validation: 'PENDING_INDEPENDENT_QA',
  });
}

export async function verifyPreviewBytes({ url, artifact, fetchImpl = fetch }) {
  insist(typeof url === 'string' && artifact?.sha256, 'VERIFICATION_INPUT_REQUIRED');
  const locator = new URL(url);
  insist(locator.protocol === 'https:' && HOST_PATTERN.test(locator.hostname) &&
    locator.pathname === '/' && !locator.search && !locator.hash, 'PREVIEW_HOST_NOT_ALLOWED');
  const response = await fetchImpl(locator.toString(), {
    method: 'GET', redirect: 'error', signal: AbortSignal.timeout(12000),
    headers: { Accept: 'text/html' },
  });
  insist(response?.ok, 'PREVIEW_HTTP_' + (response?.status || 0));
  const servedHtml = await response.text();
  insist(servedHtml.includes(artifact.missionId) &&
    servedHtml.includes('noindex,nofollow'), 'LIVE_POLICY_INVALID');
  insist(sha256(servedHtml) === artifact.sha256, 'LIVE_ARTIFACT_HASH_MISMATCH');
  const robots = response.headers?.get?.('x-robots-tag');
  insist(!robots || robots.toLowerCase().includes('noindex'), 'LIVE_ROBOTS_HEADER_INVALID');
  return Object.freeze({
    status: 'PASS', url, sha256: artifact.sha256,
    byteLength: Buffer.byteLength(servedHtml, 'utf8'),
  });
}

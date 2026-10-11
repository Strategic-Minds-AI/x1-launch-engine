import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSyntheticPreview, buildPreviewRequest, provisionSyntheticPreview,
  verifyPreviewBytes, SCOPE,
} from '../provision-preview.mjs';

const mission = 'WLE-X1-FRESH-PREVIEW-20261011-002';
const donor = '<!doctype html><html lang="en"><head><meta name="robots" content="noindex,nofollow"></head><body><p>PREMIUM WEBSITE DESIGN DEMO · FICTIONAL SAMPLE BRAND</p><p>NOT A REAL CONTRACTOR</p><a href="/studio.html#websites">Demo studio</a></body></html>';
const sourceBlobSha = 'a'.repeat(40);
const artifact = buildSyntheticPreview(donor, mission);
const previewHost = 'website-launch-engine-93x0z77dy-strategic-minds-advisory.vercel.app';

test('preview remains non-indexed, fictional and byte-hashed', () => {
  assert.match(artifact.html, /noindex,nofollow/);
  assert.match(artifact.html, /NOT A REAL CONTRACTOR/);
  assert.match(artifact.html, /NOT A CUSTOMER SITE/);
  assert.match(artifact.html, new RegExp(mission));
  assert.match(artifact.sha256, /^[a-f0-9]{64}$/);
  assert.match(artifact.html, /href="https:\/\/website-launch-engine\.vercel\.app\/studio\.html#websites"/);
  assert.doesNotMatch(artifact.html, /href="\/studio\.html/);
});

for (const [label, html, id] of [
  ['fake business', donor.replace('NOT A REAL CONTRACTOR', 'REAL CONTRACTOR'), mission],
  ['indexed', donor.replace('noindex,nofollow', 'index,follow'), mission],
  ['untrusted donor', donor.replace(SCOPE.sourceMarker, 'unreviewed page'), mission],
  ['invalid mission', donor, '../../main'],
  ['duplicate mission', donor + mission, mission],
]) test('rejects ' + label,
  () => assert.throws(() => buildSyntheticPreview(html, id)));

test('request uses correct src-relative path, no target and no alias', () => {
  const req = buildPreviewRequest(artifact, sourceBlobSha);
  assert.equal(req.project, SCOPE.projectId);
  assert.deepEqual(req.files.map(f => f.file), ['index.html', 'vercel.json']);
  assert.equal(Object.hasOwn(req, 'target'), false);
  assert.equal(Object.hasOwn(req, 'alias'), false);
  assert.equal(Object.hasOwn(req, 'projectSettings'), false);
  assert.match(req.files[1].data, /noindex/);
});

test('rejects modified source after artifact hash', () =>
  assert.throws(() => buildPreviewRequest({ ...artifact, html: artifact.html + 'x' },
    sourceBlobSha), /HASH_MISMATCH/));

test('single scoped preview POST produces pending validation record', async () => {
  let calls = 0;
  const result = await provisionSyntheticPreview({
    artifact, sourceBlobSha, token: 'offline-fake-token-test-only-12345',
    fetchImpl: async (url, options) => {
      calls++;
      assert.equal(url, 'https://api.vercel.com/v13/deployments?teamId=' + SCOPE.teamId);
      assert.equal(options.method, 'POST');
      assert.equal(JSON.parse(options.body).files[0].file, 'index.html');
      return new Response(JSON.stringify({ deployment: {
        id: 'dpl_Test1234', url: previewHost, target: null, alias: [], readyState: 'READY',
      } }), { status: 200 });
    },
  });
  assert.equal(calls, 1);
  assert.equal(result.target, 'preview');
  assert.equal(result.validation, 'PENDING_INDEPENDENT_QA');
  assert.equal(result.sha256, artifact.sha256);
  assert.equal(JSON.stringify(result).includes('offline-fake-token'), false);
});

test('missing token blocks before any outbound request', async () => {
  let touched = false;
  await assert.rejects(() => provisionSyntheticPreview({
    artifact, sourceBlobSha, token: '',
    fetchImpl: async () => { touched = true; },
  }), /TOKEN_REQUIRED/);
  assert.equal(touched, false);
});

test('rejects responses with production target or public alias', async () => {
  const fake = (target, alias = []) => async () =>
    new Response(JSON.stringify({
      id: 'dpl_Test1234', url: previewHost, target, alias,
    }), { status: 200 });
  await assert.rejects(() => provisionSyntheticPreview({
    artifact, sourceBlobSha, token: 'a'.repeat(20), fetchImpl: fake('production'),
  }), /UNEXPECTED_NON_PREVIEW_TARGET/);
  await assert.rejects(() => provisionSyntheticPreview({
    artifact, sourceBlobSha, token: 'a'.repeat(20),
    fetchImpl: fake(null, ['website-launch-engine.vercel.app']),
  }), /UNEXPECTED_ALIAS_ASSIGNMENT/);
});

test('read-only validator confirms exact hash and robots guard', async () => {
  const result = await verifyPreviewBytes({
    url: 'https://' + previewHost + '/', artifact,
    fetchImpl: async () => new Response(artifact.html, {
      status: 200, headers: { 'x-robots-tag': 'noindex, nofollow' },
    }),
  });
  assert.equal(result.status, 'PASS');
});

test('validator blocks wrong host and byte drift', async () => {
  await assert.rejects(() => verifyPreviewBytes({
    url: 'https://example.org/', artifact,
  }), /PREVIEW_HOST_NOT_ALLOWED/);
  await assert.rejects(() => verifyPreviewBytes({
    url: 'https://' + previewHost + '/', artifact,
    fetchImpl: async () => new Response(artifact.html + 'changed', { status: 200 }),
  }), /UNEXPECTED_PREVIEW_INJECTION/);
  await assert.rejects(() => verifyPreviewBytes({
    url: 'https://' + previewHost + '/', artifact,
    fetchImpl: async () => new Response(
      artifact.html.replace('NOT A REAL CONTRACTOR', 'NOT A REaL CONTRACTOR'), { status: 200 }),
  }), /LIVE_ARTIFACT_HASH_MISMATCH/);
});

test('allows only deployment-bound Vercel preview toolbar after exact source', async () => {
  const id = 'dpl_AyPeZPFMBy7p3ZUA8dcGXYbFq85k';
  const toolbar = '<script async data-explicit-opt-in="true" data-deployment-id="' +
    id + '" src="https://vercel.live/_next-live/feedback/feedback.js"></script>';
  const result = await verifyPreviewBytes({
    url: 'https://' + previewHost + '/',
    artifact, deploymentId: id,
    fetchImpl: async () => new Response(artifact.html + toolbar, {
      status: 200, headers: { 'x-robots-tag': 'noindex, nofollow' },
    }),
  });
  assert.equal(result.status, 'PASS');
});

test('blocks unapproved appendages and mismatched Vercel deployment IDs', async () => {
  const id = 'dpl_AyPeZPFMBy7p3ZUA8dcGXYbFq85k';
  const mismatched = '<script async data-explicit-opt-in="true" data-deployment-id="dpl_Other123"' +
    ' src="https://vercel.live/_next-live/feedback/feedback.js"></script>';
  for (const trailer of [mismatched, '<script src="https://untrusted.invalid/spy.js"></script>']) {
    await assert.rejects(() => verifyPreviewBytes({
      url: 'https://' + previewHost + '/',
      artifact, deploymentId: id,
      fetchImpl: async () => new Response(artifact.html + trailer, { status: 200 }),
    }), /UNEXPECTED_PREVIEW_INJECTION/);
  }
});

import { createHash } from "node:crypto";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA = /^[a-f0-9]{40}$/i;
const TYPE = "WLE_SYNTHETIC_ROOFING_PREVIEW_V1";
const REQUIRED_LOCATION = "Pompano Beach, FL";
const ERROR = Object.freeze({
  INVALID_WORK: "WLE_CANARY_WORK_CONTRACT_REJECTED",
  ARTIFACT: "WLE_CANARY_ARTIFACT_REJECTED",
  VALIDATION: "WLE_INDEPENDENT_VALIDATION_REQUIRED",
  RECEIPT: "WLE_AUDIT_RECEIPT_REQUIRED"
});
function assert(test, code) { if (!test) throw new Error(code); }
function safeHost(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password &&
      (url.hostname === "vercel.app" || url.hostname.endsWith(".vercel.app")) &&
      !url.search && !url.hash;
  } catch { return false; }
}

/**
 * A single, narrowly targeted preview job only. The existing X1 lease RPC is
 * the source of truth; this code does not create a scheduler or worker fleet.
 * Credentialled RPC invocation must be provided by an independently verified
 * privileged Railway runtime. Never make it callable from a browser.
 */
export function checkTargetedLease(work, { tenantId, workId, sourceSha, workerId }) {
  assert(work && typeof work === "object" && !Array.isArray(work), ERROR.INVALID_WORK);
  assert(ID.test(tenantId) && ID.test(workId) && work.tenant_id === tenantId &&
    work.work_id === workId, ERROR.INVALID_WORK);
  assert(SHA.test(sourceSha) && work.source_sha === sourceSha, ERROR.INVALID_WORK);
  assert(work.action_class === "NON_PRODUCTION_MUTATION", ERROR.INVALID_WORK);
  assert(typeof work.work_packet_id === "string" && work.work_packet_id.startsWith("WLE-SB-CANARY-"), ERROR.INVALID_WORK);
  assert(typeof work.task_id === "string" && work.task_id.startsWith("wle.synthetic.roofing."), ERROR.INVALID_WORK);
  assert(work.payload && work.payload.kind === TYPE &&
    work.payload.release_mode === "preview_only" &&
    work.payload.no_customer_data === true &&
    work.payload.location === REQUIRED_LOCATION &&
    work.payload.uses_external_model === false &&
    work.payload.requires_domain_purchase === false, ERROR.INVALID_WORK);
  assert(work.lease && ID.test(work.lease.leaseId) &&
    work.lease.holderAgentId === workerId && work.lease.taskId === work.task_id &&
    Number.isFinite(Date.parse(work.lease.expiresAt)) &&
    Date.parse(work.lease.expiresAt) > Date.now(), ERROR.INVALID_WORK);
  return Object.freeze({
    workId: work.work_id, packetId: work.work_packet_id, taskId: work.task_id,
    tenantId, sourceSha, leaseId: work.lease.leaseId, location: REQUIRED_LOCATION
  });
}

/** Preserve the approved premium roofing sample as the donor. Do not generate
 * low-quality site skeletons and do not publish fabricated testimonials/offices.
 */
export function buildRoofingCanary(templateHtml, packet) {
  assert(typeof templateHtml === "string" &&
    templateHtml.includes("NOT A REAL CONTRACTOR") &&
    templateHtml.includes('name="robots" content="noindex,nofollow"') &&
    templateHtml.includes("PREMIUM WEBSITE DESIGN DEMO"), ERROR.ARTIFACT);
  assert(packet?.packetId?.startsWith("WLE-SB-CANARY-"), ERROR.ARTIFACT);
  const unique = templateHtml.replace(
    "PREMIUM WEBSITE DESIGN DEMO · FICTIONAL SAMPLE BRAND",
    "X1 STAGING PREVIEW CANARY · FICTIONAL SAMPLE BRAND · NOT A CUSTOMER SITE"
  );
  assert(unique !== templateHtml, ERROR.ARTIFACT);
  const html = unique.replace("</body></html>",
    '<!-- WLE X1 SYNTHETIC ONLY; location: Pompano Beach, FL; no real local presence claimed -->' +
    "</body></html>");
  assert(html.includes("X1 STAGING PREVIEW CANARY") &&
    html.includes("noindex,nofollow") && html.includes("NOT A REAL CONTRACTOR"), ERROR.ARTIFACT);
  return Object.freeze({
    html, sha256: createHash("sha256").update(html, "utf8").digest("hex"),
    contentType: "text/html; charset=utf-8", releaseMode: "preview_only",
    location: REQUIRED_LOCATION, indexable: false
  });
}

/** For a single explicitly identified X1 work ID, never a generic queue scan.
 * The publisher and independent validator are intentionally separate injected
 * systems; neither can self-approve or dispatch a protected release.
 */
export async function processOneTargetedPreview({
  rpc, tenantId, workId, sourceSha, workerId,
  templateHtml, publishPreview, independentValidate, recordReceipt
}) {
  assert(typeof rpc === "function" && typeof publishPreview === "function" &&
    typeof independentValidate === "function" && typeof recordReceipt === "function",
    "INTEGRATION_NOT_CONFIGURED");
  assert(ID.test(tenantId) && ID.test(workId) && SHA.test(sourceSha) &&
    typeof workerId === "string" && /^wle-staging-[a-z0-9-]{2,64}$/.test(workerId),
    "TARGET_IDENTITY_NOT_VERIFIED");
  const lease = await rpc("x1_lease_work_by_id", {
    p_tenant_id: tenantId, p_worker_id: workerId,
    p_environment: "preview", p_work_id: workId, p_ttl_seconds: 300
  });
  if (!lease) return Object.freeze({ status: "NO_MATCHING_PENDING_WORK" });
  const leaseId = lease?.lease?.leaseId;
  try {
    const packet = checkTargetedLease(lease, { tenantId, workId, sourceSha, workerId });
    const asset = buildRoofingCanary(templateHtml, packet);
    const deployment = await publishPreview({
      html: asset.html, sha256: asset.sha256, path: "proof/roofing-canary.html",
      target: "preview", packetId: packet.packetId
    });
    assert(deployment?.target === "preview" && safeHost(deployment?.url) &&
      /^dpl_[A-Za-z0-9]+$/.test(deployment?.deploymentId || ""), ERROR.ARTIFACT);
    const audit = await independentValidate({
      url: deployment.url, deploymentId: deployment.deploymentId,
      sha256: asset.sha256, workerId, packetId: packet.packetId
    });
    assert(audit?.status === "PASS" && typeof audit.validatorId === "string" &&
      audit.validatorId !== workerId && audit.sha256 === asset.sha256 &&
      audit.deploymentId === deployment.deploymentId &&
      typeof audit.receiptId === "string" && audit.receiptId.startsWith("WLE-VAL-"),
      ERROR.VALIDATION);
    const stored = await recordReceipt({
      receiptId: audit.receiptId, tenantId, workId, leaseId,
      sha256: asset.sha256, sourceSha, previewUrl: deployment.url,
      deploymentId: deployment.deploymentId, validatorId: audit.validatorId
    });
    assert(stored?.persisted === true && stored.receiptId === audit.receiptId, ERROR.RECEIPT);
    await rpc("x1_finish_work", {
      p_work_id: workId, p_lease_id: leaseId,
      p_status: "COMPLETED", p_error_code: null
    });
    return Object.freeze({
      status: "COMPLETED", workId, deploymentId: deployment.deploymentId,
      url: deployment.url, sha256: asset.sha256, receiptId: audit.receiptId
    });
  } catch (error) {
    if (typeof leaseId === "string" && ID.test(leaseId)) {
      try {
        await rpc("x1_finish_work", {
          p_work_id: workId, p_lease_id: leaseId, p_status: "BLOCKED",
          p_error_code: Object.values(ERROR).includes(error.message) ?
            error.message : "WLE_CANARY_INTERNAL_FAILURE"
        });
      } catch { /* preserve original error; never claim to have finished */ }
    }
    throw error;
  }
}

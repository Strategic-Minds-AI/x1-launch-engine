import { test } from "node:test";
import assert from "node:assert/strict";
import health from "../api/health.js";
import missions from "../api/missions.js";

function call(handler, method = "GET") {
  const response = {
    statusCode: 200,
    headers: {},
    payload: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.payload = value; return this; }
  };
  handler({ method }, response);
  return response;
}

test("health is honest about disconnected backend", () => {
  const res = call(health);
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.status, "scaffold_only");
  assert.equal(res.payload.provisioningConnected, false);
  assert.equal(res.payload.authConnected, false);
  assert.equal(res.payload.productionReleaseEnabled, false);
  assert.equal(res.headers["Cache-Control"], "no-store, max-age=0");
});

test("health rejects unsupported methods", () => {
  assert.equal(call(health, "POST").statusCode, 405);
});

test("mission creation safely rejects unauthenticated mutations", () => {
  const res = call(missions, "POST");
  assert.equal(res.statusCode, 503);
  assert.equal(res.payload.code, "INTEGRATION_NOT_BOUND");
  assert.equal(res.payload.customerDataAccepted, false);
});

test("mission endpoint rejects unsupported methods", () => {
  assert.equal(call(missions, "GET").statusCode, 405);
  assert.equal(call(missions, "DELETE").statusCode, 405);
});

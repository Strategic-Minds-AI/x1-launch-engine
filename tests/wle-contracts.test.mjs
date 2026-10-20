import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const files=['admin.html','client.html','designer.html'];
test('HTML scripts parse as modules',()=>{
for(const f of files){const html=fs.readFileSync(f,'utf8');const scripts=[...html.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/g)];assert.ok(scripts.length>0,`Missing script: ${f}`);
for(const [,script] of scripts){const temp=path.join(os.tmpdir(),'wle-'+path.basename(f)+'.mjs');fs.writeFileSync(temp,script);const result=spawnSync(process.execPath,['--check',temp],{encoding:'utf8'});fs.rmSync(temp,{force:true});assert.equal(result.status,0,`${f}: ${result.stderr}`)}}});
test('admin never renders known placeholder-only dashboard',()=>{const html=fs.readFileSync('admin.html','utf8');assert.ok(!html.includes('PREVIEW ONLY'));assert.match(html,/api\/admin/);assert.match(html,/data-id/);});
test('admin API has protected auth and explicit role binding',()=>{const code=fs.readFileSync('api/admin.js','utf8');assert.match(code,/X1_ADMIN_USER_IDS/);assert.match(code,/auth\/v1\/user/);assert.match(code,/status\(403\)/);assert.match(code,/SUPABASE_SERVICE_ROLE_KEY/);});
test('client portal persists actual owner-scoped projects',()=>{const html=fs.readFileSync('client.html','utf8');assert.match(html,/wle_sites\?select=/);assert.match(html,/auth\/v1\/user/);assert.ok(!html.includes('PREVIEW ONLY'));});
test('config endpoint rejects absent backend configuration',()=>{const code=fs.readFileSync('api/config.js','utf8');assert.match(code,/status\(503\)/);assert.ok(!code.includes('SERVICE_ROLE_KEY'));});
test('RLS migration explicitly enables policy for sites and approvals',()=>{const sql=fs.readFileSync('supabase/migrations/20261020_wle_customer_portal.sql','utf8');assert.match(sql,/alter table public\.wle_sites enable row level security/i);assert.match(sql,/alter table public\.wle_site_approvals enable row level security/i);});

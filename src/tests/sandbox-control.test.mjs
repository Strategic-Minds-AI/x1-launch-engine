import { test } from "node:test";
import assert from "node:assert/strict";
import handler from "../api/sandbox/control.js";
function call(method){const res={headers:{},statusCode:200,payload:null,setHeader(k,v){this.headers[k]=v;},status(c){this.statusCode=c;return this;},json(x){this.payload=x;return this;}};handler({method},res);return res;}
test("sandbox status reports unbound remote worker",()=>{const r=call("GET");assert.equal(r.statusCode,200);assert.equal(r.payload.remoteExecution,false);assert.equal(r.payload.remoteWorker,"NOT_BOUND");assert.equal(r.payload.customerPublishing,false);});
test("sandbox blocks all mutations before tenant binding",()=>{for(const method of ["POST","PUT","DELETE","PATCH"]){const r=call(method);assert.equal(r.statusCode,403);assert.equal(r.payload.code,"PROTECTED_ACTION_NOT_ENABLED");}});

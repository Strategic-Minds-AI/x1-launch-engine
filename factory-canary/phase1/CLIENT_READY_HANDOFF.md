# Website Launch Engine — Client-Ready Preview Packet

## Preview
https://website-launch-engine-pee2u4cf5-strategic-minds-advisory.vercel.app/

## Tested identity
- Source repo: Strategic-Minds-AI/x1-launch-engine
- Branch: feature/gptbf-prime-live-canary-20261016
- Tested source SHA: 3c5ec80e81f534a0a037b30c6308f399af01d07a
- Vercel deployment: dpl_2aQ5XDEvh5EMyWkv1aEyjXrzKdVq
- X1 work: ff7b9e2c-1168-4810-bb38-4bfa2533a5fb
- X1 receipt: worker:ff7b9e2c-1168-4810-bb38-4bfa2533a5fb:1

## What is ready to test
- Website Launch Engine public catalog and hero
- 22 construction industry selectors
- template filtering and full-page preview dialog
- launch wizard entry flow
- admin preview
- client preview
- phone links
- contact form structure
- responsive layouts at desktop 1440x900, tablet 768x1024, and mobile 390x844
- noindex preview protection

## Independent evidence
- QA Agent: 6ad2ab684fac8de5c34379a4, score 99, 28/28 executable checks PASS
- Independent Validator: 6ad2aba388d5562b88b99c1a, score 99, PASS
- One repair loop completed for stale featured-template JavaScript references and fully retested.

## Known limitations
- This is a preview only. Do not enter real customer data.
- Google Forms intake is not connected because the current connector returns an unsupported MCP protocol version. The verified intake workaround is the normalized ProjectPack plus Drive intake document.
- Cloud Browser session routing is unreliable after initial navigation, so final deterministic browser QA was executed with Playwright.
- Cloud Browser autonomous agent execution is blocked by the connected Vercel AI Gateway account's insufficient credit balance. No spend was authorized.
- JARVIS cannot currently authenticate a private Git clone directly; provider-authenticated GitHub reads were mirrored to the local Docker sandbox.
- A generic console-only 404 warning remains unattributed, but QA observed zero page errors, zero request failures, and zero unexpected HTTP responses.

## Client test instructions
1. Open the preview URL.
2. Browse several industry categories.
3. Open a template preview and confirm the preview-only disclosure.
4. Open the launch wizard and confirm the first step is Select Template.
5. Review the Admin Preview and Client Preview links.
6. Test the site on desktop and mobile.
7. Record requested changes by page, element, and expected result.
8. Do not submit production credentials, payment information, customer records, or real outbound messages.

## Release status
Production release is NOT authorized. Protected/default branch merge, production database/RLS, secrets/OAuth, DNS/domain actions, spend, permissions, customer email/SMS, public posting, and destructive changes remain approval-gated.

## Rollback
Abandon the canary branch and expire the preview deployment. Production aliases were not changed.

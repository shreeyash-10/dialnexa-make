# Make app review evidence

## Fresh curated rerun — 2026-08-12

The API-key connection remained valid throughout this rerun: authenticated DialNexa requests returned HTTP 200. One saved scenario per module was used, and write tests were limited to controlled DialNexa destinations with future scheduling and immediate cancellation where applicable.

| Module | Fresh result |
| --- | --- |
| List agents | Passed. Returned one real agent bundle after deploying a compatibility mapping that supports both `body.data.agents` (current production response) and `body.agents` (reviewer-documented response). |
| List batch calls | Passed. |
| List workflows | Passed, including pagination. |
| Search calls | Passed. |
| Create a call | Passed. The Make input inspector showed `metadata` as a Collection, and the API returned a new call ID for the reserved fictional destination. |
| Get a call | Passed. |
| Create a batch call | Passed with `agent_qzXtznGkgyvPaE`, published version 17, a two-row `name,phone` CSV using E.164 test destinations, and only `starts_at`. Returned batch `batch_iJqLQM3TYSebgO`, total records `2`, and status `initiated`. Versions 18 and the older agent's versions 4/5 remain unassigned for batch origination. |
| Get a batch call | Passed and returned the corrected call-log envelope/count. |
| Update a batch call status | Passed. The standalone reviewer-safe scenario cancelled fresh batch `batch_iJqLQM3TYSebgO` before its scheduled start. |
| Get a workflow | Passed. |
| Update a workflow status | Passed with the restored PATCH communication. |
| Upload workflow leads | Passed. |
| Watch call events | Fresh webhook creation/attach passed. `call.failed` was not delivered for a reserved fictional number. Repeating the prior method with `call.completed` and a DialNexa-controlled destination succeeded: a 43-second completed call delivered the flat payload with status, summary, transcript, duration, recording path, and metadata. The temporary webhook was deleted and Make's webhook list was verified empty. |
| Make an API call | Passed with HTTP 200. |

Fresh-run conclusion: all 14 modules completed their curated scenarios, including fresh batch creation/cancellation and fresh webhook creation with `call.completed` delivery. `call.failed` delivery remains an API-side gap, but the submitted Watch module is proven with `call.completed`.

This file tracks Make scenario evidence for the private DialNexa app. Only scenarios explicitly marked **reviewer-safe** should be shared with Make. Re-run the final set immediately before submission so the execution history is fresh.

Reviewer-safe write tests use only synthetic labels and destinations that DialNexa has designated and confirmed as company-controlled test numbers. No customer destinations, recordings, transcripts, or customer metadata may be present in a submitted execution.

## Reviewer-safe successful evidence

| Module or check | Scenario | Scenario ID | Result |
| --- | --- | --- | --- |
| List agents | DialNexa – Agents Final Verification | `6847236` | Successful bounded result. Confirm the displayed agent name is acceptable before sharing. |
| List batch calls | DialNexa – Reviewer Safe List Batch | `6848688` | One cancelled synthetic batch, `Make Review Synthetic Batch`. |
| Search calls | DialNexa – Reviewer Safe Search Call | `6848677` | One exact synthetic call, failed before connection; no transcript or recording. |
| Get workflow | DialNexa – Reviewer Safe Get Workflow | `6847775` | Successful lookup of disposable `Test workflow`; status was `draft` before lifecycle testing. |
| Make an API call | DialNexa – Reviewer Safe Universal Languages | `6848653` | Successful `GET /v1/languages`, HTTP 200. |
| Create a call | DialNexa – Reviewer Safe Create Call | `6847899` | Successful creation using a published DialNexa test agent, a reserved fictional destination, and synthetic metadata. |
| Get a call | DialNexa – Reviewer Safe Get Call | `6848017` | Successful lookup of the fictional failed call; no transcript or recording was created. |
| Create a batch call | DialNexa – Reviewer Safe Batch Immediate Cancel | `6848344` | Fresh successful two-record batch on 2026-08-12 using agent version 17, synthetic names, exact `name,phone` headers, E.164 DialNexa-controlled test destinations, and a future start; returned status `initiated`. |
| Get a batch call | DialNexa – Reviewer Safe Get Batch | `6848387` | Fresh successful single bundle on 2026-08-07; returned count was 2 with page 1 and page size 20. |
| Update a batch call status — pause | DialNexa – Reviewer Safe Batch Cancel | `6848479` | Fresh successful pause on 2026-08-07 for the disposable reviewer-safe batch. |
| Update a batch call status — resume | DialNexa – Reviewer Safe Batch Cancel | `6848479` | Fresh successful resume on 2026-08-07 for the disposable reviewer-safe batch. |
| Update a batch call status — cancel | DialNexa – Reviewer Safe Batch Cancel | `6848479` | Fresh successful cancel on 2026-08-12 for `batch_iJqLQM3TYSebgO`, before its scheduled start. |
| Update a workflow status | DialNexa – Reviewer Safe Workflow Deactivate | `6848511` | Successfully deactivated the disposable workflow before uploading leads. |
| Upload workflow leads | DialNexa – Reviewer Safe Upload Leads | `6848549` | Uploaded one fictional lead to the inactive workflow; HTTP 201. |
| Deliberate error handling | DialNexa – Reviewer Safe Error Handling | `6847838` | Expected clean 404 for `workflow_make_review_missing`. |
| List workflows pagination | DialNexa – Workflows Final Verification | `6846738` | Successful on 2026-08-07 with API page size 1 and limit 2; returned two bundles. [Execution](https://eu1.make.com/2283008/scenarios/6846738/logs/b4589b44a80242a2b67ff2aa9a8ffdd9?showCheckRuns=true&showChangeLog=true). The DialNexa authorized representative approved using the existing workflow titles in this run. |

## Technical evidence that is not submission-safe yet

| Check | Scenario | Result | Why it must not be submitted yet |
| --- | --- | --- | --- |
| Webhook completed-event payload | DialNexa – Reviewer Safe Watch Completed (`6848048`) | A controlled call produced a successful `call.completed` delivery on 2026-08-07; the webhook was then removed from Make and the webhook list was verified empty. [Execution](https://eu1.make.com/2283008/scenarios/6848048/logs/1128d9b2f5784aad9d0c5e5d9b609863?showCheckRuns=true&showChangeLog=true). | The payload contains a transcript, summary, and recording path. This proves attach, delivery, and removal, but should not be submitted as the privacy-safe reviewer run. |
| Agent/batch diagnostics | DialNexa – Diagnostic Agent Metadata – Do Not Submit (`6847859`) | Confirmed agent version 4 and exposed a batch endpoint inconsistency. | Its history contains a real DialNexa telephony number. |
| Agent/batch diagnostics | Older executions in the private batch scenario (`6848344`) | Earlier draft attempts exercised invalid CSV shapes and non-reviewer diagnostics. | Share only the fresh successful execution identified above, not the scenario's older history. |

## Blocked or failed checks

| Module or check | Status | Required next action |
| --- | --- | --- |
| Reviewer-safe webhook payload | Attach, completed-event delivery, and removal all work. A second test used reserved fictional destination `+1 202-555-0100`; the call reached `failed` with empty transcript and recording fields, but DialNexa did not deliver the subscribed `call.failed` event. The temporary webhook was removed and Make's webhook list was verified empty. | Fix `call.failed` delivery and repeat the fictional-destination test, or obtain Make reviewer approval for the successful controlled `call.completed` payload. |

## Connector corrections discovered during testing

- **Get a batch call:** DialNexa returns a root array. The action now wraps it in one Make bundle with `callLogs`, `returnedCount`, `page`, and `limit`.
- **List workflows pagination:** added an advanced `API page size` parameter. A page size of 1 with limit 2 verified page advancement on 2026-08-07 while retaining a default of 100.
- **Create a batch call:** confirmed the API expects `name` and `phone` CSV columns. A manually entered Make test buffer must use an evaluated expression with both arguments quoted: `{{toBinary("<base64>"; "base64")}}`. Earlier plain-text expressions uploaded the formula itself and caused `No valid phone numbers found in CSV`.
- **Samples:** replaced realistic-looking phone numbers with reserved `+1 202-555-01xx` fictional numbers.

## Submission metadata

- Service URL: `https://dialnexa.com`
- API documentation: `https://dialnexa.com/docs/api-reference/introduction`
- Support contact: DialNexa Operations at `operations@dialnexa.com`
- Partnership contact: Shreeyash Kanwade, Product Ops, at `operations@dialnexa.com`
- Recommended categories: AI → Voice Agents; Communication → SMS & Phone; CRM/Sales → Lead Generation
- Theme: `#14003D`
- Accent: `#7C3AED`
- Logo: `assets/dialnexa-make-icon.png` (1024 × 1024 transparent PNG; 55,219 bytes)

The live Make app theme was synchronized to `#14003D` on 2026-08-07. The logo file is ready, but the browser-control file upload was blocked locally; upload the exact PNG above in **Edit App → App logo** before submission.

The vendor/trademark authorization is completed in `docs/ownership-authorization.md` by Shreeyash Kanwade, Product Ops.

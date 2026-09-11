# Make app review evidence

## Final live rerun — 2026-09-11/12

The saved DialNexa connection was refreshed and verified. The following executions were run against the remediated live Make app. Test labels are synthetic. Call tests use a reserved fictional destination; batch tests use two DialNexa-controlled test destinations because the batch endpoint validates dialable numbers. The batch response exposes only DialNexa's own outbound number, not a customer number.

| Module or check | Result | Execution |
| --- | --- | --- |
| List agents | Success; bounded Make output from the API's complete collection. | [Open execution](https://eu1.make.com/2283008/scenarios/6847236/logs/a4099182a968489cb4e5216fe4d65285) |
| List batch calls | Success. | [Open execution](https://eu1.make.com/2283008/scenarios/6848688/logs/20b0881079444293b5f22495aeb44874) |
| List workflows | Success; API page size 1 and Make result limit 2 returned two bundles, proving pagination. | [Open execution](https://eu1.make.com/2283008/scenarios/6846738/logs/51f71b6c25c0443db6de8d92bcc6fa28) |
| Search calls | Success; one synthetic failed call, with no transcript or recording. | [Open execution](https://eu1.make.com/2283008/scenarios/6848677/logs/bd90191412e6447fbd11eb1316e99a9f) |
| Create a call | Success with published agent version 20, a reserved fictional destination, and synthetic metadata. | [Open execution](https://eu1.make.com/2283008/scenarios/6847899/logs/be4ac345b9974e1692a2a5b13381ba9a) |
| Get a call | Success; fictional failed call with empty transcript and recording fields. | [Open execution](https://eu1.make.com/2283008/scenarios/6848017/logs/aa0775bf570444d297a843cdfd7573cf) |
| Create a batch call | Success; two-row `name,phone` CSV, published agent version 20, and a future start. Returned `batch_w6pam3j3EBzATP`. | [Open execution](https://eu1.make.com/2283008/scenarios/6848344/logs/a9f5ce5cdc8342e7a8b276a6b13af0b7) |
| Get a batch call | Success against the freshly cancelled batch. Input contains only Batch call ID; Page and Page size are no longer exposed. | [Open execution](https://eu1.make.com/2283008/scenarios/6848387/logs/6d5f40ee41d242a3be346221f4b6f89a) |
| Update a batch call status — Pause | Success on a future-scheduled batch. | [Open execution](https://eu1.make.com/2283008/scenarios/6848344/logs/0d10f9843d8f46e09ae42b61402a36fa) |
| Update a batch call status — Resume | Success on the same batch. | [Open execution](https://eu1.make.com/2283008/scenarios/6848479/logs/2049d86755ba4fa39014c81d0f33530c) |
| Update a batch call status — Cancel | Success in the same execution as the final future-scheduled Create Batch test. | [Open execution](https://eu1.make.com/2283008/scenarios/6848344/logs/a9f5ce5cdc8342e7a8b276a6b13af0b7) |
| Get a workflow | Success against synthetic `Test workflow`. | [Open execution](https://eu1.make.com/2283008/scenarios/6847775/logs/e22f74ef8b1f423db997be235debfac8) |
| Update a workflow status | Success; resumed and then paused the disposable workflow. | [Open execution](https://eu1.make.com/2283008/scenarios/6848511/logs/8ec38b92db0d405f8950be4226b24ad2) |
| Upload workflow leads | Success; uploaded one fictional lead to the disposable workflow, HTTP 201. | [Open execution](https://eu1.make.com/2283008/scenarios/6848549/logs/09f7299948ca4f20aade6d4182b5f22b) |
| Make an API call | Success; compact `GET` of the synthetic workflow, HTTP 200 and 1.3 KB. | [Open execution](https://eu1.make.com/2283008/scenarios/6848653/logs/c81e835625fb4be0830999732530c215) |
| Deliberate error handling | Expected clean 404: `Workflow with ID make_review_missing not found`. | [Open execution](https://eu1.make.com/2283008/scenarios/6847838/logs/e9ee7115a61b45c58c7026eb2c57c81c) |

### Webhook result

Webhook creation/attachment succeeded for a new `call.failed` subscription. A correctly timed reserved-number failure was generated while Make was listening, but DialNexa did not deliver the event within Make's listening window. This is the sole remaining API-side blocker to a new reviewer-safe Watch execution. A prior controlled `call.completed` delivery proves the trigger's attach, receive, and detach path, but that execution contains call content and is intentionally not included in the safe table above.

## Live reviewer remediation — 2026-09-11

The following changes were synchronized to DialNexa v1.0.0 in Make after the Apps DX review:

- restored the complete `PATCH /v1/workflows/{id}/status` communication;
- made all 14 release modules visible;
- removed Page and Page size from **Get a batch call** and added internal pagination at 200 call logs per page;
- raised both picker RPC limits to 500 and added pagination to **List workflows**;
- confirmed from DialNexa's API contract that **List agents** returns the complete collection and accepts no pagination parameters;
- replaced the single Other group with Triggers, Agents, Calls, Batch calls, Workflows, and Other;
- flattened the **Create a batch call** input array;
- retained required call metadata because `CreateCallRequest` requires it; `{}` is a valid empty value.

The saved DialNexa test connection was refreshed and verified on 2026-09-11. The final execution links are recorded above.

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
| Get a batch call | DialNexa – Reviewer Safe Get Batch | `6848387` | Fresh successful bundle on 2026-08-07; returned count was 2. The module now advances through API pages internally and no longer exposes Page or Page size inputs. |
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

- **Get a batch call:** removed the user-facing Page and Page size inputs. The action requests the API maximum of 200 call logs per page and advances through additional pages with Make's pagination directive.
- **List workflows pagination:** both the public search module and workflow-picker RPC advance through `meta.currentPage`/`meta.totalPages`. The RPC requests 100 items per API page and allows Make to collect up to 500 choices.
- **List agents:** DialNexa's API returns every agent in one response and does not accept Page or Limit query parameters. The module therefore does not invent pagination controls; its picker RPC accepts up to 500 returned choices.
- **Create a call metadata:** DialNexa's `CreateCallRequest` schema requires `metadata`. The empty JSON object is a valid value, so the required field and `{}` default are intentional.
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

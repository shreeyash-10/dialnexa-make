# Make app review evidence

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
| Create a batch call | DialNexa – Private Batch + Webhook – Do Not Submit | `6848344` | Fresh successful two-record batch on 2026-08-07 using synthetic names, `name,phone` headers, and two DialNexa-controlled test destinations; returned status `initiated`. Rename the scenario before submission. |
| Get a batch call | DialNexa – Reviewer Safe Get Batch | `6848387` | Fresh successful single bundle on 2026-08-07; returned count was 2 with page 1 and page size 20. |
| Update a batch call status — pause | DialNexa – Reviewer Safe Batch Cancel | `6848479` | Fresh successful pause on 2026-08-07 for the disposable reviewer-safe batch. |
| Update a batch call status — resume | DialNexa – Reviewer Safe Batch Cancel | `6848479` | Fresh successful resume on 2026-08-07 for the disposable reviewer-safe batch. |
| Update a workflow status | DialNexa – Reviewer Safe Workflow Deactivate | `6848511` | Successfully deactivated the disposable workflow before uploading leads. |
| Upload workflow leads | DialNexa – Reviewer Safe Upload Leads | `6848549` | Uploaded one fictional lead to the inactive workflow; HTTP 201. |
| Deliberate error handling | DialNexa – Reviewer Safe Error Handling | `6847838` | Expected clean 404 for `workflow_make_review_missing`. |

## Technical evidence that is not submission-safe yet

| Check | Scenario | Result | Why it must not be submitted yet |
| --- | --- | --- | --- |
| Pagination | DialNexa – Workflows Final Verification (`6846738`) | API page size 10 returned 13 bundles across two pages. | Existing workflow names may identify customers. Repeat in a workspace containing only synthetic workflow names. |
| Agent/batch diagnostics | DialNexa – Diagnostic Agent Metadata – Do Not Submit (`6847859`) | Confirmed agent version 4 and exposed a batch endpoint inconsistency. | Its history contains a real DialNexa telephony number. |
| Agent/batch diagnostics | Older executions in the private batch scenario (`6848344`) | Earlier draft attempts exercised invalid CSV shapes and non-reviewer diagnostics. | Share only the fresh successful execution identified above, not the scenario's older history. |

## Blocked or failed checks

| Module or check | Status | Required next action |
| --- | --- | --- |
| Update a batch call status — cancel | Two-row batches reached a final `completed` state before a second scenario could issue cancel, so the API correctly rejected cancel on a final campaign. | Run Create Batch → Cancel in one chained scenario, using 5–6 synthetic rows on the two DialNexa-controlled test destinations so cancellation is issued immediately. |
| Watch call events: delivery | Webhook registration succeeded in scenario `6848048`. A fictional pre-connect failure did not deliver `call.failed` during the listening window. | Align the DialNexa event contract and delivery path, then repeat with a controlled completed or failed call. |
| Watch call events: removal | The disposable webhook was successfully removed from Make after testing, exercising the detach flow. | Recreate it only when delivery is ready to re-test. |
| Reviewer-safe List workflows | Pagination works, but the current workspace includes non-synthetic-looking workflow titles. | Use a clean Make/DialNexa review workspace populated only with synthetic workflows. |

## Connector corrections discovered during testing

- **Get a batch call:** DialNexa returns a root array. The action now wraps it in one Make bundle with `callLogs`, `returnedCount`, `page`, and `limit`.
- **List workflows pagination:** added an advanced `API page size` parameter. A page size of 10 verified pagination over 13 results while retaining a default of 100.
- **Create a batch call:** confirmed the API expects `name` and `phone` CSV columns. A manually entered Make test buffer must use an evaluated expression with both arguments quoted: `{{toBinary("<base64>"; "base64")}}`. Earlier plain-text expressions uploaded the formula itself and caused `No valid phone numbers found in CSV`.
- **Samples:** replaced realistic-looking phone numbers with reserved `+1 202-555-01xx` fictional numbers.

## Submission metadata

- Service URL: `https://dialnexa.com`
- API documentation: `https://dialnexa.com/docs/api-reference/introduction`
- Support contact: DialNexa Operations at `operations@dialnexa.com`
- Partnership contact: DialNexa Operations at `operations@dialnexa.com` (named owner pending confirmation)
- Recommended categories: AI → Voice Agents; Communication → SMS & Phone; CRM/Sales → Lead Generation
- Theme: `#14003D`
- Accent: `#7C3AED`
- Logo: `assets/dialnexa-make-icon.png` (1024 × 1024 transparent PNG; 55,219 bytes)

Before submission, an authorized DialNexa representative must name the partnership owner and complete the vendor/trademark authorization in `docs/ownership-authorization.md`.

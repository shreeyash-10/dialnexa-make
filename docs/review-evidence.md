# Make app review evidence

This file tracks Make scenario evidence for the private DialNexa app. Only scenarios explicitly marked **reviewer-safe** should be shared with Make. Re-run the final set immediately before submission so the execution history is fresh.

All reviewer-safe write tests use the reserved fictional number `+12025550100`, synthetic labels, and a disposable DialNexa workflow or batch. They contain no recordings or transcripts.

## Reviewer-safe successful evidence

| Module or check | Scenario | Scenario ID | Result |
| --- | --- | --- | --- |
| List agents | DialNexa – Agents Final Verification | `6847236` | Successful bounded result. Confirm the displayed agent name is acceptable before sharing. |
| List batch calls | DialNexa – Reviewer Safe List Batch | `6848688` | One cancelled synthetic batch, `Make Review Synthetic Batch`. |
| Search calls | DialNexa – Reviewer Safe Search Call | `6848677` | One exact synthetic call, failed before connection; no transcript or recording. |
| Get workflow | DialNexa – Reviewer Safe Get Workflow | `6847775` | Successful lookup of disposable `Test workflow`; status was `draft` before lifecycle testing. |
| Make an API call | DialNexa – Reviewer Safe Universal Languages | `6848653` | Successful `GET /v1/languages`, HTTP 200. |
| Create a call | DialNexa – Reviewer Safe Create Call | `6847899` | Successful creation using `agent_t7GEH3UpscNGBH`, version 4, a reserved fictional destination, and synthetic metadata. |
| Get a call | DialNexa – Reviewer Safe Get Call | `6848017` | Successful lookup of the fictional failed call; no transcript or recording was created. |
| Get a batch call | DialNexa – Reviewer Safe Get Batch | `6848387` | Successful single bundle after wrapping the API's call-log array; returned count was 0. |
| Update a batch call status | DialNexa – Reviewer Safe Batch Cancel | `6848479` | Successfully cancelled the disposable partial batch. |
| Update a workflow status | DialNexa – Reviewer Safe Workflow Deactivate | `6848511` | Successfully deactivated the disposable workflow before uploading leads. |
| Upload workflow leads | DialNexa – Reviewer Safe Upload Leads | `6848549` | Uploaded one fictional lead to the inactive workflow; HTTP 201. |
| Deliberate error handling | DialNexa – Reviewer Safe Error Handling | `6847838` | Expected clean 404 for `workflow_make_review_missing`. |

## Technical evidence that is not submission-safe yet

| Check | Scenario | Result | Why it must not be submitted yet |
| --- | --- | --- | --- |
| Pagination | DialNexa – Workflows Final Verification (`6846738`) | API page size 10 returned 13 bundles across two pages. | Existing workflow names may identify customers. Repeat in a workspace containing only synthetic workflow names. |
| Agent/batch diagnostics | DialNexa – Diagnostic Agent Metadata – Do Not Submit (`6847859`) | Confirmed agent version 4 and exposed a batch endpoint inconsistency. | Its history contains a real DialNexa telephony number. |

## Blocked or failed checks

| Module or check | Status | Required next action |
| --- | --- | --- |
| Create a batch call | Scenario `6848344` correctly parsed the one-row synthetic CSV, but DialNexa returned `404 No outbound phone number found` even though agent version 4 exposes an outbound telephony provider. | Fix the DialNexa batch-create phone/provider lookup, then re-run the same scenario. Do not submit the failed execution as module evidence. |
| Watch call events: delivery | Webhook registration succeeded in scenario `6848048`. A fictional pre-connect failure did not deliver `call.failed` during the listening window. | Align the DialNexa event contract and delivery path, then repeat with a controlled completed or failed call. |
| Watch call events: removal | The disposable webhook was successfully removed from Make after testing, exercising the detach flow. | Recreate it only when delivery is ready to re-test. |
| Reviewer-safe List workflows | Pagination works, but the current workspace includes non-synthetic-looking workflow titles. | Use a clean Make/DialNexa review workspace populated only with synthetic workflows. |

## Connector corrections discovered during testing

- **Get a batch call:** DialNexa returns a root array. The action now wraps it in one Make bundle with `callLogs`, `returnedCount`, `page`, and `limit`.
- **List workflows pagination:** added an advanced `API page size` parameter. A page size of 10 verified pagination over 13 results while retaining a default of 100.
- **Samples:** replaced realistic-looking phone numbers with reserved `+1 202-555-01xx` fictional numbers.

## Submission metadata draft

- Service URL: `https://dialnexa.com`
- API documentation: `https://dialnexa.com/docs/api-reference/introduction`
- Support email draft: `operations@dialnexa.com`
- Partnership contact draft: DialNexa operations owner at `operations@dialnexa.com`
- Recommended categories: AI, Communication, Sales and CRM
- Theme: `#14003D`
- Accent: `#7C3AED`

Before submission, an authorized DialNexa representative must provide the approved 512–2048 px square source logo, name the partnership owner, and confirm vendor/trademark ownership in writing.

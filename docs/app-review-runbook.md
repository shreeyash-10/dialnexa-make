# Build, test, and review runbook

## 1. Private app setup

- Create a private app named **DialNexa** in Make's Custom Apps editor.
- Use the official DialNexa logo and brand color.
- Add the Base, connection, RPC, webhook, and module files in the order described in the repository README.
- Keep every module hidden from public distribution while testing.

## 2. Required credentials and safe test data

Prepare a non-production DialNexa workspace with:

- a dedicated API key;
- one published test agent;
- one DialNexa-owned or explicitly consented test destination;
- one small batch call already present;
- one workflow that can safely be activated and paused;
- synthetic metadata only.

Never use customer phone numbers, real transcripts, recordings, secrets, or personal data in review scenario logs.

## 3. Test scenarios

Create scenario A for successful actions:

1. **List agents** (limit 1).
2. **Create a call** to the controlled test destination.
3. **Get a call** using the new call ID.
4. Route to **Search calls** and confirm the new ID is returned.
5. **Create a batch call** with a two-row synthetic file containing `name` and `phone` columns, then **List batch calls** and **Get a batch call** using the returned ID. When entering base64 test data manually, map it as an evaluated buffer such as `{{toBinary("<base64>"; "base64")}}`; plain `toBinary(...)` text is uploaded literally and is not a valid CSV.
6. **List workflows**, **Get a workflow**, then **Upload workflow leads** with a two-row synthetic file.
7. **Make an API call** with `GET /v1/languages`.

Create scenario B for lifecycle actions:

- Use a disposable batch to test pause and resume. Only test cancel on a batch created specifically for cancellation.
- Use a disposable workflow to test activate, pause, resume, and deactivate.
- Read the resource after each transition to verify the new state before another transition.

Create scenario C for the instant trigger:

- Add **Watch call events** for `call.completed`.
- Complete one consented test call.
- Confirm the module emits call ID, status, summary, and expected analysis fields.
- Remove the webhook from the scenario and confirm the matching DialNexa webhook is deleted.

Create scenario D for pagination:

- Run each list/search module with a result limit larger than a single test page where the dataset permits.
- Preserve logs demonstrating page advancement for calls, batches, and workflows.

Create scenario E for errors:

- Use a temporary invalid API key or a deliberately invalid synthetic resource ID.
- Capture one clean error showing the HTTP status and DialNexa message.
- Restore valid credentials immediately after the run.

## 4. Pre-publication QA

- Run `npm run validate` locally.
- Reconcile every module's live output with its `interface.json` and `samples.json`.
- Verify all date outputs are ISO 8601 and use Make's `date` interface type.
- Confirm no Authorization value appears in logs.
- Confirm the universal module cannot override the inherited Authorization header through its default configuration.
- Resolve the webhook signature-verification item in the API surface audit with DialNexa security and Make QA.
- Remove every temporary connection, module, RPC, or webhook component that should not become permanent.
- Verify every intended public module is visible and every internal/test module is hidden.

## 5. Review submission package

Have these ready before clicking **Publish**:

- API docs: `https://dialnexa.com/docs/api-reference/introduction`
- service URL: `https://dialnexa.com`
- links to all successful, pagination, webhook, lifecycle, and error test scenarios;
- developer relationship: official DialNexa/vendor-owned integration;
- partnership contact;
- support contact and response ownership;
- requested Make categories/subcategories;
- official directory/company logo;
- authorized confirmation of trademark rights and external-service/API-policy compliance.

Then:

1. Publish the tested app once. This is irreversible from the UI.
2. Select the modules intended for directory visibility.
3. Complete the Review tab and emailed form.
4. Respond in the single app-review email thread.
5. After every reviewer-requested change, rerun affected scenarios so fresh logs are available.
6. Wait for automatic-review feedback, manual QA, approval, and the planned release.

## 6. After directory launch

- Apply to the Make Technology Partner Program.
- Assign a technical owner and partnership owner.
- Monitor support issues and Make's Idea Exchange.
- Schedule a six-month API checkup.
- Track DialNexa API changelog/deprecations and stage public-app updates in Make's development copy.

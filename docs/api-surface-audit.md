# DialNexa API surface audit

Source of truth: DialNexa's public `/v1` documentation as indexed by `https://dialnexa.com/docs/llms.txt` on 2026-08-06.

Legend:

- **Native R1**: first-class module in the initial Make directory release.
- **Infrastructure**: used by the connection, webhook, or RPC layer.
- **Universal R1**: supported immediately through **Make an API call**.
- **R2 candidate**: good candidate for a later first-class module after usage evidence and dedicated scenario tests.

## Coverage matrix

| API family | Documented operations | Release coverage |
| --- | --- | --- |
| Agents | Create, list, get, update, delete | List is **Native R1** and **Infrastructure** for agent selection. Remaining operations are **Universal R1**; get/create/update are R2 candidates. |
| Calls | Create, list/search, get | All are **Native R1**. |
| Batch calls | Create with file upload, list, get details, update status | All are **Native R1**. |
| Workflows | List, get, update status | All are **Native R1**. |
| Workflow leads | Upload file, list, delete, get history, get variable keys | Upload is **Native R1**. The JSON-based operations are **Universal R1**; list/history are R2 candidates. |
| Webhooks | Create, list, get, update, delete | Create/delete are **Infrastructure** for **Watch call events**. CRUD remains **Universal R1**. |
| Knowledge bases | Create, list, get, update, delete | **Universal R1**; list/get are R2 candidates. |
| Phone numbers | List, get, search Plivo inventory, buy, link SIP trunk, delete | **Universal R1**. List/get are R2 candidates. Purchase, SIP linking, and deletion should remain advanced until extra confirmation UX is designed. |
| Voices | List, get, list accents, list languages, list speech-to-speech voices | **Universal R1**. List/get are R2 candidates if agent-management modules are added. |
| Languages | List, get | **Universal R1**. |
| LLMs | List, get, list fallback LLMs | **Universal R1**. |
| Transcribers | List, get, list fallback transcribers | **Universal R1**. |

## API findings that affect the connector

### Authentication

- All documented endpoint groups use `Authorization: Bearer <key_id:secret>`.
- The connection asks for the complete token and validates it using `GET /v1/agents`.
- No `/me` or workspace-profile endpoint is documented, so the connection metadata cannot display a canonical account name yet.

### Versioning

- New code should use `/v1`.
- Legacy unversioned routes were documented as supported only through 2026-07-31, so this connector never uses them.
- The universal module's host stops before the version so future versions remain reachable.

### Pagination is not uniform

- Calls return a root array with no pagination metadata and document a maximum page size of 200. The connector requests 200 and advances while the previous page is full.
- Batch calls return a root array. A live authenticated check on 2026-08-06 confirmed the documented `items`/`total`/`page`/`limit` envelope is not present, so the connector paginates while the previous 100-item page is full.
- Workflows return `data` plus `meta.currentPage` and `meta.totalPages`.
- Agents return their complete collection at `data.agents` with no server pagination and accept no Page or Limit query parameters. The search module applies the user's Make-side result limit, while the picker RPC allows up to 500 choices.
- Batch-call detail returns paginated call logs. The connector fixes the API page size at 200, advances pages internally, and does not expose API pagination controls to scenario builders.

### Error and retry behavior

- Errors generally use `statusCode`, `message`, and `error`; `message` may be a string or array.
- Call creation is a billable side effect and must not be retried blindly after a timeout.
- Batch/workflow status changes should be reconciled with a read before retrying an ambiguous request.
- The API does not document a platform-wide idempotency key.

### Webhooks

- DialNexa provides API-based webhook registration, so the Make trigger uses a dedicated attached webhook and unregisters it on detach.
- The documented event values in release 1 are `call.completed` and `call.failed`.
- DialNexa signs the raw JSON body using HMAC-SHA256. Make's standard custom-app webhook component does not expose raw-body HMAC verification in this source bundle. The callback URL is Make-generated and unguessable, but API-side support for a challenge/token field or Make approval for a custom IML verifier would materially strengthen verification. Track this as a security review item before submission.

## Recommended release 2 order

1. List workflow leads and get lead history.
2. Get/create/update agents with catalog RPCs for voices, LLMs, languages, and transcribers.
3. List phone numbers for routing visibility.
4. Knowledge-base list/get modules.

Add one family at a time only after a successful sandbox scenario and before a scheduled public-app update review.

# Reply to Make Apps DX — DialNexa remediation

Subject: DialNexa app review — blockers fixed and fresh execution evidence

Hi Dovilė,

Thank you for the detailed review. We have corrected the DialNexa app in Make and retested the live connector.

## Corrections completed

1. **Update a workflow status:** restored the missing `PATCH /v1/workflows/{id}/status` request. Fresh successful execution: <https://eu1.make.com/2283008/scenarios/6848511/logs/8ec38b92db0d405f8950be4226b24ad2>
2. **Visibility:** all 14 release modules are visible and available in new scenarios.
3. **Get a batch call pagination:** removed Page and Page size from user inputs. The module now requests 200 call logs per page and advances internally. Fresh execution with no pagination inputs: <https://eu1.make.com/2283008/scenarios/6848387/logs/6d5f40ee41d242a3be346221f4b6f89a>
4. **Picker RPCs:** both picker limits are 500. List workflows follows the API's nested `data.data` collection and `data.meta.currentPage`/`data.meta.totalPages`. List agents returns the API's complete `data.agents` collection; the endpoint accepts no page or limit query parameters.
5. **List agents module:** confirmed the endpoint returns the complete collection in one response. The module applies the user's Make-side result limit. Fresh execution: <https://eu1.make.com/2283008/scenarios/6847236/logs/a4099182a968489cb4e5216fe4d65285>
6. **Groups:** modules now use Triggers, Agents, Calls, Batch calls, Workflows, and Other.
7. **Create a call metadata:** metadata remains required because DialNexa's `CreateCallRequest` schema requires it. An empty object is accepted by the API, so `{}` remains the safe default.
8. **Create a batch call formatting:** flattened and reformatted the input definitions. We also verified the evaluated binary CSV mapping and corrected the scenario's batch output mapping to the current `id` field.

## Fresh execution evidence

- List agents: <https://eu1.make.com/2283008/scenarios/6847236/logs/a4099182a968489cb4e5216fe4d65285>
- List batch calls: <https://eu1.make.com/2283008/scenarios/6848688/logs/20b0881079444293b5f22495aeb44874>
- List workflows (pagination): <https://eu1.make.com/2283008/scenarios/6846738/logs/51f71b6c25c0443db6de8d92bcc6fa28>
- Search calls: <https://eu1.make.com/2283008/scenarios/6848677/logs/bd90191412e6447fbd11eb1316e99a9f>
- Create a call: <https://eu1.make.com/2283008/scenarios/6847899/logs/be4ac345b9974e1692a2a5b13381ba9a>
- Get a call: <https://eu1.make.com/2283008/scenarios/6848017/logs/aa0775bf570444d297a843cdfd7573cf>
- Create a batch call and immediate Cancel: <https://eu1.make.com/2283008/scenarios/6848344/logs/a9f5ce5cdc8342e7a8b276a6b13af0b7>
- Get a batch call: <https://eu1.make.com/2283008/scenarios/6848387/logs/6d5f40ee41d242a3be346221f4b6f89a>
- Batch Pause: <https://eu1.make.com/2283008/scenarios/6848344/logs/0d10f9843d8f46e09ae42b61402a36fa>
- Batch Resume: <https://eu1.make.com/2283008/scenarios/6848479/logs/2049d86755ba4fa39014c81d0f33530c>
- Get a workflow: <https://eu1.make.com/2283008/scenarios/6847775/logs/e22f74ef8b1f423db997be235debfac8>
- Update a workflow status: <https://eu1.make.com/2283008/scenarios/6848511/logs/8ec38b92db0d405f8950be4226b24ad2>
- Upload workflow leads: <https://eu1.make.com/2283008/scenarios/6848549/logs/09f7299948ca4f20aade6d4182b5f22b>
- Make an API call: <https://eu1.make.com/2283008/scenarios/6848653/logs/c81e835625fb4be0830999732530c215>
- Deliberate 404 handling: <https://eu1.make.com/2283008/scenarios/6847838/logs/e9ee7115a61b45c58c7026eb2c57c81c>

All labels and metadata in the submitted executions are synthetic. Call tests use a reserved fictional destination. Batch tests use DialNexa-controlled test destinations, and the returned outbound number belongs to DialNexa rather than a customer.

One transparent note: a fresh `call.failed` webhook was attached successfully and tested while Make was listening, but the DialNexa backend did not emit that event. A prior controlled `call.completed` execution proves webhook attachment, delivery, and removal; it is not included in the safe list because the payload contains call content. We are treating missing `call.failed` emission as an API-side follow-up and would appreciate guidance on whether you prefer the prior controlled completed-event evidence or a new execution after that backend event is fixed.

Best regards,

Shreeyash Kanwade  
Product Ops, DialNexa  
operations@dialnexa.com

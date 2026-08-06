# Make platform audit

Audited on 2026-08-06 against Make's current Custom Apps documentation and Technology Partner pages.

## What Make requires for a directory app

| Gate | Current requirement | DialNexa implementation |
| --- | --- | --- |
| Distinct API service | The app must connect to a service Make does not already integrate, using that service's own domain and API. | DialNexa uses `api.dialnexa.com` and its own documented `/v1` API. Confirm there is no existing DialNexa directory app immediately before submission. |
| Minimal credentials | Ask only for credentials required by the API. | One password-masked API-key field containing the complete DialNexa `key_id:secret` token. |
| Connection validation | Invalid credentials must fail against a real API endpoint. | Connection validation calls `GET /v1/agents`. |
| Error handling | Base and connection both need useful API error handling. | Both surface DialNexa's `statusCode`, `message`, and `error` envelope. |
| Sensitive-data sanitization | Authorization values must not enter Make logs. | Both Base and connection sanitize `request.headers.authorization`. |
| Correct module types | Single-item responses are actions; lists are search modules; real-time delivery is an instant trigger. | Definitions follow the documented module types. |
| Correct labels and descriptions | Sentence case and verb + object labels are expected. | `Create a call`, `Search calls`, `List workflows`, `Watch call events`, etc. |
| Interfaces and samples | Every published module must expose an accurate output interface and sample. | Every release-1 module includes both. Final live tests must reconcile any fields that differ in production. |
| Limits and pagination | Search/list modules and RPCs need limits; pagination must be implemented when the API supports it. | Calls, batches, and workflows paginate according to their distinct envelopes. Agent listing is bounded because DialNexa returns the full catalog. |
| Universal module | Every reviewed app must include a REST universal module. | `Make an API call` follows Make's required label, description, URL prefix, and response shape. |
| Test scenarios | Every module must appear in at least one successful test scenario; reviewers also expect pagination evidence and a deliberate error run. | Scenario plan is in `app-review-runbook.md`. No personal or sensitive data may appear in logs. |
| Review metadata | API docs, test-scenario links, developer/vendor relationship, partnership and support contacts, categories, company logo, service URL, and compliance confirmations are requested. | API/service URLs are ready. Contacts, final categories, official logo, and authorized compliance confirmations must come from DialNexa. |

## Publication lifecycle risks

- A private app can be developed and tested without distributing it.
- Clicking **Publish** creates a distributable public custom app and cannot be undone from the app UI.
- After publication, modules and components cannot be deleted. Hide and deprecate them instead.
- Directory verification adds an automatic review followed by manual QA.
- After approval, public changes are staged in a development copy and require Make review/release.
- Make expects active maintenance, bug fixes, API-change handling, and an API checkup every six months.

These lifecycle constraints are why release 1 is deliberately smaller than the complete DialNexa API. The universal module preserves access to the remaining endpoints without committing dozens of lightly tested first-class modules to a permanent public surface.

## Technology Partner Program

Make's current public program page says:

- the program is for ISVs with a verified, published Make app;
- there is no cost to join, although program requirements still apply;
- after the app is live, the ISV submits the partner application, signs the standard agreement, and completes onboarding;
- the program advertises co-marketing/channel enablement and new revenue opportunities, but these are program benefits rather than an automatic entitlement created by app publication.

Treat partner acceptance, commercial terms, commission/revenue arrangements, and co-marketing scope as subject to Make's application and agreement.

## Primary sources

- [Custom app review prerequisites](https://developers.make.com/custom-apps-documentation/app-review/prerequisites)
- [Request an app review](https://developers.make.com/custom-apps-documentation/app-review/request-app-review)
- [App visibility](https://developers.make.com/custom-apps-documentation/create-your-first-app/app-visibility)
- [Approved-app maintenance](https://developers.make.com/custom-apps-documentation/app-maintenance/terms-of-approved-app-maintenance)
- [Technology Partner Program](https://www.make.com/en/technology-partners)
- [Make partner overview](https://www.make.com/en/partners)

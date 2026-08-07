# DialNexa for Make

This repository is the source of truth for the DialNexa public app on Make's Custom Apps platform. Make currently authors custom apps in its web editor, so each JSON file here maps directly to one editor tab instead of representing a single importable bundle.

## Release 1 scope

The first public release concentrates on the workflows most likely to be used in automations:

- watch call-completion and call-failure events;
- create, get, and search calls;
- list agents;
- create, list, get, pause, resume, and cancel batch calls;
- list, get, activate, pause, resume, and deactivate workflows, plus upload workflow leads;
- make any authorized DialNexa API call.

The universal **Make an API call** module provides immediate access to the remaining JSON-based `/v1` endpoints while additional first-class modules are phased in. Multipart file endpoints are first-class modules because they cannot be represented safely by the generic JSON request module. See [API surface audit](docs/api-surface-audit.md).

## App settings

Use these values when creating the custom app in Make:

| Setting | Value |
| --- | --- |
| App name | DialNexa |
| Theme | `#14003D` |
| Accent reference | `#7C3AED` |
| Base URL | `https://api.dialnexa.com` |
| API documentation | `https://dialnexa.com/docs/api-reference/introduction` |
| Service URL | `https://dialnexa.com` |

The theme values above were verified against DialNexa's official website on 2026-08-06. Use the repository's Make-compliant copy of the official square waveform artwork described in [assets/README.md](assets/README.md).

The remaining directory-form values are recorded in [submission metadata](docs/submission-metadata.md), with the vendor authorization text in [ownership authorization](docs/ownership-authorization.md).

## Build order in Make

1. Create the app and set its name, theme, and official logo.
2. Paste [base.json](make-app/base.json) into **Base**.
3. Create the `dialnexaApiKey` API-key connection and paste its `parameters.json` and `communication.json` files.
4. Create the two RPCs in `make-app/rpcs`.
5. Create the dedicated `callEvents` webhook and paste its four component files.
6. Create each module using the values in its `metadata.json`, then paste the remaining files into the matching tabs.
7. Keep every module private until the test and review gates in [app-review-runbook.md](docs/app-review-runbook.md) pass.

## Validation

Run:

```sh
npm run validate
```

This checks that every component is valid JSON, every module has all required editor tabs, list/search modules expose a limit, API paths use `/v1`, sensitive headers are sanitized, and the required universal module is present.

## Important release constraint

Do not click **Publish** just to test distribution. Make does not allow a published custom app to be unpublished, and published components cannot be deleted. Complete the private-app test pass first.

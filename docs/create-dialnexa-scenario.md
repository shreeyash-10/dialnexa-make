# Create a DialNexa scenario in Make

DialNexa has been successfully used in Make scenarios for single calls, batch calls, call lookups, workflows, pagination, status updates, and webhook events.

## Create a scenario

1. Sign in to [Make](https://eu1.make.com/).
2. Select the correct Make team or workspace.
3. Open **Scenarios**.
4. Click **Create a new scenario**.
5. Click the large **+** button in the scenario builder.
6. Search for **DialNexa**.
7. Select the module required by the automation.
8. Select the existing DialNexa connection or click **Add** to create one with a DialNexa API key.
9. Complete the module inputs.
10. Click **Save**, then **Run once**.
11. After the run, click the numbered bubble above the module to inspect its input and output.

## Create a single call

Add **DialNexa → Create a call** and provide:

- **Connection:** the DialNexa API-key connection.
- **Agent:** a published DialNexa agent ID.
- **Phone number:** the destination in E.164 format, such as `+91XXXXXXXXXX`.
- **Metadata:** synthetic or approved personalization data.

Example metadata:

```json
{
  "make_review": "synthetic",
  "customer_name": "Make Reviewer"
}
```

Click **Save → Run once**. A successful result returns the DialNexa Call ID, destination, and Agent ID.

## Create a batch call

Prepare a CSV containing exactly the `name` and `phone` columns:

```csv
name,phone
Test One,+91XXXXXXXXXX
Test Two,+91XXXXXXXXXX
```

Then:

1. Add **DialNexa → Create a batch call**.
2. Select the DialNexa API connection.
3. Select or enter the published agent.
4. Enter a synthetic batch name.
5. Upload the CSV file.
6. Save the module.
7. Click **Run once**.

The CSV must contain real line breaks and a header row spelled exactly `name,phone`. Do not upload a text representation of a formula as the file contents.

When manually mapping base64 test data in Make, convert it to a buffer using an evaluated expression:

```text
{{toBinary("<base64-data>"; "base64")}}
```

## Successful Create Batch evidence

The following reviewer-safe scenario contains a fresh successful two-record Create Batch execution from 2026-09-12:

- [DialNexa Create Batch scenario](https://eu1.make.com/2283008/scenarios/6848344/edit)
- Agent `agent_qzXtznGkgyvPaE`, published version 20
- Batch `batch_w6pam3j3EBzATP`, status `initiated`, two records
- The batch was cancelled successfully in the same Make execution before its scheduled start.
- [Fresh successful execution](https://eu1.make.com/2283008/scenarios/6848344/logs/a9f5ce5cdc8342e7a8b276a6b13af0b7)

Version 20 is the currently verified routing configuration for review evidence.

## If DialNexa does not appear

1. Confirm that the correct Make team is selected.
2. Open **Custom Apps → DialNexa → Modules** and confirm the intended modules are visible.
3. If using another Make account, install the app through its public sharing link while directory review is pending.
4. Refresh Make after installing the app or changing module visibility.
5. Confirm that a valid DialNexa API-key connection exists under **Credentials**.

## Troubleshooting

### The CSV returns “No valid phone numbers found”

- Confirm the header is exactly `name,phone`.
- Confirm each record is on a separate line.
- Confirm the uploaded value is a file or binary buffer, not literal formula text.
- Remove blank lines and unexpected columns.

### A single call succeeds but a batch call fails

If Create a call succeeds for the same agent but Create a batch call reports that no outbound phone number exists, report the agent ID, published agent version, and campaign ID to DialNexa engineering. This indicates a batch-endpoint outbound-number lookup issue rather than a CSV problem.

### The module returns an understandable API error

Open the module’s execution inspector and copy the HTTP status and DialNexa error message. Do not expose the API key, customer phone numbers, recordings, transcripts, or confidential metadata.

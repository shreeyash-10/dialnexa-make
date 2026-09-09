import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const appRoot = path.join(root, "make-app");
const moduleRoot = path.join(appRoot, "modules");
const logoFile = path.join(root, "assets/dialnexa-make-icon.png");
const errors = [];
const warnings = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${path.relative(root, file)} is not valid JSON: ${error.message}`);
    return null;
  }
}

function validateLogo(file) {
  if (!fs.existsSync(file)) {
    errors.push("assets/dialnexa-make-icon.png is missing.");
    return;
  }

  const logo = fs.readFileSync(file);
  const pngSignature = "89504e470d0a1a0a";
  if (logo.length < 24 || logo.subarray(0, 8).toString("hex") !== pngSignature) {
    errors.push("DialNexa's Make logo must be a valid PNG file.");
    return;
  }

  const width = logo.readUInt32BE(16);
  const height = logo.readUInt32BE(20);
  if (width !== height || width < 512 || width > 2048) {
    errors.push(`DialNexa's Make logo must be square and 512–2048 px; found ${width} × ${height}.`);
  }
  if (logo.length > 500_000) {
    errors.push(`DialNexa's Make logo must be no larger than 500 kB; found ${logo.length} bytes.`);
  }
}

validateLogo(logoFile);

for (const file of walk(appRoot).filter((candidate) => candidate.endsWith(".json"))) {
  readJson(file);
}

const base = readJson(path.join(appRoot, "base.json"));
if (base) {
  if (base.baseUrl !== "https://api.dialnexa.com") {
    errors.push("Base must use the version-neutral https://api.dialnexa.com host.");
  }
  if (!String(base.headers?.Authorization ?? "").includes("connection.apiKey")) {
    errors.push("Base must inherit the API key from the connection.");
  }
  const sanitized = (base.log?.sanitize ?? []).map((item) => String(item).toLowerCase());
  if (!sanitized.includes("request.headers.authorization")) {
    errors.push("Base must sanitize request.headers.authorization.");
  }
  if (!base.response?.error?.message) {
    errors.push("Base must define a default error message.");
  }
}

const connectionFile = path.join(appRoot, "connection/api-key/communication.json");
const connection = readJson(connectionFile);
if (connection) {
  if (!String(connection.url).startsWith("https://api.dialnexa.com/v1/")) {
    errors.push("Connection validation must call a DialNexa v1 API endpoint.");
  }
  const sanitized = (connection.log?.sanitize ?? []).map((item) => String(item).toLowerCase());
  if (!sanitized.includes("request.headers.authorization")) {
    errors.push("Connection must sanitize request.headers.authorization.");
  }
  if (!connection.response?.error?.message) {
    errors.push("Connection must define credential-validation error handling.");
  }
}

const requiredTabs = [
  "metadata.json",
  "communication.json",
  "static-parameters.json",
  "mappable-parameters.json",
  "interface.json",
  "samples.json"
];

const moduleDirectories = fs.readdirSync(moduleRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(moduleRoot, entry.name));

const names = new Set();
let universalCount = 0;
const metadataByName = new Map();

for (const directory of moduleDirectories) {
  const relativeDirectory = path.relative(root, directory);
  for (const tab of requiredTabs) {
    if (!fs.existsSync(path.join(directory, tab))) {
      errors.push(`${relativeDirectory} is missing ${tab}.`);
    }
  }

  const metadata = readJson(path.join(directory, "metadata.json"));
  const communication = readJson(path.join(directory, "communication.json"));
  const parameters = readJson(path.join(directory, "mappable-parameters.json"));
  const moduleInterface = readJson(path.join(directory, "interface.json"));
  if (!metadata || !communication || !parameters || !moduleInterface) continue;

  for (const property of ["name", "label", "description", "type"]) {
    if (!metadata[property]) errors.push(`${relativeDirectory}/metadata.json is missing ${property}.`);
  }
  if (names.has(metadata.name)) errors.push(`Duplicate module name: ${metadata.name}.`);
  names.add(metadata.name);
  metadataByName.set(metadata.name, metadata);

  if (metadata.type === "universal") {
    universalCount += 1;
    if (metadata.label !== "Make an API call") {
      errors.push("The REST universal module label must be “Make an API call”.");
    }
    if (metadata.description !== "Performs an arbitrary authorized API call.") {
      errors.push("The REST universal module description does not match Make's required wording.");
    }
  } else if (typeof communication.url === "string" && !communication.url.startsWith("/v1/")) {
    errors.push(`${relativeDirectory}/communication.json must use a partial /v1 API URL.`);
  }

  if (["search", "trigger"].includes(metadata.type)) {
    if (!parameters.some((parameter) => parameter.name === "limit")) {
      errors.push(`${metadata.name} must expose a limit parameter.`);
    }
    if (!communication.response?.limit) {
      errors.push(`${metadata.name} must apply response.limit.`);
    }
    const limit = parameters.find((parameter) => parameter.name === "limit");
    if (limit && (limit.required !== false || limit.default !== 10)) {
      errors.push(`${metadata.name}.limit must be optional with a default of 10.`);
    }
  }

  const lastStandard = parameters.filter((parameter) => !parameter.advanced).at(-1);
  if (["search", "trigger"].includes(metadata.type) && lastStandard?.name !== "limit") {
    errors.push(`${metadata.name} must place Limit last among standard parameters.`);
  }

  for (const parameter of parameters) {
    if (parameter.type === "collection" && !Array.isArray(parameter.spec)) {
      warnings.push(`${metadata.name}.${parameter.name} is an open collection; prefer JSON or a defined spec.`);
    }
  }

  for (const field of moduleInterface) {
    if (/(^|_)(created|updated)(_at)?$|createdAt|updatedAt/i.test(field.name) && field.type !== "date") {
      warnings.push(`${metadata.name}.${field.name} looks like a date but is typed ${field.type}.`);
    }
  }
}

const expectedCrud = {
  createCall: "create",
  createBatchCall: "create",
  getCall: "read",
  getBatchCall: "read",
  getWorkflow: "read",
  updateBatchCallStatus: "update",
  updateWorkflowStatus: "update",
  uploadWorkflowLeads: "create"
};
for (const [name, actionCrud] of Object.entries(expectedCrud)) {
  if (metadataByName.get(name)?.actionCrud !== actionCrud) {
    errors.push(`${name} must set actionCrud to ${actionCrud}.`);
  }
}

const groups = readJson(path.join(appRoot, "groups.json"));
if (groups) {
  const categorized = groups.flatMap((group) => group.modules ?? []);
  for (const name of names) {
    if (!categorized.includes(name)) errors.push(`${name} is not categorized in groups.json.`);
  }
  for (const name of categorized) {
    if (!names.has(name)) errors.push(`groups.json references unknown module ${name}.`);
  }
}

const regressionChecks = [
  ["modules/list-agents/communication.json", "response.iterate", "{{ifempty(body.data.agents, body.agents)}}"],
  ["rpcs/list-agents/communication.json", "response.iterate", "{{ifempty(body.data.agents, body.agents)}}"],
  ["modules/list-workflows/communication.json", "response.iterate", "{{body.data}}"],
  ["rpcs/list-workflows/communication.json", "response.iterate", "{{body.data}}"],
  ["modules/list-batch-calls/communication.json", "response.iterate", "{{body.items}}"],
  ["modules/get-workflow/communication.json", "response.output", "{{body.data}}"],
  ["modules/update-workflow-status/communication.json", "response.output", "{{body.data}}"]
];
for (const [relativeFile, propertyPath, expected] of regressionChecks) {
  const value = propertyPath.split(".").reduce((current, key) => current?.[key], readJson(path.join(appRoot, relativeFile)));
  if (value !== expected) errors.push(`${relativeFile} must set ${propertyPath} to ${expected}.`);
}

const workflowStatus = readJson(path.join(appRoot, "modules/update-workflow-status/communication.json"));
if (workflowStatus?.method !== "PATCH" || workflowStatus?.body?.action !== "{{parameters.action}}") {
  errors.push("updateWorkflowStatus must PATCH the requested action.");
}

const getBatchParameters = readJson(path.join(appRoot, "modules/get-batch-call/mappable-parameters.json"));
const getBatchCommunication = readJson(path.join(appRoot, "modules/get-batch-call/communication.json"));
if (getBatchParameters?.some((parameter) => ["page", "pageSize", "limit"].includes(parameter.name))) {
  errors.push("getBatchCall must not expose API pagination controls to users.");
}
if (!getBatchCommunication?.pagination?.qs?.page || !getBatchCommunication?.pagination?.condition) {
  errors.push("getBatchCall must paginate call logs internally.");
}

const listAgentsRpc = readJson(path.join(appRoot, "rpcs/list-agents/communication.json"));
const listWorkflowsRpc = readJson(path.join(appRoot, "rpcs/list-workflows/communication.json"));
for (const [name, rpc] of [["listAgents", listAgentsRpc], ["listWorkflows", listWorkflowsRpc]]) {
  const limit = Number(rpc?.response?.limit);
  if (limit < 300 || limit > 500) {
    errors.push(`${name} RPC response.limit must be between 300 and 500.`);
  }
}
if (!listWorkflowsRpc?.pagination?.qs?.page || !listWorkflowsRpc?.pagination?.condition) {
  errors.push("listWorkflows RPC must paginate workflow choices internally.");
}

const createCallParameters = readJson(path.join(appRoot, "modules/create-call/mappable-parameters.json"));
const metadataParameter = createCallParameters?.find((parameter) => parameter.name === "metadata");
if (metadataParameter?.required !== true || metadataParameter?.default !== "{}") {
  errors.push("createCall metadata must remain required with a valid empty-object default.");
}

const webhookAttach = readJson(path.join(appRoot, "webhooks/call-events/attach.json"));
if (!String(webhookAttach?.body?.secret ?? "").includes("connection.apiKey")) {
  errors.push("Call-events webhook secret must use connection.apiKey.");
}

if (universalCount !== 1) {
  errors.push(`Expected exactly one universal module; found ${universalCount}.`);
}

const webhookRoot = path.join(appRoot, "webhooks/call-events");
for (const file of ["metadata.json", "parameters.json", "attach.json", "detach.json", "communication.json"]) {
  if (!fs.existsSync(path.join(webhookRoot, file))) {
    errors.push(`Call-events webhook is missing ${file}.`);
  }
}

if (warnings.length) {
  console.warn(`Warnings (${warnings.length}):`);
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
  console.error(`Validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${moduleDirectories.length} modules and ${walk(appRoot).filter((file) => file.endsWith(".json")).length} JSON components.`);

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const appRoot = path.join(root, "make-app");
const moduleRoot = path.join(appRoot, "modules");
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

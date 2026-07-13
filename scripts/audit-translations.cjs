#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const srcDir = path.join(root, "src");
const localeDir = path.join(srcDir, "locales");
const localeFiles = ["en.json", "ar.json"];
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : 30;
const showAll = process.argv.includes("--all");

const sourceExtensions = new Set([".vue", ".js", ".ts", ".jsx", ".tsx"]);
const directKeys = new Set();
const uiFieldKeys = new Set();
const dynamicCalls = [];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function flattenMessages(value, prefix = "", output = {}) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      flattenMessages(child, nextPrefix, output);
    }
    return output;
  }

  output[prefix] = value;
  return output;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (fullPath === localeDir) continue;
      walk(fullPath, files);
      continue;
    }

    if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function decodeStringLiteral(raw) {
  return raw
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\`/g, "`")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function lineNumberForIndex(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function addLiteral(set, quote, raw) {
  if (quote === "`" && raw.includes("${")) return false;
  const value = decodeStringLiteral(raw).trim();
  if (!value) return false;
  set.add(value);
  return true;
}

function scanFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const rel = path.relative(root, filePath);

  const directCall =
    /(?:\$t|(?<![\w$])t|i18n(?:\.global)?\.t|i18n\.t)\s*\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  let match;
  while ((match = directCall.exec(text))) {
    addLiteral(directKeys, match[1], match[2]);
  }

  const callStart = /(?:\$t|(?<![\w$])t|i18n(?:\.global)?\.t|i18n\.t)\s*\(/g;
  while ((match = callStart.exec(text))) {
    const rest = text.slice(match.index, match.index + 160);
    if (!/^\w*\.?\w*\s*\(\s*['"`]/.test(rest.replace(/^.*?(?:\$t|(?<![\w$])t|i18n(?:\.global)?\.t|i18n\.t)/, ""))) {
      dynamicCalls.push(`${rel}:${lineNumberForIndex(text, match.index)}`);
    }
  }

  const uiField =
    /\b(?:label|title|pageTitle|placeholder|header|acceptLabel|rejectLabel)\s*:\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  while ((match = uiField.exec(text))) {
    addLiteral(uiFieldKeys, match[1], match[2]);
  }
}

function difference(left, right) {
  return [...left].filter((value) => !right.has(value)).sort((a, b) => a.localeCompare(b));
}

function printList(title, items) {
  const visible = showAll ? items : items.slice(0, limit);
  console.log(`\n${title}: ${items.length}`);
  for (const item of visible) {
    console.log(`  - ${item}`);
  }
  if (!showAll && items.length > visible.length) {
    console.log(`  ... ${items.length - visible.length} more. Use --all to print everything.`);
  }
}

for (const file of walk(srcDir)) {
  scanFile(file);
}

const localeMaps = Object.fromEntries(
  localeFiles.map((file) => {
    const messages = flattenMessages(readJson(path.join(localeDir, file)));
    return [file, new Set(Object.keys(messages))];
  })
);

const conservativeKeys = new Set([...directKeys, ...uiFieldKeys]);

console.log("Translation audit");
console.log(`Source files scanned: ${walk(srcDir).length}`);
console.log(`Direct literal t/$t keys: ${directKeys.size}`);
console.log(`Conservative UI field keys: ${uiFieldKeys.size}`);
console.log(`Dynamic translation calls needing manual review: ${dynamicCalls.length}`);

for (const [file, keys] of Object.entries(localeMaps)) {
  printList(`${file} missing direct literal keys`, difference(directKeys, keys));
  printList(`${file} maybe unused after conservative scan`, difference(keys, conservativeKeys));
}

printList("Dynamic translation call locations", dynamicCalls);

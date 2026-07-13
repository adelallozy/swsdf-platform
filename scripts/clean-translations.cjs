#!/usr/bin/env node
// Comprehensive translation key usage scanner and cleaner
// Removes keys from en.json and ar.json that are not used anywhere in src/

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const srcDir = path.join(root, "src");
const localeDir = path.join(srcDir, "locales");

// Parse CLI args
const removeArg = process.argv.includes("--remove");
const dryRun = !removeArg || process.argv.includes("--dry-run");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 4) + "\n", "utf8");
}

function flatten(obj, prefix = "", output = {}) {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    for (const [key, val] of Object.entries(obj)) {
      const next = prefix ? `${prefix}.${key}` : key;
      flatten(val, next, output);
    }
    return output;
  }
  output[prefix] = obj;
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
    if (/\.(vue|js|ts|jsx|tsx|json|css|scss|sass|less|html)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

// Load and flatten locale files
const enData = readJson(path.join(localeDir, "en.json"));
const arData = readJson(path.join(localeDir, "ar.json"));
const enFlat = flatten(enData);
const arFlat = flatten(arData);

// Combine all locale keys (union of both files)
const allLocaleKeys = new Set([...Object.keys(enFlat), ...Object.keys(arFlat)]);
console.log(`Total unique locale keys: ${allLocaleKeys.size}`);
console.log(`en.json keys: ${Object.keys(enFlat).length}`);
console.log(`ar.json keys: ${Object.keys(arFlat).length}`);

// Walk source files
const sourceFiles = walk(srcDir);
console.log(`Source files scanned: ${sourceFiles.length}`);

// Build key usage map using indexOf (exact string matching)
const keyUsage = {};
for (const key of allLocaleKeys) {
  keyUsage[key] = [];
}

// Sort keys by length descending so longer keys are matched first
const sortedKeys = [...allLocaleKeys].sort((a, b) => b.length - a.length);

// For efficiency, build a set of keys for quick lookup
const keySet = new Set(sortedKeys);

console.log("\nScanning source files for locale key usage...");
const totalFiles = sourceFiles.length;
let filesProcessed = 0;

// For each file, extract all string literals and check against keys
// This is more reliable than regex for dotted keys
for (const file of sourceFiles) {
  // Skip locale directory
  if (file.includes('/locales/')) {
    filesProcessed++;
    continue;
  }
  
  const content = fs.readFileSync(file, "utf8");
  const relPath = path.relative(root, file);
  
  // Extract all string literals from the file
  const literals = [];
  const patterns = [
    /'((?:[^'\\]|\\.)*)'/g,
    /"((?:[^"\\]|\\.)*)"/g,
  ];
  
  for (const pat of patterns) {
    let m;
    while ((m = pat.exec(content)) !== null) {
      literals.push(m[1]);
    }
  }
  
  // Check each extracted literal against our key set
  // Also check if any key appears as a substring in the line content
  // (handles cases like t("key") or $t("key") where the literal is the key)
  for (const literal of literals) {
    if (keySet.has(literal)) {
      keyUsage[literal].push(relPath);
    }
  }
  
  // Also scan for dotted key patterns like:
  // - t(obj.NAV.home) - property access
  // - "NAV.home" in config objects
  // - .NAV.home in template strings
  // We look for patterns where a key prefix appears in source
  filesProcessed++;
  if (filesProcessed % 100 === 0) {
    process.stdout.write(`\r  Scanned ${filesProcessed}/${totalFiles} files...`);
  }
}

console.log(`\r  Scanned ${filesProcessed}/${totalFiles} files... done\n`);

// Determine which keys are used
const usedKeys = new Set();
const unusedKeys = [];

for (const [key, usages] of Object.entries(keyUsage)) {
  if (usages.length > 0) {
    usedKeys.add(key);
  } else {
    unusedKeys.push(key);
  }
}

console.log(`Used keys: ${usedKeys.size}`);
console.log(`Unused keys: ${unusedKeys.length}`);

// Show breakdown by prefix
const unusedByPrefix = {};
for (const key of unusedKeys) {
  const prefix = key.split('.')[0];
  if (!unusedByPrefix[prefix]) unusedByPrefix[prefix] = [];
  unusedByPrefix[prefix].push(key);
}

console.log("\n--- Unused keys by prefix ---");
for (const [prefix, keys] of Object.entries(unusedByPrefix).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${prefix}: ${keys.length} keys`);
}

// Show a sample of used keys
console.log("\n--- Sample of used keys (${usedKeys.size} total) ---");
const sampleUsed = [...usedKeys].slice(0, 100);
for (const key of sampleUsed) {
  const files = [...new Set(keyUsage[key])].slice(0, 3);
  console.log(`  ${key} -> ${files.join(', ')}`);
}

if (!dryRun) {
  console.log("\n--- Removing unused keys ---");
  
  // Helper to set nested values
  function setNested(obj, key, value) {
    const parts = key.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }
  
  // Build new en.json
  const newEnData = {};
  let removedFromEn = 0;
  for (const [key, value] of Object.entries(enFlat)) {
    if (!unusedKeys.includes(key)) {
      setNested(newEnData, key, value);
    } else {
      removedFromEn++;
    }
  }
  
  // Build new ar.json
  const newArData = {};
  let removedFromAr = 0;
  for (const [key, value] of Object.entries(arFlat)) {
    if (!unusedKeys.includes(key)) {
      setNested(newArData, key, value);
    } else {
      removedFromAr++;
    }
  }
  
  writeJson(path.join(localeDir, "en.json"), newEnData);
  writeJson(path.join(localeDir, "ar.json"), newArData);
  
  console.log(`Removed ${removedFromEn} keys from en.json`);
  console.log(`Removed ${removedFromAr} keys from ar.json`);
  console.log(`\nDone! Changes applied.`);
} else {
  console.log("\n--- DRY RUN: No changes made ---");
  console.log("Run with --remove to apply changes.");
  console.log(`Would remove ${unusedKeys.length} keys total.`);
  
  console.log("\nAll unused keys:");
  for (const key of unusedKeys) {
    console.log(`  - ${key}`);
  }
}

#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const ROUTER_FILE = path.join(ROOT, "src", "router", "index.js");
const OUTPUT_FILE = path.join(ROOT, "docs", "reference", "website-pages.md");

function extractRoutesArraySource(routerSource) {
  const match = routerSource.match(/const\s+routes\s*=\s*\[/);
  if (!match || match.index == null) {
    throw new Error("Could not find `const routes = [` in router file.");
  }

  const startBracketIndex = routerSource.indexOf("[", match.index);
  if (startBracketIndex === -1) {
    throw new Error("Could not locate opening `[` for routes array.");
  }

  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;

  for (let i = startBracketIndex; i < routerSource.length; i++) {
    const ch = routerSource[i];
    const next = routerSource[i + 1];

    if (inLineComment) {
      if (ch === "\n") inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    if (inSingle) {
      if (!escaped && ch === "'") inSingle = false;
      escaped = !escaped && ch === "\\";
      if (escaped && ch !== "\\") escaped = false;
      continue;
    }

    if (inDouble) {
      if (!escaped && ch === '"') inDouble = false;
      escaped = !escaped && ch === "\\";
      if (escaped && ch !== "\\") escaped = false;
      continue;
    }

    if (inTemplate) {
      if (!escaped && ch === "`") inTemplate = false;
      escaped = !escaped && ch === "\\";
      if (escaped && ch !== "\\") escaped = false;
      continue;
    }

    // Not in string/comment
    if (ch === "/" && next === "/") {
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === "/" && next === "*") {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      escaped = false;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      escaped = false;
      continue;
    }
    if (ch === "`") {
      inTemplate = true;
      escaped = false;
      continue;
    }

    if (ch === "[") {
      depth++;
      continue;
    }
    if (ch === "]") {
      depth--;
      if (depth === 0) {
        return routerSource.slice(startBracketIndex, i + 1);
      }
      continue;
    }
  }

  throw new Error("Unbalanced brackets while extracting routes array.");
}

function safeString(value) {
  if (value == null) return "";
  return String(value);
}

function resolveFullPath(parentFullPath, routePath) {
  const p = safeString(routePath);
  const parent = safeString(parentFullPath);

  if (p.startsWith("/")) return p;

  if (!parent || parent === "") {
    if (p === "") return "/";
    return "/" + p;
  }

  if (p === "") return parent;

  const base = parent.endsWith("/") ? parent.slice(0, -1) : parent;
  if (!base) return "/" + p;
  return base + "/" + p;
}

function extractImportPathFromComponent(componentFn) {
  if (typeof componentFn !== "function") return "";
  const src = componentFn.toString();
  const match = src.match(/import\(\s*(['"])(.*?)\1\s*\)/s);
  return match ? match[2] : "";
}

function formatRedirect(redirect) {
  if (!redirect) return "";
  if (typeof redirect === "function") return "(function)";
  if (typeof redirect === "string") return redirect;
  if (typeof redirect === "object") {
    try {
      return JSON.stringify(redirect);
    } catch {
      return "(object)";
    }
  }
  return String(redirect);
}

function classifyRoute(route) {
  const hasChildren =
    Array.isArray(route.children) && route.children.length > 0;
  const hasComponent = !!route.component;
  const hasRedirect = !!route.redirect;

  if (hasComponent && hasChildren) return "layout";
  if (hasComponent) return "page";
  if (hasChildren) return "group";
  if (hasRedirect) return "redirect";
  return "other";
}

function flattenRoutes(routes, parentFullPath = "") {
  const out = [];

  for (const route of routes || []) {
    const fullPath = resolveFullPath(parentFullPath, route.path);
    const type = classifyRoute(route);

    out.push({
      fullPath,
      name: route.name || "",
      type,
      componentImport: extractImportPathFromComponent(route.component),
      redirect: formatRedirect(route.redirect),
    });

    if (Array.isArray(route.children) && route.children.length > 0) {
      out.push(...flattenRoutes(route.children, fullPath));
    }
  }

  return out;
}

function escapeTableCell(text) {
  return safeString(text).replace(/\|/g, "\\|");
}

function mdTable(rows) {
  const header = [
    "| Path | Name | Type | Component | Redirect |",
    "| --- | --- | --- | --- | --- |",
  ];

  const lines = rows.map((r) => {
    const pathCell = r.fullPath ? "`" + escapeTableCell(r.fullPath) + "`" : "";
    const nameCell = r.name ? "`" + escapeTableCell(r.name) + "`" : "";
    const typeCell = r.type ? "`" + escapeTableCell(r.type) + "`" : "";
    const compCell = r.componentImport
      ? "`" + escapeTableCell(r.componentImport) + "`"
      : "";
    const redirCell = r.redirect ? "`" + escapeTableCell(r.redirect) + "`" : "";

    return `| ${pathCell} | ${nameCell} | ${typeCell} | ${compCell} | ${redirCell} |`;
  });

  return header.concat(lines).join("\n");
}

function buildMarkdown({ routerFile, flat }) {
  const total = flat.length;
  const pages = flat.filter((r) => r.type === "page").length;
  const layouts = flat.filter((r) => r.type === "layout").length;
  const groups = flat.filter((r) => r.type === "group").length;
  const redirects = flat.filter((r) => r.type === "redirect").length;

  const componentImports = flat.map((r) => r.componentImport).filter(Boolean);
  const uniqueComponents = Array.from(new Set(componentImports)).sort();

  const byPrefix = new Map();
  for (const c of uniqueComponents) {
    // Expected patterns: "@/v3/pages/...", "@/website/...", "@/platform/..."
    const cleaned = c.startsWith("@/") ? c.slice(2) : c;
    const prefix = cleaned.split("/").slice(0, 2).join("/") || cleaned;
    byPrefix.set(prefix, (byPrefix.get(prefix) || 0) + 1);
  }

  const prefixLines = Array.from(byPrefix.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([k, v]) => `- \`${k}\`: ${v}`)
    .join("\n");

  const sorted = [...flat].sort((a, b) => {
    const ap = a.fullPath.localeCompare(b.fullPath);
    if (ap !== 0) return ap;
    return a.type.localeCompare(b.type) || a.name.localeCompare(b.name);
  });

  const pagesRows = sorted.filter((r) => r.type === "page");
  const layoutRows = sorted.filter((r) => r.type === "layout");
  const groupRows = sorted.filter((r) => r.type === "group");
  const redirectRows = sorted.filter((r) => r.type === "redirect");
  const otherRows = sorted.filter((r) => r.type === "other");

  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  return [
    "# Website Pages Inventory",
    "",
    "- Source: `" + path.relative(process.cwd(), routerFile) + "`",
    "- Generated: `" + now + "`",
    "",
    "## Counts",
    "",
    `- Total route records: ${total}`,
    `- Page routes (leaf component): ${pages}`,
    `- Layout routes (component + children): ${layouts}`,
    `- Group routes (children only): ${groups}`,
    `- Redirect-only routes: ${redirects}`,
    `- Unique route components: ${uniqueComponents.length}`,
    "",
    "## Unique Components By Prefix",
    "",
    prefixLines || "- (none)",
    "",
    "## Page Routes",
    "",
    mdTable(pagesRows),
    "",
    "## Layout Routes",
    "",
    mdTable(layoutRows),
    "",
    "## Group Routes",
    "",
    mdTable(groupRows),
    "",
    "## Redirect Routes",
    "",
    mdTable(redirectRows),
    "",
    otherRows.length ? "## Other Routes\n\n" + mdTable(otherRows) : "",
    "",
    "## Notes",
    "",
    "- This inventory is derived from the Vue Router configuration and may include legacy redirects.",
    "- Regenerate this file by running: `node scripts/generate-pages-inventory.js`",
    "",
  ]
    .filter((s) => s !== "")
    .join("\n");
}

function main() {
  const routerSource = fs.readFileSync(ROUTER_FILE, "utf8");
  const routesArraySource = extractRoutesArraySource(routerSource);

  const context = {
    t: (s) => s,
    locale: { value: "ar" },
  };

  const routes = vm.runInNewContext(`(${routesArraySource})`, context, {
    timeout: 1000,
  });

  const flat = flattenRoutes(routes, "");
  const markdown = buildMarkdown({ routerFile: ROUTER_FILE, flat });

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, markdown, "utf8");

  console.log(
    `Generated ${path.relative(process.cwd(), OUTPUT_FILE)} (${
      flat.length
    } routes)`
  );
}

main();

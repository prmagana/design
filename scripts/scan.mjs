// Shallow-clones each tapt repo from GitHub, reads what it actually uses, writes data/system.json.
// Node + git only. Runs before every build so the page reports the system as it is, not as we wish.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, relative } from "node:path";

const OWNER = "prmagana";
const REPOS = ["root", "migrate", "tracker", "player", "former", "booker"];
const SKIP = new Set(["node_modules", ".git", ".next", ".open-next", ".wrangler"]);
const SOURCE_EXT = new Set([".tsx", ".ts", ".css", ".svg"]);

// Tailwind's palette, parsed from its own theme file so zinc-200 resolves to the real oklch value.
const PALETTE = Object.fromEntries(
  [...readFileSync("node_modules/tailwindcss/theme.css", "utf8").matchAll(/--color-([a-z]+(?:-\d+)?):\s*([^;]+);/g)]
    .map(([, name, value]) => [name, value.trim()]),
);

const COLOR_PREFIX = "bg|text|border|ring|fill|stroke|outline|divide|shadow|from|to|via|accent|caret|decoration|placeholder";
const PALETTE_RE = new RegExp(String.raw`\b(?:${COLOR_PREFIX})-((?:${Object.keys(PALETTE).join("|")})(?:/\d+)?)\b`, "g");
const LUCIDE_RE = /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*["']lucide-react["']/g;
const LITERAL_RE = /#[0-9a-fA-F]{3,8}\b|oklch\([^)]*\)/g;

function sh(args, cwd) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim();
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else if (SOURCE_EXT.has(extname(entry.name))) out.push(path);
  }
  return out;
}

// Walks the braces so each --token knows its block; "dark" anywhere up the stack means the dark theme.
// @theme blocks are skipped: those are Tailwind's aliases of the tokens, not the tokens themselves.
function cssTokens(src) {
  const out = { light: {}, dark: {} };
  const stack = [];
  let buf = "";
  for (const c of src.replace(/\/\*[\s\S]*?\*\//g, "")) {
    if (c === "{") { stack.push(buf.trim()); buf = ""; }
    else if (c === "}") { stack.pop(); buf = ""; }
    else if (c === ";") {
      const m = buf.match(/--([a-z][\w-]*)\s*:\s*(.+)/is);
      const inTheme = stack.some((s) => s.startsWith("@theme"));
      if (m && stack.length && !inTheme && /^(#|oklch\(|oklab\(|rgb|hsl|color-mix\(|var\()/.test(m[2].trim())) {
        out[stack.some((s) => /dark/.test(s)) ? "dark" : "light"][m[1]] = m[2].trim();
      }
      buf = "";
    } else buf += c;
  }
  return out;
}

// Resolves "zinc-200" or "black/10" to a CSS color the page can paint directly.
function resolvePalette(cls) {
  const [name, alpha] = cls.split("/");
  const base = PALETTE[name];
  return alpha ? `color-mix(in oklab, ${base} ${alpha}%, transparent)` : base;
}

function scanRepo(name) {
  const dir = mkdtempSync(join(tmpdir(), `tapt-scan-${name}-`));
  try {
    sh(["clone", "--quiet", "--depth", "1", `https://github.com/${OWNER}/${name}.git`, dir]);
    const sha = sh(["rev-parse", "--short", "HEAD"], dir);
    const files = walk(dir).map((p) => ({ path: relative(dir, p).replaceAll("\\", "/"), src: readFileSync(p, "utf8") }));

    const lucide = new Map(); // icon name -> file count
    const inline = [];
    const palette = new Map(); // class -> occurrence count
    const literals = new Map();
    let tokens = { light: {}, dark: {} };

    for (const { path, src } of files) {
      const ext = extname(path);
      if (ext === ".svg" || (ext === ".tsx" && src.includes("<svg"))) inline.push(path);
      if (ext === ".css") {
        const t = cssTokens(src);
        tokens = { light: { ...tokens.light, ...t.light }, dark: { ...tokens.dark, ...t.dark } };
      }
      if (ext !== ".tsx" && ext !== ".ts") continue;
      for (const [, names] of src.matchAll(LUCIDE_RE)) {
        for (const raw of names.split(",")) {
          const n = raw.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0];
          if (n && !n.startsWith("Lucide")) lucide.set(n, (lucide.get(n) ?? 0) + 1); // LucideProps etc. are types
        }
      }
      for (const [, cls] of src.matchAll(PALETTE_RE)) palette.set(cls, (palette.get(cls) ?? 0) + 1);
      for (const [raw] of src.matchAll(LITERAL_RE)) { const lit = raw.toLowerCase(); literals.set(lit, (literals.get(lit) ?? 0) + 1); }
    }

    // Token usage in class strings, e.g. bg-surface, counted against the names this repo's CSS defines.
    const tokenNames = Object.keys(tokens.light);
    const tokenUses = Object.fromEntries(tokenNames.map((t) => [t, 0]));
    if (tokenNames.length) {
      const re = new RegExp(String.raw`\b(?:${COLOR_PREFIX})-(${tokenNames.join("|")})(?:/\d+)?\b`, "g");
      for (const { path, src } of files) if (path.endsWith(".tsx")) for (const [, t] of src.matchAll(re)) tokenUses[t]++;
    }

    console.log(`${name.padEnd(8)} ${sha}  ${files.length} files  ${lucide.size} lucide  ${tokenNames.length} tokens  ${palette.size} palette`);
    return { name, sha, files: files.length, lucide, inline, tokens, tokenUses, palette, literals };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// Collapses a per-repo map into one list keyed by item, with the repos (and counts) behind each.
function merge(repos, pick) {
  const out = new Map();
  for (const r of repos) for (const [key, count] of pick(r)) {
    if (!out.has(key)) out.set(key, []);
    out.get(key).push({ repo: r.name, count });
  }
  return [...out].sort(([a], [b]) => a.localeCompare(b)).map(([key, uses]) => ({ key, uses }));
}

const repos = REPOS.map(scanRepo);

const tokenNames = [...new Set(repos.flatMap((r) => Object.keys(r.tokens.light)))].sort();
const system = {
  scannedAt: new Date().toISOString(),
  repos: repos.map(({ name, sha, files }) => ({ name, sha, files })),
  icons: {
    lucide: merge(repos, (r) => r.lucide).map(({ key, uses }) => ({ name: key, uses })),
    inline: repos.flatMap((r) => r.inline.map((file) => ({ repo: r.name, file }))),
  },
  colors: {
    tokens: tokenNames.map((name) => ({
      name,
      repos: repos
        .filter((r) => name in r.tokens.light)
        .map((r) => ({ repo: r.name, light: r.tokens.light[name], dark: r.tokens.dark[name] ?? null, count: r.tokenUses[name] })),
    })),
    palette: merge(repos, (r) => r.palette).map(({ key, uses }) => ({ class: key, value: resolvePalette(key), uses })),
    literals: merge(repos, (r) => r.literals).map(({ key, uses }) => ({ value: key, uses })),
  },
};

writeFileSync("data/system.json", JSON.stringify(system, null, 2) + "\n");
console.log(`wrote data/system.json`);

/**
 * extract-answers.js
 * Reads each KSR.pdf in assets/cermat/cj/ and tries to extract answer keys.
 * Outputs assets/cermat/cj/answers.json  { "2025-jaro": ["A","B","C",...], ... }
 *
 * Run:   node extract-answers.js
 * Needs: npm install pdf-parse  (run once from project root)
 *
 * NOTE: CERMAT KSR PDFs contain answer tables in various formats.
 *       This script uses pattern matching to find them.
 *       If extraction fails for a test, that test is skipped (manual entry needed).
 */

"use strict";

const fs = require("fs");
const path = require("path");
let PDFParse;
try {
  const mod = require("pdf-parse");
  // pdf-parse v2 exports { PDFParse, ... }; v1 exports the function directly
  PDFParse = mod.PDFParse || mod.default || mod;
  if (typeof PDFParse !== "function")
    throw new Error("unexpected export shape");
} catch (e) {
  console.error(
    "pdf-parse not installed or wrong version. Run: npm install pdf-parse",
  );
  console.error(e.message);
  process.exit(1);
}

async function pdfParse(buf) {
  const p = new PDFParse({ data: buf });
  return p.getText();
}

const BASE = path.join(__dirname, "assets", "cermat", "cj");
const CATALOG = path.join(BASE, "catalog.json");
const OUTPUT = path.join(BASE, "answers.json");

// Try to load existing output so we can merge (use --force to re-extract all)
const force = process.argv.includes("--force");
let existing = {};
if (!force && fs.existsSync(OUTPUT)) {
  try {
    existing = JSON.parse(fs.readFileSync(OUTPUT, "utf8"));
  } catch (_) {}
}

const catalog = JSON.parse(fs.readFileSync(CATALOG, "utf8"));

// CERMAT KSR PDFs use pdf-parse's tab-cell format:
//   "N \tA \t1\n"  — question N has answer A worth 1 point (MCQ)
//   "N \tAno \t1\n" / "N \tNe \t1\n" — yes/no type
// Compound/open questions have no letter answer — they get null in the array.
function extractFromText(text) {
  const answers = {};

  // Pattern 1: MCQ single letter A-E (case insensitive)
  const p1 = /^(\d{1,2}) \t([A-Ea-e]) \t\d/gm;
  let m;
  while ((m = p1.exec(text)) !== null) {
    const n = parseInt(m[1], 10);
    if (n >= 1 && n <= 32) answers[n] = m[2].toUpperCase();
  }

  // Pattern 2: Ano / Ne answers
  const p2 = /^(\d{1,2}) \t(Ano|Ne) \t\d/gim;
  while ((m = p2.exec(text)) !== null) {
    const n = parseInt(m[1], 10);
    if (n >= 1 && n <= 32 && !answers[n]) {
      answers[n] = m[2].charAt(0).toUpperCase() + m[2].slice(1).toLowerCase();
    }
  }

  // If we got at least 8 answers, likely valid (many questions are open/compound)
  const count = Object.keys(answers).length;
  if (count < 8) return null;

  // Build array indexed 0-based (position i = question i+1); cap at 32 questions
  const arr = [];
  for (let i = 1; i <= 32; i++) {
    arr.push(answers[i] || null);
  }
  return arr;
}

async function run() {
  const result = { ...existing };
  let extracted = 0,
    failed = 0,
    skipped = 0;

  for (const test of catalog) {
    if (result[test.id]) {
      console.log(`  SKIP  ${test.id}  (already in answers.json)`);
      skipped++;
      continue;
    }

    const ksrFile = test.files && test.files.ksr;
    const ksrPath = ksrFile && ksrFile.local;
    if (!ksrPath) {
      console.log(`  MISS  ${test.id}  (no KSR path in catalog)`);
      failed++;
      continue;
    }

    const abs = path.join(__dirname, ksrPath);
    if (!fs.existsSync(abs)) {
      console.log(`  MISS  ${test.id}  (file not found: ${ksrPath})`);
      failed++;
      continue;
    }

    try {
      const buf = fs.readFileSync(abs);
      const data = await pdfParse(buf);
      const arr = extractFromText(data.text);
      if (arr) {
        result[test.id] = arr;
        console.log(
          `  OK    ${test.id}  (${arr.filter(Boolean).length} answers)`,
        );
        extracted++;
      } else {
        console.log(`  FAIL  ${test.id}  (pattern not found in KSR text)`);
        failed++;
      }
    } catch (e) {
      console.log(`  ERR   ${test.id}  (${e.message})`);
      failed++;
    }
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(result, null, 2), "utf8");
  console.log("\nDone.");
  console.log("  Extracted: " + extracted);
  console.log("  Skipped:   " + skipped);
  console.log("  Failed:    " + failed);
  console.log("Output: " + OUTPUT);
}

run().catch(console.error);

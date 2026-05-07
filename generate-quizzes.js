#!/usr/bin/env node
"use strict";

/**
 * generate-quizzes.js
 * Generates quiz JSON files for study pages using GPT-4o.
 *
 * Usage:
 *   node generate-quizzes.js [--subject cs|pv|site|spv] [--force] [--num XX]
 *
 * Examples:
 *   node generate-quizzes.js --subject cs          # generate missing CS quizzes
 *   node generate-quizzes.js --subject cs --force  # regenerate all CS quizzes
 *   node generate-quizzes.js --subject cs --num 5  # regenerate only entry #5
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const DELAY_MS = 3000;
const ROOT = __dirname;

/* ── CLI args ── */
const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const subjectArg = (() => {
  const i = args.indexOf("--subject");
  return i >= 0 ? args[i + 1] : "cs";
})();
const numArg = (() => {
  const i = args.indexOf("--num");
  return i >= 0 ? Number(args[i + 1]) : null;
})();

/* ── Subject configs ── */
const SUBJECTS = {
  cs: {
    htmlDir: path.join(ROOT, "maturitniOtazkyCs_html"),
    outDir: path.join(ROOT, "assets", "quizzes", "cs"),
    quizType: "czech-literature",
  },
  pv: {
    htmlDir: path.join(ROOT, "maturitniOtazkyPv_html"),
    outDir: path.join(ROOT, "assets", "quizzes", "pv"),
    quizType: "informatics",
  },
  site: {
    htmlDir: path.join(ROOT, "maturitniOtazkySite"),
    outDir: path.join(ROOT, "assets", "quizzes", "site"),
    quizType: "networking",
  },
  spv: {
    htmlDir: path.join(ROOT, "maturitniOtazkySpv_html"),
    outDir: path.join(ROOT, "assets", "quizzes", "spv"),
    quizType: "social-sciences",
  },
};

/* ── Strip HTML to plain text ── */
function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 12000); // cap to keep within token budget
}

/* ── System prompt ── */
const SYSTEM_PROMPT = `Jsi expert na tvorbu výukových testů pro maturanty. Tvůj úkol je vygenerovat sadu procvičovacích otázek ke studijnímu textu.

VÝSTUPNÍ FORMÁT (POUZE čisté JSON, žádný markdown ani komentáře):
{
  "title": "<název tématu>",
  "questions": [
    {
      "type": "match",
      "prompt": "<instrukce k přiřazování>",
      "pairs": [["levá strana", "pravá strana"], ...]
    },
    {
      "type": "trueFalse",
      "prompt": "Rozhodni a vysvětli proč:",
      "statement": "<tvrzení>",
      "answer": true,
      "explanation": "<vysvětlení>"
    },
    {
      "type": "fill",
      "prompt": "<instrukce k doplňování>",
      "text": "Text s {{doplňovánou1}} a dalším {{doplňováním2}}.",
      "answers": ["doplňovánou1", "doplňování2"]
    },
    {
      "type": "order",
      "prompt": "<instrukce k řazení>",
      "items": ["první", "druhé", "třetí", "čtvrté"]
    },
    {
      "type": "open",
      "prompt": "<otevřená otázka>",
      "keywords": ["klíčové", "slovo", "z", "odpovědi"]
    }
  ]
}

PRAVIDLA:
- Vygeneruj 7–10 otázek. Každý typ (match, trueFalse, fill, order, open) použij alespoň jednou.
- Otázky musí vycházet POUZE z poskytnutého textu.
- Pokrývej: definice pojmů, klíčová fakta, časové osy, vztahy, příklady z textu.
- match: 4–6 párů; pairs musí být array of [string, string].
- fill: {{slovo}} označuje doplňovaná místa; "answers" musí obsahovat přesně ta slova ve stejném pořadí.
- order: 4–6 položek ve správném pořadí.
- open: keywords jsou klíčová slova, která by měla být v odpovědi.
- Piš v češtině. Nesmiš vymýšlet fakta mimo text.
- VÝSTUP MUSÍ BÝT VALIDNÍ JSON BEZ MARKDOWN BLOKŮ.`;

/* ── Build user prompt ── */
function buildPrompt(title, textContent, quizType) {
  const typeHint =
    {
      "czech-literature":
        "Zaměř se na: autora (život, dílo, literární kontext), obsah díla (děj, postavy, motivy), literárněvědné pojmy a dobový kontext.",
      informatics:
        "Zaměř se na: technické definice, algoritmy, datové struktury, kódové ukázky, výhody/nevýhody řešení.",
      networking:
        "Zaměř se na: síťové protokoly, vrstvy OSI/TCP-IP, adresování, příkazy, konfigurace.",
      "social-sciences":
        "Zaměř se na: pojmy, teorie, myslitelé, historické kontexty, příklady.",
    }[quizType] || "";

  return `Téma: "${title}"\n${typeHint}\n\nStudijní text:\n\n${textContent}`;
}

/* ── Call GPT-4o ── */
async function generateQuiz(title, textContent, quizType) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 3000,
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildPrompt(title, textContent, quizType) },
    ],
  });

  const raw = res.choices[0].message.content.trim();
  const tokens = {
    in: res.usage.prompt_tokens,
    out: res.usage.completion_tokens,
  };

  // Strip markdown code fences if GPT added them
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const json = JSON.parse(cleaned); // will throw on bad JSON
  return { json, tokens };
}

/* ── Scan HTML dir for study files ── */
function getHtmlEntries(htmlDir) {
  if (!fs.existsSync(htmlDir)) return [];
  return fs
    .readdirSync(htmlDir)
    .filter((f) => /^\d{2}_/.test(f) && f.endsWith(".html"))
    .sort();
}

/* ── Main ── */
async function main() {
  const cfg = SUBJECTS[subjectArg];
  if (!cfg) {
    console.error(
      `Unknown subject: ${subjectArg}. Use: ${Object.keys(SUBJECTS).join(", ")}`,
    );
    process.exit(1);
  }

  fs.mkdirSync(cfg.outDir, { recursive: true });

  const files = getHtmlEntries(cfg.htmlDir);
  if (!files.length) {
    console.error(`No HTML files found in ${cfg.htmlDir}`);
    process.exit(1);
  }

  const toProcess = numArg
    ? files.filter((f) => Number(f.slice(0, 2)) === numArg)
    : files;

  if (!toProcess.length) {
    console.log("Nothing to process (num not found).");
    return;
  }

  console.log(
    `\n🚀  Generating ${toProcess.length} quiz(es) for subject: ${subjectArg}\n`,
  );

  for (let i = 0; i < toProcess.length; i++) {
    const file = toProcess[i];
    const base = file.replace(/\.html$/, "");
    const num = base.slice(0, 2);
    const outPath = path.join(cfg.outDir, base + ".json");

    // Derive title from filename (fallback — GPT will fill proper title)
    const rawTitle = base.replace(/^\d+_/, "").replace(/_/g, " ");

    console.log(
      `📝  [${String(i + 1).padStart(2)}/${toProcess.length}] ${rawTitle}`,
    );

    if (!FORCE && fs.existsSync(outPath)) {
      console.log("    ⏭  Already exists, skipping.\n");
      continue;
    }

    // Read HTML → strip → text
    const html = fs.readFileSync(path.join(cfg.htmlDir, file), "utf8");
    const text = stripHtml(html);

    // Extract title from <title> or <h1>
    const titleMatch =
      html.match(/<h1[^>]*>([^<]{4,120})<\/h1>/i) ||
      html.match(/<title[^>]*>([^<]{4,120})<\/title>/i);
    const title = titleMatch
      ? titleMatch[1].replace(/^\d+\s*[–-]\s*/, "").trim()
      : rawTitle;

    console.log(`    Calling GPT-4o…`);

    try {
      const { json, tokens } = await generateQuiz(title, text, cfg.quizType);

      // Ensure title is set
      if (!json.title) json.title = title;

      fs.writeFileSync(outPath, JSON.stringify(json, null, 2), "utf8");
      console.log(`    Tokens: ${tokens.in} in / ${tokens.out} out`);
      console.log(`    ✅  Saved → ${base}.json\n`);
    } catch (err) {
      console.error(`    ❌  Error: ${err.message}`);
      if (err.message.includes("JSON")) {
        console.error("    (GPT returned invalid JSON — try --force to retry)");
      }
    }

    // Rate-limit delay between calls (except last)
    if (i < toProcess.length - 1) {
      process.stdout.write(`    ⏳  Waiting ${DELAY_MS / 1000}s…\n`);
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  console.log("✅  All done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

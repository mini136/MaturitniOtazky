#!/usr/bin/env node
/**
 * generate-cs-literature.js
 *
 * Crawls Wikipedia (CS + EN) for each author/work in the matura list,
 * then uses OpenAI GPT-4o to generate comprehensive study HTML pages
 * matching the style of 01_Ota_Pavel_Smrt_krasnych_srncu.html
 *
 * Usage:
 *   node generate-cs-literature.js              # generate all missing pages
 *   node generate-cs-literature.js --num 02     # generate only entry 02
 *   node generate-cs-literature.js --force      # regenerate even if file exists
 */

"use strict";
require("dotenv").config();

const axios = require("axios");
const { OpenAI } = require("openai");
const fs = require("fs");
const path = require("path");

// ── Config ───────────────────────────────────────────────────────────────────
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("ERROR: OPENAI_API_KEY not set in .env");
  process.exit(1);
}
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const OUTPUT_DIR = path.join(__dirname, "maturitniOtazkyCs_html");
const DELAY_MS = 3000; // pause between OpenAI calls to respect rate limits

// ── Entry list ───────────────────────────────────────────────────────────────
// Ota Pavel (01) is already done. We generate 02-20 from autori.csv order.
const ENTRIES = [
  {
    num: "02",
    author: "William Shakespeare",
    work: "Zkrocení zlé ženy",
    filename: "02_William_Shakespeare_Zkroceni_zle_zeny.html",
    wiki: [
      { title: "William Shakespeare", lang: "cs" },
      { title: "Zkrocení zlé ženy", lang: "cs" },
      { title: "William Shakespeare", lang: "en" },
      { title: "The Taming of the Shrew", lang: "en" },
    ],
  },
  {
    num: "03",
    author: "Molière",
    work: "Lakomec",
    filename: "03_Moliere_Lakomec.html",
    wiki: [
      { title: "Molière", lang: "cs" },
      { title: "Lakomec", lang: "cs" },
      { title: "Molière", lang: "en" },
      { title: "The Miser", lang: "en" },
    ],
  },
  {
    num: "04",
    author: "Karel Jaromír Erben",
    work: "Kytice",
    filename: "04_Karel_Jaromir_Erben_Kytice.html",
    wiki: [
      { title: "Karel Jaromír Erben", lang: "cs" },
      { title: "Kytice (sbírka básní)", lang: "cs" },
      { title: "Karel Jaromír Erben", lang: "en" },
      { title: "Kytice", lang: "en" },
    ],
  },
  {
    num: "05",
    author: "Karel Havlíček Borovský",
    work: "Tyrolské elegie",
    filename: "05_Karel_Havlicek_Borovsky_Tyrolske_elegie.html",
    wiki: [
      { title: "Karel Havlíček Borovský", lang: "cs" },
      { title: "Tyrolské elegie", lang: "cs" },
      { title: "Karel Havlíček Borovský", lang: "en" },
    ],
  },
  {
    num: "06",
    author: "Jan Neruda",
    work: "Povídky malostranské",
    filename: "06_Jan_Neruda_Povidky_malostranske.html",
    wiki: [
      { title: "Jan Neruda", lang: "cs" },
      { title: "Povídky malostranské", lang: "cs" },
      { title: "Jan Neruda", lang: "en" },
      { title: "Tales of the Little Quarter", lang: "en" },
    ],
  },
  {
    num: "07",
    author: "Jaroslav Vrchlický",
    work: "Noc na Karlštejně",
    filename: "07_Jaroslav_Vrchlicky_Noc_na_Karlstejne.html",
    wiki: [
      { title: "Jaroslav Vrchlický", lang: "cs" },
      { title: "Noc na Karlštejně", lang: "cs" },
      { title: "Jaroslav Vrchlický", lang: "en" },
    ],
  },
  {
    num: "08",
    author: "George Bernard Shaw",
    work: "Pygmalion",
    filename: "08_George_Bernard_Shaw_Pygmalion.html",
    wiki: [
      { title: "George Bernard Shaw", lang: "cs" },
      { title: "Pygmalion (hra)", lang: "cs" },
      { title: "George Bernard Shaw", lang: "en" },
      { title: "Pygmalion (play)", lang: "en" },
    ],
  },
  {
    num: "09",
    author: "Franz Kafka",
    work: "Proměna",
    filename: "09_Franz_Kafka_Premena.html",
    wiki: [
      { title: "Franz Kafka", lang: "cs" },
      { title: "Proměna (novela)", lang: "cs" },
      { title: "Franz Kafka", lang: "en" },
      { title: "The Metamorphosis", lang: "en" },
    ],
  },
  {
    num: "10",
    author: "Francis Scott Fitzgerald",
    work: "Velký Gatsby",
    filename: "10_Francis_Scott_Fitzgerald_Velky_Gatsby.html",
    wiki: [
      { title: "Francis Scott Fitzgerald", lang: "cs" },
      { title: "Velký Gatsby", lang: "cs" },
      { title: "F. Scott Fitzgerald", lang: "en" },
      { title: "The Great Gatsby", lang: "en" },
    ],
  },
  {
    num: "11",
    author: "Erich Maria Remarque",
    work: "Na západní frontě klid",
    filename: "11_Erich_Maria_Remarque_Na_zapadni_fronte_klid.html",
    wiki: [
      { title: "Erich Maria Remarque", lang: "cs" },
      { title: "Na západní frontě klid", lang: "cs" },
      { title: "Erich Maria Remarque", lang: "en" },
      { title: "All Quiet on the Western Front", lang: "en" },
    ],
  },
  {
    num: "12",
    author: "George Orwell",
    work: "Farma zvířat",
    filename: "12_George_Orwell_Farma_zvirat.html",
    wiki: [
      { title: "George Orwell", lang: "cs" },
      { title: "Farma zvířat", lang: "cs" },
      { title: "George Orwell", lang: "en" },
      { title: "Animal Farm", lang: "en" },
    ],
  },
  {
    num: "13",
    author: "Ray Bradbury",
    work: "451 stupňů Fahrenheita",
    filename: "13_Ray_Bradbury_451_stupnu_Fahrenheita.html",
    wiki: [
      { title: "Ray Bradbury", lang: "cs" },
      { title: "451 stupňů Fahrenheita", lang: "cs" },
      { title: "Ray Bradbury", lang: "en" },
      { title: "Fahrenheit 451", lang: "en" },
    ],
  },
  {
    num: "14",
    author: "Viktor Dyk",
    work: "Krysař",
    filename: "14_Viktor_Dyk_Krysar.html",
    wiki: [
      { title: "Viktor Dyk", lang: "cs" },
      { title: "Krysař", lang: "cs" },
      { title: "Viktor Dyk", lang: "en" },
    ],
  },
  {
    num: "15",
    author: "Jaroslav Hašek",
    work: "Osudy dobrého vojáka Švejka za světové války",
    filename: "15_Jaroslav_Hasek_Osudy_dobreho_vojaka_Svejka.html",
    wiki: [
      { title: "Jaroslav Hašek", lang: "cs" },
      { title: "Osudy dobrého vojáka Švejka za světové války", lang: "cs" },
      { title: "Jaroslav Hašek", lang: "en" },
      { title: "The Good Soldier Švejk", lang: "en" },
    ],
  },
  {
    num: "16",
    author: "Karel Čapek",
    work: "Válka s mloky",
    filename: "16_Karel_Capek_Valka_s_mloky.html",
    wiki: [
      { title: "Karel Čapek", lang: "cs" },
      { title: "Válka s mloky", lang: "cs" },
      { title: "Karel Čapek", lang: "en" },
      { title: "War with the Newts", lang: "en" },
    ],
  },
  {
    num: "17",
    author: "Karel Čapek",
    work: "Bílá nemoc",
    filename: "17_Karel_Capek_Bila_nemoc.html",
    wiki: [
      { title: "Karel Čapek", lang: "cs" },
      { title: "Bílá nemoc", lang: "cs" },
      { title: "Karel Čapek", lang: "en" },
      { title: "The White Plague (play)", lang: "en" },
    ],
  },
  {
    num: "18",
    author: "Bohumil Hrabal",
    work: "Ostře sledované vlaky",
    filename: "18_Bohumil_Hrabal_Ostre_sledovane_vlaky.html",
    wiki: [
      { title: "Bohumil Hrabal", lang: "cs" },
      { title: "Ostře sledované vlaky", lang: "cs" },
      { title: "Bohumil Hrabal", lang: "en" },
      { title: "Closely Watched Trains", lang: "en" },
    ],
  },
  {
    num: "19",
    author: "Ladislav Smoljak a Zdeněk Svěrák",
    work: "Vyšetřování ztráty třídní knihy",
    filename: "19_Smoljak_Sverak_Vysetrovani_ztraty_tridni_knihy.html",
    wiki: [
      { title: "Zdeněk Svěrák", lang: "cs" },
      { title: "Ladislav Smoljak", lang: "cs" },
      { title: "Vyšetřování ztráty třídní knihy", lang: "cs" },
      { title: "Divadlo Járy Cimrmana", lang: "cs" },
    ],
  },
  {
    num: "20",
    author: "Ladislav Smoljak a Zdeněk Svěrák",
    work: "Dobytí severního pólu",
    filename: "20_Smoljak_Sverak_Dobyti_severniho_polu.html",
    wiki: [
      { title: "Zdeněk Svěrák", lang: "cs" },
      { title: "Ladislav Smoljak", lang: "cs" },
      { title: "Dobytí severního pólu", lang: "cs" },
      { title: "Divadlo Járy Cimrmana", lang: "cs" },
    ],
  },
];

// ── Inline CSS (identical to Ota Pavel page) ─────────────────────────────────
const INLINE_CSS = `
        body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 980px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333; }
        h1 { color: #7c2d12; border-bottom: 3px solid #ea580c; padding-bottom: 10px; }
        h2 { color: #9a3412; border-bottom: 1px solid #fed7aa; padding-bottom: 5px; margin-top: 30px; }
        h3 { color: #c2410c; margin-top: 18px; }
        nav { background: #fff7ed; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
        nav a { margin-right: 15px; text-decoration: none; color: #c2410c; font-weight: 600; }
        nav a:hover { text-decoration: underline; }
        .note { background: #fff7ed; border-left: 4px solid #ea580c; padding: 10px 14px; margin: 12px 0; border-radius: 0 5px 5px 0; }
        .quote { background: #fef3c7; border-left: 4px solid #d97706; padding: 12px 16px; margin: 16px 0; border-radius: 0 5px 5px 0; font-style: italic; }
        .quote cite { display: block; margin-top: 8px; font-size: 0.9em; color: #92400e; font-style: normal; }
        .keywords { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px 16px; margin: 12px 0; }
        .keywords ul { margin: 0; padding-left: 20px; }
        .keywords li { margin: 4px 0; }
        table { border-collapse: collapse; width: 100%; margin: 15px 0; }
        th, td { border: 1px solid #fed7aa; padding: 10px; text-align: left; vertical-align: top; }
        th { background: #ea580c; color: white; }
        tr:nth-child(even) { background: #fff7ed; }
        .story-card { border: 1px solid #fed7aa; border-radius: 8px; background: #fffbf5; padding: 14px 18px; margin: 14px 0; }
        .story-card h3 { margin-top: 0; color: #9a3412; }
        .story-card p { margin: 6px 0; }
        .story-card .theme { font-size: 0.88em; color: #c2410c; font-weight: 600; }
        .author-card { border: 1px solid #fed7aa; border-radius: 8px; background: #fff7ed; padding: 14px 18px; margin: 14px 0; }
        .author-card h3 { margin-top: 0; color: #7c2d12; }
        .flash-wrap { display: grid; gap: 10px; }
        .flash-card { border: 1px solid #fed7aa; border-radius: 8px; background: #fffbf5; padding: 8px 12px; }
        .flash-card summary { cursor: pointer; font-weight: 700; color: #9a3412; }
        .flash-card p { margin: 10px 0 4px; }
        .timeline { list-style: none; padding: 0; }
        .timeline li { padding: 8px 0 8px 28px; border-left: 3px solid #ea580c; margin-left: 12px; position: relative; }
        .timeline li::before { content: '●'; position: absolute; left: -10px; color: #ea580c; }
        .timeline li strong { display: block; color: #7c2d12; }
        @media print { nav, .flash-wrap { display: none; } }
`.trim();

// ── Wikipedia fetch ───────────────────────────────────────────────────────────
async function fetchWikiExtract(title, lang) {
  try {
    const { data } = await axios.get(
      `https://${lang}.wikipedia.org/w/api.php`,
      {
        params: {
          action: "query",
          prop: "extracts",
          titles: title,
          format: "json",
          explaintext: 1,
          exsectionformat: "plain",
          redirects: 1,
        },
        timeout: 12000,
        headers: { "User-Agent": "MaturitaStudyBot/1.0 (school project)" },
      },
    );
    const pages = data.query.pages;
    const page = Object.values(pages)[0];
    if (!page || page.missing !== undefined) return null;
    // Cap each article at 4 000 characters to stay within token budget
    return (page.extract || "").slice(0, 4000);
  } catch (err) {
    console.warn(`  ⚠  Wikipedia ${lang}:"${title}" → ${err.message}`);
    return null;
  }
}

async function gatherWikiContent(wikiList) {
  const parts = [];
  for (const { title, lang } of wikiList) {
    const text = await fetchWikiExtract(title, lang);
    if (text) {
      parts.push(`=== ${lang.toUpperCase()} Wikipedia: ${title} ===\n${text}`);
    }
  }
  return parts.join("\n\n");
}

// ── Prompt builders ──────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Jsi expert na českou a světovou literaturu. Tvoříš podrobné studijní materiály pro české gymnázium k maturitní zkoušce z českého jazyka a literatury.
Výstup musí být POUZE čistý HTML fragment (bez DOCTYPE, bez <html>, bez <head>, bez <body> tagu, bez markdown kódu, bez jakéhokoliv textu mimo HTML).
Používej pouze HTML třídy a tagy definované v zadání.`;

function buildUserPrompt(num, author, work, wikiContent) {
  return `Vytvoř podrobný studijní HTML obsah pro maturitní okruh ${num}: "${author} – ${work}".

ZDROJOVÝ MATERIÁL (Wikipedia):
${wikiContent || "[Žádný externě stažený obsah – použij vlastní znalosti]"}

POŽADOVANÁ STRUKTURA – vše v ČEŠTINĚ:

<h1>${num} – ${author} – ${work}</h1>

<!-- 1 citát z díla nebo výroku autora -->
<div class='quote'>…citát…<cite>— zdroj</cite></div>

<h2>1. O autorovi – ${author}</h2>
<h3>Základní údaje</h3>
<table>
  <tr><th>Kategorie</th><th>Informace</th></tr>
  <!-- Řádky: Celé/vlastní jméno, Narozen, Zemřel, Národnost/Jazyk, Profese, Hlavní díla (3–5), Literární směr -->
</table>
<h3>Životní chronologie</h3>
<ul class='timeline'>
  <!-- Min. 8 položek: <li><strong>ROK</strong> Událost</li> -->
</ul>
<h3>Charakter tvorby</h3>
<div class='keywords'><ul><!-- 5–8 bullet pointů --></ul></div>

<h2>2. Přehled tvorby</h2>
<table>
  <tr><th>Rok</th><th>Název</th><th>Poznámka</th></tr>
  <!-- Min. 6 děl -->
</table>

<h2>3. ${work} – rozbor díla</h2>
<div class='note'>Úvod k dílu</div>
<h3>Základní informace</h3>
<table>
  <tr><th>Kategorie</th><th>Informace</th></tr>
  <!-- Žánr, Rok vydání, Téma, Prostředí, Vyprávěcí perspektiva, Jazyk originálu, Filmová/divadelní zpracování -->
</table>
<h3>Hlavní postavy</h3>
<div class='keywords'><ul><!-- nebo <table> --></ul></div>
<h3>Obsah a děj</h3>
<!-- 3–4 × <div class='story-card'> (kapitola/akt/část/povídka) -->
<!-- Každá story-card: <h3>Název</h3>, <p><strong>Děj:</strong> …</p>, <p><strong>Téma:</strong> …</p>, <p class='theme'>Klíčové: …</p> -->
<h3>Jazykové a stylistické prostředky</h3>
<table>
  <tr><th>Prostředek</th><th>Příklad / popis</th></tr>
  <!-- Min. 6 řádků -->
</table>

<h2>4. Dobový literární kontext</h2>
<div class='note'>Popis epochy a literárního proudu</div>
<table>
  <tr><th>Tendence / Směr</th><th>Popis</th></tr>
  <!-- Min. 4 řádky -->
</table>

<h2>5. Soudobí a blízcí autoři</h2>
<!-- 4–5 × <div class='author-card'>
       <h3>Jméno (roky)</h3>
       <p><strong>Dílo:</strong> …</p>
       <p><strong>Styl:</strong> …</p>
       <p><strong>Srovnání s ${author}:</strong> …</p>
     </div> -->
<h3>Srovnávací tabulka</h3>
<table>
  <tr><th>Autor</th><th>Téma</th><th>Styl</th><th>Kontext</th></tr>
</table>

<h2>6. Filmová / divadelní zpracování a recepce</h2>
<div class='keywords'><ul><!-- adaptace, ocenění, kulturní vliv --></ul></div>

<h2>7. Klíčové pojmy k zapamatování</h2>
<div class='keywords'><ul><!-- 8–12 pojmů --></ul></div>

<h2>8. Studijní kartičky</h2>
<div class='flash-wrap'>
  <!-- Min. 10 × <details class='flash-card'><summary>OTÁZKA?</summary><p>ODPOVĚĎ (faktická, konkrétní)</p></details> -->
  <!-- Pokryj: datum, jméno, fakta o autorovi; dílo (děj, postavy, styl); kontext; srovnání -->
</div>

PRAVIDLA:
- Vše v češtině (překlady citátů i názvů)
- Faktická přesnost – používej Wikipedia data
- Výstup = čistý HTML fragment začínající <h1> a končící </div> (poslední flash-card)
- Žádný markdown, žádné \`\`\`html bloky
`;
}

// ── HTML wrapper ─────────────────────────────────────────────────────────────
function wrapInPage(num, author, work, bodyFragment) {
  return `<!DOCTYPE html>
<html lang='cs'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>${num} – ${author} – ${work}</title>
    <style>
        ${INLINE_CSS}
    </style>
    <link rel='stylesheet' href='../assets/study.css'>
</head>
<body>
    <nav>
        <a href='index.html'>⬅ Zpět na obsah ČJ</a>
        <a href='../index.html'>🏠 Hlavní rozcestník</a>
    </nav>

    ${bodyFragment}

    <nav style='margin-top: 30px;'>
        <a href='index.html'>⬅ Zpět na obsah ČJ</a>
        <a href='../index.html'>🏠 Hlavní rozcestník</a>
    </nav>
</body>
<script src='../assets/study.js'></script>
</html>`;
}

// ── Index updater ─────────────────────────────────────────────────────────────
function updateIndex() {
  const allEntries = [
    {
      num: "01",
      author: "Ota Pavel",
      work: "Smrt krásných srnců",
      filename: "01_Ota_Pavel_Smrt_krasnych_srncu.html",
    },
    ...ENTRIES,
  ];

  const items = allEntries
    .map(
      (e) =>
        `        <li><a href='${e.filename}'><span>${e.num}</span>${e.author} – ${e.work}</a></li>`,
    )
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang='cs'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Maturitní otázky – Český jazyk a literatura</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 980px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333; }
        h1 { color: #7c2d12; border-bottom: 3px solid #ea580c; padding-bottom: 10px; text-align: center; }
        .question-list { list-style: none; padding: 0; }
        .question-list li { margin: 8px 0; }
        .question-list a {
            display: block; padding: 12px 20px; background: #fff7ed; color: #7c2d12;
            text-decoration: none; border-radius: 5px; border-left: 4px solid #ea580c;
            transition: background 0.2s, border-color 0.2s;
        }
        .question-list a:hover { background: #ffedd5; border-left-color: #c2410c; }
        .question-list a span { color: #9a3412; font-weight: bold; margin-right: 10px; }
        nav { margin-bottom: 20px; }
        nav a { text-decoration: none; color: #c2410c; font-weight: 600; }
        nav a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <nav><a href='../index.html'>⬅ Zpět na hlavní rozcestník</a></nav>
    <h1>Maturitní otázky – Český jazyk a literatura</h1>
    <ol class='question-list'>
${items}
    </ol>
</body>
</html>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, "index.html"), html, "utf8");
  console.log("   index.html updated");
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const onlyNum = args.includes("--num")
    ? args[args.indexOf("--num") + 1]
    : null;
  const entries = onlyNum ? ENTRIES.filter((e) => e.num === onlyNum) : ENTRIES;

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`\n🚀  Generating ${entries.length} page(s)…\n`);

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const outputPath = path.join(OUTPUT_DIR, entry.filename);

    if (!force && fs.existsSync(outputPath)) {
      console.log(
        `⏭   [${entry.num}] ${entry.author} – already exists, skipping`,
      );
      continue;
    }

    console.log(
      `\n📚  [${entry.num}/${ENTRIES[ENTRIES.length - 1].num}] ${entry.author} – ${entry.work}`,
    );
    console.log(`    Fetching Wikipedia (${entry.wiki.length} articles)…`);

    const wikiContent = await gatherWikiContent(entry.wiki);
    const wikiChars = wikiContent.length;
    console.log(`    Wikipedia: ${wikiChars} chars`);

    if (wikiChars === 0) {
      console.warn(
        "    ⚠  No Wikipedia content found – GPT-4o will rely on training data only",
      );
    }

    console.log("    Calling GPT-4o…");
    let bodyFragment;
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: buildUserPrompt(
              entry.num,
              entry.author,
              entry.work,
              wikiContent,
            ),
          },
        ],
        max_tokens: 4096,
        temperature: 0.2,
      });

      bodyFragment = (response.choices[0].message.content || "").trim();

      // Strip markdown fences if GPT-4o included them
      bodyFragment = bodyFragment
        .replace(/^```html\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const usage = response.usage;
      console.log(
        `    Tokens: ${usage.prompt_tokens} in / ${usage.completion_tokens} out`,
      );
    } catch (err) {
      console.error(`    ❌ OpenAI error for [${entry.num}]: ${err.message}`);
      // Save error placeholder so the run can continue
      fs.writeFileSync(
        outputPath,
        `<!-- ERROR generating ${entry.author} - ${entry.work}: ${err.message} -->`,
        "utf8",
      );
      if (i < entries.length - 1) await sleep(DELAY_MS);
      continue;
    }

    const fullHtml = wrapInPage(
      entry.num,
      entry.author,
      entry.work,
      bodyFragment,
    );
    fs.writeFileSync(outputPath, fullHtml, "utf8");
    console.log(`    ✅  Saved → ${entry.filename}`);

    // Rate-limit: pause before next OpenAI call
    if (i < entries.length - 1) {
      console.log(`    ⏳  Waiting ${DELAY_MS / 1000}s…`);
      await sleep(DELAY_MS);
    }
  }

  console.log("\n📋  Updating index.html…");
  updateIndex();

  console.log("\n✅  All done!\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

const path = require("path");
const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const fs = require("fs");
const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

const SUBJECT_HTML_DIRS = {
  pv: "maturitniOtazkyPv_html",
  site: "maturitniOtazkySite",
  spv: "maturitniOtazkySpv_html",
  cs: "maturitniOtazkyCs_html",
};

const AI_PV_PSS_TOPICS = [
  "Adresování a správa paměti - Garbage collecting, Reference/ukazatele, Struktura paměti programu",
  "Algoritmizace - Grafy, Prohlédávání stavového prostoru, Řazení",
  "Algoritmizace - Rekurze, Brute Force, Heuristiky, Nedeterministické algoritmy",
  "Anonymní metody (Lambda), speciální (magické) metody, statické metody, ukazatel na metodu (delegát)",
  "Architectural design patterns - MVC, Multitier, Monolithic, P2P, Client/Server",
  "Asymptotické paměťové a časové složitosti",
  "Datové typy, Generika, Výčtové datové typy, Struktury, Anotace, Operátory",
  "Dědičnost, method overriding, function overloading",
  "Integrita dat, bezpečnost, logování, kontrola vstupů, zpracování chyb",
  "Komunikace s databázovým systémem - Připojení, Ukládání a načítání dat, Mapování entit v OOP",
  "Komunikace v síti - tvorba síťových aplikací, Berkley socket a jeho rozhraní",
  "Metodiky a životní cyklus vývoje softwaru",
  "Návrhové vzory - creational design patterns, structural design patterns, behavioral patterns",
  "Principy objektového programování, agregace a kompozice objektů",
  "Programovací jazyky - vlastnosti, srovnání, popis způsobu tvorby i běhu programů",
  "Soubory a serializace - Ukládání a načítání dat, formáty souborů",
  "Strojové učení - Příprava dat, Chyby v datech a bias, Korelace a kauzalita",
  "Strojové učení s využitím regrese a klasifikace",
  "Strojové učení s využitím umělých neuronových sítí",
  "Testování, Unit testování a dokumentace zdrojového kódu",
  "Typy datových struktur - Pole, Spojový seznam, Strom, Fronta, Zásobník, Halda",
  "Vlákna, Paralelní programování, Asynchronní metody, Concurrent design patterns",
  "Vlastnosti datových struktur - Seřazenost a opakování prvků, Indexace, hashování a klíče prvků",
  "Výjimky a aserce, debugování a zpracování chyb",
  "Zpracování a parsování textových dat, regulární výrazy, kódování a stringy",
  "OS Linux - Charakteristika, struktura OS, start systému, služby, procesy, paměť, balíčkovací systém",
  "OS Linux - Souborový systém, formátování, dělení a připojování souborových systémů, účel základních adresářů",
  "OS Linux - Správa uživatelů, skupin, zabezpečení přístupu k souborům a službám (práva), SUDO",
  "OS Linux - SSH, CRON, procesy a služby, systémové logy, virtualizace",
  "OS Linux - Tvorba skriptů (BASH). Práce s textovými soubory, filtrace, regulární výrazy, kompilace, zálohování",
  "OSI 1 - Fyzická vrstva - přenosová média, přenos bitů, signály, topologie sítí, kódování dat, přenosová rychlost, detekce chyb",
  "OSI 1 - Fyzická vrstva - Ethernet základní principy, standardy, strukturovaná kabeláž, optika, konektory, přenosové rychlosti",
  "OSI 2 - Linková vrstva - Přepínače, rámce, adresování, kolize, detekce a oprava chyb, MAC, řízení toku dat",
  "OSI 2 - Linková vrstva - ARP, MAC, vztah mezi rámcem a paketem, zapouzdření",
  "OSI 2 - Linková vrstva - VLAN - princip, použití. trunk/access porty, DTP, protokol 802.1q",
  "OSI 3 - Síťová vrstva - IPv4, maska, podsíťování, porovnání s IPv6, fragmentace",
  "OSI 3 - Síťová vrstva - IPv6, maska, podsíťování, porovnání s IPv4, fragmentace",
  "OSI 3 - Síťová vrstva - Statické směrování, tabulky, statické vs. dynamické směrování, administrativní vzdálenost",
  "OSI 3 - Síťová vrstva - Dynamické směrování (RIP, OSPF), konfigurace, metriky, administrativní vzdálenost",
  "OSI 4 - Transportní vrstva - UDP, TCP, segmentace a znovusestavení, řízení přenosové rychlosti, kontrola chyb",
  "OSI 5, 6, 7 - soketové programování, převod formátů dat, šifrování, komprese, autentizace",
  "DHCP4 - funkce, možnosti konfigurace (rozsahy IP adres, dle MAC adresy), použití",
  "DHCP6 - funkce, možnosti konfigurace (rozsahy IP adres, dle MAC adresy), použití",
  "DNS - funkce, hierarchie (od souboru po globální DNS servery), konfigurace",
  "Firewall - Principy fungování, typy firewallů (stateful, stateless, aplikační), konfigurace pravidel, NAT, DMZ, VPN",
  "STP (Spanning Tree), Etherchannel a HSRP - principy, konfigurace, failover a redundance, BPDU",
  "Bezdrátové sítě - šíření elektromagnetických vln, antény, druhy modulací, zabezpečení, autentifikace, frekveční pásma, přenosové kanály",
  "Bezpečnost a šifrování přenosu: SSL/TLS, RSA - Symetrické a asymetrické šifrování, SSL/TLS handshake, certifikační autority, šiftry",
  "IMAP a SMTP - odesílání a přijímání e-mailů, synchronizace poštovních schránek se serverem",
  "Technologie, které přežily změny současného rozvoje ICT",
];

function stripHtmlContent(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 10000);
}
const app = express();
const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = path.resolve(__dirname, "..");
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "admin123";

app.use(express.json({ limit: "256kb" }));

const RATE_LIMIT_BUCKETS = new Map();

function isRateLimited(req, scope, maxRequests, windowMs) {
  const forwardedFor = String(req.headers["x-forwarded-for"] || "")
    .split(",")[0]
    .trim();
  const ip = forwardedFor || req.ip || "unknown";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const current = RATE_LIMIT_BUCKETS.get(key);

  if (!current || now - current.windowStart >= windowMs) {
    RATE_LIMIT_BUCKETS.set(key, { count: 1, windowStart: now });
    return false;
  }

  if (current.count >= maxRequests) {
    return true;
  }

  current.count += 1;
  return false;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "maturitni_otazky",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});

function normalizeQuestionPath(value) {
  return String(value || "")
    .trim()
    .replace(/\\\\/g, "/")
    .replace(/^\/+/, "")
    .slice(0, 255);
}

function sanitizeKind(value) {
  const allowed = new Set(["chyba", "chybi", "dotaz", "jine"]);
  const v = String(value || "jine")
    .trim()
    .toLowerCase();
  return allowed.has(v) ? v : "jine";
}

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "connected" });
  } catch (err) {
    res.status(500).json({ ok: false, error: "database_unreachable" });
  }
});

app.get("/api/comments", async (req, res) => {
  const question = normalizeQuestionPath(req.query.question);
  if (!question) {
    return res.status(400).json({ error: "question_required" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, question_path AS questionPath, nick, email, kind, message,
              DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
       FROM comments
       WHERE question_path = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 300`,
      [question],
    );
    return res.json({ comments: rows });
  } catch (err) {
    return res.status(500).json({ error: "db_read_failed" });
  }
});

app.post("/api/comments", async (req, res) => {
  const questionPath = normalizeQuestionPath(req.body.questionPath);
  const nick = String(req.body.nick || "")
    .trim()
    .slice(0, 40);
  const emailRaw = String(req.body.email || "")
    .trim()
    .slice(0, 120);
  const kind = sanitizeKind(req.body.kind);
  const message = String(req.body.message || "")
    .trim()
    .slice(0, 2000);

  if (!questionPath || !nick || !message) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const email = emailRaw || null;

  try {
    const [result] = await pool.query(
      `INSERT INTO comments (question_path, nick, email, kind, message)
       VALUES (?, ?, ?, ?, ?)`,
      [questionPath, nick, email, kind, message],
    );

    const [rows] = await pool.query(
      `SELECT id, question_path AS questionPath, nick, email, kind, message,
              DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
       FROM comments
       WHERE id = ?`,
      [result.insertId],
    );

    return res.status(201).json({ comment: rows[0] });
  } catch (err) {
    return res.status(500).json({ error: "db_write_failed" });
  }
});

app.get("/api/comments/stats", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT question_path AS questionPath,
              COUNT(*) AS total,
              SUM(kind='chyba') AS chyby,
              SUM(kind='chybi') AS chybi,
              SUM(kind='dotaz') AS dotazy,
              MAX(created_at) AS lastComment
       FROM comments
       GROUP BY question_path
       ORDER BY total DESC`,
    );
    return res.json({ stats: rows });
  } catch (err) {
    return res.status(500).json({ error: "db_read_failed" });
  }
});

/* ── Admin auth middleware ── */
function requireAdmin(req, res, next) {
  const auth = req.headers["x-admin-password"] || "";
  if (auth !== ADMIN_PASS) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
}

/* ── Auth check (no DB) ── */
app.get("/api/auth/check", requireAdmin, (req, res) => {
  return res.json({ ok: true });
});

/* ── Admin: all comments summary ── */
app.get("/api/admin/comments", requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, question_path AS questionPath, nick, email, kind, message,
              DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
       FROM comments
       ORDER BY created_at DESC
       LIMIT 2000`,
    );
    return res.json({ comments: rows });
  } catch (err) {
    return res.status(500).json({ error: "db_read_failed" });
  }
});

/* ── Admin: comment stats per question ── */
app.get("/api/admin/stats", requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT question_path AS questionPath,
              COUNT(*) AS total,
              SUM(kind='chyba') AS chyby,
              SUM(kind='chybi') AS chybi,
              SUM(kind='dotaz') AS dotazy,
              MAX(created_at) AS lastComment
       FROM comments
       GROUP BY question_path
       ORDER BY total DESC`,
    );
    return res.json({ stats: rows });
  } catch (err) {
    return res.status(500).json({ error: "db_read_failed" });
  }
});

/* ── Admin: AI quiz attempt stats ── */
app.get("/api/admin/quiz-attempts", requireAdmin, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || "100", 10), 500);
  const subject = req.query.subject ? String(req.query.subject).trim().slice(0, 20) : null;
  try {
    const where = subject ? "WHERE subject = ?" : "";
    const params = subject ? [subject, limit] : [limit];
    const [rows] = await pool.query(
      `SELECT id, subject, topic, question, user_answer AS userAnswer, score, verdict,
              DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
       FROM ai_quiz_attempts
       ${where}
       ORDER BY created_at DESC
       LIMIT ?`,
      params
    );
    const [totals] = await pool.query(
      `SELECT subject,
              COUNT(*) AS total,
              ROUND(AVG(score)) AS avgScore,
              SUM(verdict='Správně') AS correct,
              SUM(verdict='Špatně') AS wrong
       FROM ai_quiz_attempts
       GROUP BY subject
       ORDER BY total DESC`
    );
    return res.json({ attempts: rows, totals });
  } catch (err) {
    return res.status(500).json({ error: "db_read_failed" });
  }
});

/* ── Admin: delete comment ── */
app.delete("/api/admin/comments/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id || id < 1) return res.status(400).json({ error: "invalid_id" });
  try {
    await pool.query("DELETE FROM comments WHERE id = ?", [id]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "db_delete_failed" });
  }
});

/* ── Admin: read question HTML ── */
app.get("/api/admin/page", requireAdmin, (req, res) => {
  const pagePath = normalizeQuestionPath(req.query.path);
  if (!pagePath || pagePath.includes("..")) {
    return res.status(400).json({ error: "invalid_path" });
  }
  const fullPath = path.join(ROOT_DIR, pagePath);
  if (!fullPath.startsWith(ROOT_DIR)) {
    return res.status(403).json({ error: "forbidden" });
  }
  try {
    const content = fs.readFileSync(fullPath, "utf-8");
    return res.json({ path: pagePath, content });
  } catch (err) {
    return res.status(404).json({ error: "file_not_found" });
  }
});

/* ── Admin: save question HTML ── */
app.put(
  "/api/admin/page",
  requireAdmin,
  express.text({ limit: "2mb", type: "*/*" }),
  (req, res) => {
    const pagePath = normalizeQuestionPath(req.query.path);
    if (!pagePath || pagePath.includes("..")) {
      return res.status(400).json({ error: "invalid_path" });
    }
    const fullPath = path.join(ROOT_DIR, pagePath);
    if (!fullPath.startsWith(ROOT_DIR)) {
      return res.status(403).json({ error: "forbidden" });
    }
    if (!fullPath.endsWith(".html")) {
      return res.status(400).json({ error: "only_html_allowed" });
    }
    try {
      fs.writeFileSync(fullPath, req.body, "utf-8");
      return res.json({ ok: true, path: pagePath });
    } catch (err) {
      return res.status(500).json({ error: "write_failed" });
    }
  },
);

/* ── Admin: list all question pages ── */
app.get("/api/admin/pages", requireAdmin, (req, res) => {
  const pages = [];
  [
    "maturitniOtazkyPv_html",
    "maturitniOtazkySite",
    "maturitniOtazkySpv_html",
  ].forEach((dir) => {
    const full = path.join(ROOT_DIR, dir);
    try {
      fs.readdirSync(full).forEach((f) => {
        if (f.endsWith(".html") && f !== "index.html") {
          let source = "pv";
          if (dir.includes("Site")) {
            source = "site";
          } else if (dir.includes("Spv")) {
            source = "spv";
          }
          pages.push({
            source,
            path: dir + "/" + f,
            name: f,
          });
        }
      });
    } catch (e) {
      /* dir missing */
    }
  });
  pages.sort((a, b) => a.path.localeCompare(b.path, "cs"));
  return res.json({ pages });
});

/* ── Live quiz: generate one question ── */
app.post("/api/quiz/live/generate", requireAdmin, async (req, res) => {
  const q = String(req.body.q || "").trim();
  const slashIdx = q.indexOf("/");
  if (slashIdx < 1) return res.status(400).json({ error: "invalid_topic" });
  const sub = q.slice(0, slashIdx);
  const file = q.slice(slashIdx + 1);

  if (!SUBJECT_HTML_DIRS[sub] || !file || file.includes("..")) {
    return res.status(400).json({ error: "invalid_topic" });
  }

  const htmlDir = SUBJECT_HTML_DIRS[sub];
  const filePath = path.join(ROOT_DIR, htmlDir, file + ".html");
  if (!filePath.startsWith(ROOT_DIR + path.sep) && filePath !== ROOT_DIR) {
    return res.status(403).json({ error: "forbidden" });
  }

  let content;
  try {
    content = stripHtmlContent(fs.readFileSync(filePath, "utf-8"));
  } catch (e) {
    return res.status(404).json({ error: "topic_not_found" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 600,
      messages: [
        {
          role: "system",
          content:
            "Jsi učitel připravující studenty na maturitu. Na základě obsahu tématu vygeneruj JEDNU otevřenou maturitní otázku.\n" +
            "Odpověz POUZE validním JSON objektem (bez markdown obalení) v tomto formátu:\n" +
            '{\n  "question": "text otázky",\n  "hints": ["nápověda1", "nápověda2"],\n  "modelAnswer": "vzorová odpověď (3-6 vět)"\n}\n' +
            "Otázka musí ověřovat pochopení, ne jen zapamatování. Vše v češtině.",
        },
        {
          role: "user",
          content:
            "Téma: " +
            file.replace(/_/g, " ") +
            "\n\nObsah materiálu:\n" +
            content,
        },
      ],
    });
    let json = (completion.choices[0].message.content || "").trim();
    json = json.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "");
    const question = JSON.parse(json);
    return res.json({ question });
  } catch (e) {
    return res.status(500).json({ error: "generation_failed" });
  }
});

/* ── Live quiz: evaluate an answer ── */
app.post("/api/quiz/live/evaluate", requireAdmin, async (req, res) => {
  const question = String(req.body.question || "")
    .trim()
    .slice(0, 1000);
  const modelAnswer = String(req.body.modelAnswer || "")
    .trim()
    .slice(0, 2000);
  const userAnswer = String(req.body.userAnswer || "")
    .trim()
    .slice(0, 2000);

  if (!question || !userAnswer) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "Jsi přísný ale spravedlivý maturitní zkoušející. Ohodnoť studentovu odpověď.\n" +
            "Odpověz POUZE validním JSON objektem (bez markdown obalení):\n" +
            '{\n  "score": <0-100>,\n  "verdict": "Správně" | "Částečně správně" | "Špatně",\n  "feedback": "konkrétní zpětná vazba (2-4 věty)",\n  "missing": ["co chybělo - každá položka jako krátká fráze"]\n}',
        },
        {
          role: "user",
          content:
            "Otázka: " +
            question +
            "\n\nVzorová odpověď: " +
            modelAnswer +
            "\n\nStudentova odpověď: " +
            userAnswer,
        },
      ],
    });
    let json = (completion.choices[0].message.content || "").trim();
    json = json.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "");
    const result = JSON.parse(json);
    return res.json({ result });
  } catch (e) {
    return res.status(500).json({ error: "evaluation_failed" });
  }
});

/* ── Public: AI explain selected text (student-facing) ── */
app.post("/api/explain", async (req, res) => {
  const text = String(req.body.text || "")
    .trim()
    .slice(0, 1500);
  const pageTitle = String(req.body.pageTitle || "")
    .trim()
    .slice(0, 200);
  const rephrase = !!req.body.rephrase;
  const topicPath = normalizeQuestionPath(req.body.topicPath);

  if (!text) {
    return res.status(400).json({ error: "missing_text" });
  }

  const systemPrompt = rephrase
    ? "Jsi přátelský středoškolský učitel. Vysvětli pojem nebo text JINÝM způsobem než předtím — použij analogii, příklad z praxe nebo jiný přístup. Piš česky, stručně (3-6 vět). Odpovídej přímo, bez úvodu."
    : "Jsi přátelský středoškolský učitel. Student vybral text z výukové stránky a nerozumí mu. Vysvětli ho jednoduše a srozumitelně — jako by student nic nevěděl. Piš česky, stručně (3-6 vět). Klidně použij příklad nebo analogii. Odpovídej přímo, bez úvodu.";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.5,
      max_tokens: 400,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content:
            (pageTitle ? "Stránka: " + pageTitle + "\n\n" : "") +
            "Vybraný text: " +
            text,
        },
      ],
    });
    const explanation = (completion.choices[0].message.content || "").trim();
    // Save to DB (non-blocking, fire-and-forget)
    if (!rephrase && topicPath) {
      pool
        .query(
          "INSERT INTO chat_questions (topic_path, selected_text, explanation) VALUES (?, ?, ?)",
          [topicPath, text, explanation],
        )
        .catch(() => {});
    }
    return res.json({ explanation });
  } catch (e) {
    return res.status(500).json({ error: "explain_failed" });
  }
});

/* ── Public: code evaluation by AI (student-facing) ── */
app.post("/api/quiz/code/evaluate", async (req, res) => {
  const code = String(req.body.code || "")
    .trim()
    .slice(0, 3000);
  const prompt = String(req.body.prompt || "")
    .trim()
    .slice(0, 500);
  const language = String(req.body.language || "python")
    .trim()
    .replace(/[^a-zA-Z0-9+#_\-\.]/g, "")
    .slice(0, 30);

  if (!code || !prompt) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.4,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "Jsi přátelský učitel programování. Zhodnoť kód studenta.\n" +
            "Odpověz POUZE validním JSON objektem (bez markdown obalení):\n" +
            '{\n  "score": <0-100>,\n  "verdict": "Správně" | "Částečně správně" | "Špatně",\n  "feedback": "konkrétní zpětná vazba v češtině (2-4 věty)",\n  "suggestions": ["tip na zlepšení 1", "tip 2"]\n}',
        },
        {
          role: "user",
          content:
            "Jazyk: " +
            language +
            "\nZadání: " +
            prompt +
            "\n\nKód studenta:\n" +
            code,
        },
      ],
    });
    let json = (completion.choices[0].message.content || "").trim();
    json = json.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "");
    const result = JSON.parse(json);
    return res.json({ result });
  } catch (e) {
    return res.status(500).json({ error: "evaluation_failed" });
  }
});

/* ── Chat questions: save question ── */
app.get("/api/chat-questions", async (req, res) => {
  const topic = normalizeQuestionPath(req.query.topic);
  if (!topic) return res.status(400).json({ error: "topic_required" });
  try {
    const [rows] = await pool.query(
      `SELECT id, topic_path AS topicPath, selected_text AS selectedText, explanation,
              DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') AS createdAt
       FROM chat_questions
       WHERE topic_path = ?
       ORDER BY created_at DESC
       LIMIT 100`,
      [topic],
    );
    return res.json({ questions: rows });
  } catch (err) {
    return res.status(500).json({ error: "db_read_failed" });
  }
});

/* ── Public: AI random quiz – generate question ── */
app.post("/api/quiz/ai-random/question", async (req, res) => {
  const subject = String(req.body.subject || "pv")
    .trim()
    .toLowerCase();
  if (!SUBJECT_HTML_DIRS[subject]) {
    return res.status(400).json({ error: "invalid_subject" });
  }

  const htmlDir = SUBJECT_HTML_DIRS[subject];
  const dirPath = path.join(ROOT_DIR, htmlDir);

  let files;
  try {
    files = fs
      .readdirSync(dirPath)
      .filter((f) => f.endsWith(".html") && f !== "index.html");
  } catch (e) {
    return res.status(500).json({ error: "dir_read_failed" });
  }

  if (files.length === 0) return res.status(404).json({ error: "no_topics" });

  // avoid repeating the last 20 topics
  const rawExclude = req.body.exclude;
  const excludeSet = new Set(
    Array.isArray(rawExclude)
      ? rawExclude
      : rawExclude
        ? [String(rawExclude)]
        : [],
  );
  let candidates = files.filter((f) => !excludeSet.has(f.replace(".html", "")));
  if (candidates.length === 0) candidates = files;

  const file = candidates[Math.floor(Math.random() * candidates.length)];
  const filePath = path.join(dirPath, file);

  let content;
  try {
    content = stripHtmlContent(fs.readFileSync(filePath, "utf-8"));
  } catch (e) {
    return res.status(500).json({ error: "file_read_failed" });
  }

  const topicLabel = file.replace(".html", "").replace(/_/g, " ");

  const SUBJECT_SYSTEM_PROMPTS = {
    cs:
      "Jsi učitel českého jazyka a literatury připravující studenty na maturitu. " +
      "Na základě obsahu tématu vygeneruj JEDNU otevřenou maturitní otázku z češtiny a literatury.\n" +
      "Otázky STŘÍDEJ rovnoměrně mezi těmito kategoriemi (nevybírej vždy jen obsah/děj!):\n" +
      "  - autor: životopis, osobní kontext, duševní svět, dobové vlivy na tvorbu\n" +
      "  - literární kontext: literární období, směr (realismus, romantismus, …), dobové události, srovnání se soudobými autory\n" +
      "  - téma a motivy: hlavní i vedlejší témata díla, symbolika, klíčové motivy\n" +
      "  - jazyk a styl: vypravěčská technika, ich-forma / er-forma, lyrická próza, humor, ironie, …\n" +
      "  - postavy: hlavní a vedlejší postavy, jejich funkce a vztahy\n" +
      "  - obsah / děj: zápletka, klíčové scény, kompozice\n" +
      "Odpověz POUZE validním JSON objektem (bez markdown obalení) v tomto formátu:\n" +
      '{\n  "question": "text otázky",\n  "hints": ["nápověda1", "nápověda2", "nápověda3"],\n  "modelAnswer": "vzorová odpověď (3-6 vět)"\n}\n' +
      "Otázka musí být konkrétní a ověřovat pochopení, ne jen zapamatování. Vše v češtině.",
    pv:
      "Jsi učitel připravující studenty na maturitu z programování. Na základě obsahu tématu vygeneruj JEDNU otevřenou maturitní otázku.\n" +
      "Odpověz POUZE validním JSON objektem (bez markdown obalení) v tomto formátu:\n" +
      '{\n  "question": "text otázky",\n  "hints": ["nápověda1", "nápověda2", "nápověda3"],\n  "modelAnswer": "vzorová odpověď (3-6 vět)"\n}\n' +
      "Otázka musí ověřovat pochopení, ne jen zapamatování. Vše v češtině.",
    site:
      "Jsi učitel připravující studenty na maturitu ze sítí a síťové infrastruktury. Na základě obsahu tématu vygeneruj JEDNU otevřenou maturitní otázku.\n" +
      "Odpověz POUZE validním JSON objektem (bez markdown obalení) v tomto formátu:\n" +
      '{\n  "question": "text otázky",\n  "hints": ["nápověda1", "nápověda2", "nápověda3"],\n  "modelAnswer": "vzorová odpověď (3-6 vět)"\n}\n' +
      "Otázka musí ověřovat pochopení, ne jen zapamatování. Vše v češtině.",
    spv:
      "Jsi učitel připravující studenty na maturitu ze společensko-vědního předmětu. Na základě obsahu tématu vygeneruj JEDNU otevřenou maturitní otázku.\n" +
      "Odpověz POUZE validním JSON objektem (bez markdown obalení) v tomto formátu:\n" +
      '{\n  "question": "text otázky",\n  "hints": ["nápověda1", "nápověda2", "nápověda3"],\n  "modelAnswer": "vzorová odpověď (3-6 vět)"\n}\n' +
      "Otázka musí ověřovat pochopení, ne jen zapamatování. Vše v češtině.",
  };

  const systemPrompt =
    SUBJECT_SYSTEM_PROMPTS[subject] || SUBJECT_SYSTEM_PROMPTS.pv;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.8,
      max_tokens: 600,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: "Téma: " + topicLabel + "\n\nObsah materiálu:\n" + content,
        },
      ],
    });
    let json = (completion.choices[0].message.content || "").trim();
    json = json.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "");
    const question = JSON.parse(json);
    return res.json({ question, topic: file.replace(".html", ""), topicLabel });
  } catch (e) {
    return res.status(500).json({ error: "generation_failed" });
  }
});

/* ── Public: AI random quiz – evaluate answer ── */
app.post("/api/quiz/ai-random/evaluate", async (req, res) => {
  const question = String(req.body.question || "")
    .trim()
    .slice(0, 1000);
  const modelAnswer = String(req.body.modelAnswer || "")
    .trim()
    .slice(0, 2000);
  const userAnswer = String(req.body.userAnswer || "")
    .trim()
    .slice(0, 2000);
  const subject = String(req.body.subject || "")
    .trim()
    .slice(0, 20);
  const topic = String(req.body.topic || "")
    .trim()
    .slice(0, 255);

  if (!question || !userAnswer) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "Jsi přísný ale spravedlivý maturitní zkoušející. Ohodnoť studentovu odpověď.\n" +
            "Odpověz POUZE validním JSON objektem (bez markdown obalení):\n" +
            '{\n  "score": <0-100>,\n  "verdict": "Správně" | "Částečně správně" | "Špatně",\n  "feedback": "konkrétní zpětná vazba (2-4 věty)",\n  "missing": ["co chybělo - každá položka jako krátká fráze"]\n}',
        },
        {
          role: "user",
          content:
            "Otázka: " +
            question +
            "\n\nVzorová odpověď: " +
            modelAnswer +
            "\n\nStudentova odpověď: " +
            userAnswer,
        },
      ],
    });
    let json = (completion.choices[0].message.content || "").trim();
    json = json.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "");
    const result = JSON.parse(json);
    // Save attempt to DB (fire-and-forget)
    if (subject && topic) {
      pool.query(
        "INSERT INTO ai_quiz_attempts (subject, topic, question, user_answer, score, verdict) VALUES (?, ?, ?, ?, ?, ?)",
        [subject, topic, question, userAnswer, result.score || 0, result.verdict || ""]
      ).catch(() => {});
    }
    return res.json({ result });
  } catch (e) {
    return res.status(500).json({ error: "evaluation_failed" });
  }
});

/* ── Public: AI PV+PSS random quiz – get topic ── */
app.post("/api/quiz/ai-pv-pss/topic", async (req, res) => {
  if (isRateLimited(req, "ai-pv-pss-topic", 30, 60 * 1000)) {
    return res.status(429).json({ error: "rate_limited" });
  }

  const rawExclude = req.body.exclude;
  const excludeSet = new Set(
    Array.isArray(rawExclude)
      ? rawExclude.map((v) => String(v || "").trim()).filter(Boolean)
      : rawExclude
        ? [String(rawExclude).trim()]
        : [],
  );

  let candidates = AI_PV_PSS_TOPICS.filter((topic) => !excludeSet.has(topic));
  if (candidates.length === 0) candidates = AI_PV_PSS_TOPICS;

  const topic = candidates[Math.floor(Math.random() * candidates.length)];
  return res.json({ topic });
});

/* ── Public: AI PV+PSS random quiz – evaluate answer ── */
app.post("/api/quiz/ai-pv-pss/evaluate", async (req, res) => {
  if (isRateLimited(req, "ai-pv-pss-evaluate", 10, 60 * 1000)) {
    return res.status(429).json({ error: "rate_limited" });
  }

  const topic = String(req.body.topic || "")
    .trim()
    .slice(0, 500);
  const userAnswer = String(req.body.userAnswer || "")
    .trim()
    .slice(0, 3000);

  if (!topic || !userAnswer) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      max_tokens: 650,
      messages: [
        {
          role: "system",
          content:
            "Jsi přísný ale spravedlivý maturitní zkoušející pro témata PV a počítačových sítí. " +
            "Vyhodnoť odpověď studenta k zadanému tématu. " +
            "Odpověz POUZE validním JSON objektem (bez markdown obalení):\n" +
            '{\n  "score": <0-100>,\n  "verdict": "Správně" | "Částečně správně" | "Špatně",\n  "feedback": "konkrétní zpětná vazba (2-4 věty)",\n  "missing": ["co zásadního chybělo - krátká fráze"]\n}',
        },
        {
          role: "user",
          content:
            "Téma: " +
            topic +
            "\n\nStudentova odpověď:\n" +
            userAnswer +
            "\n\nOvěř věcnou správnost, úplnost a použití správných termínů.",
        },
      ],
    });
    let json = (completion.choices[0].message.content || "").trim();
    json = json.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "");
    const result = JSON.parse(json);
    return res.json({ result });
  } catch (e) {
    return res.status(500).json({ error: "evaluation_failed" });
  }
});

/* ── Build in-memory full-text search index ── */
const SEARCH_INDEX = [];

function buildSearchIndex() {
  const catalogPath = path.join(ROOT_DIR, "assets", "questions-catalog.json");
  let catalog = [];
  try {
    catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
  } catch (e) {}

  const catalogMap = Object.create(null);
  catalog.forEach((item) => {
    catalogMap[item.path] = item.title;
  });

  const dirs = [
    { dir: "maturitniOtazkyPv_html", source: "pv" },
    { dir: "maturitniOtazkySite", source: "site" },
    { dir: "maturitniOtazkySpv_html", source: "spv" },
    { dir: "maturitniOtazkyCs_html", source: "cs" },
  ];

  dirs.forEach(({ dir, source }) => {
    const fullDir = path.join(ROOT_DIR, dir);
    let files;
    try {
      files = fs
        .readdirSync(fullDir)
        .filter((f) => f.endsWith(".html") && f !== "index.html");
    } catch (e) {
      return;
    }
    files.forEach((file) => {
      const filePath = path.join(fullDir, file);
      const itemPath = dir + "/" + file;
      let html;
      try {
        html = fs.readFileSync(filePath, "utf-8");
      } catch (e) {
        return;
      }
      const text = stripHtmlContent(html);
      const title =
        catalogMap[itemPath] || file.replace(".html", "").replace(/_/g, " ");
      SEARCH_INDEX.push({ path: itemPath, source, title, text });
    });
  });
}

buildSearchIndex();

function normSearch(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/* ── Public: full-text search across all questions ── */
app.get("/api/search", (req, res) => {
  const raw = String(req.query.q || "")
    .trim()
    .slice(0, 200);
  if (!raw) return res.json({ results: [] });

  const q = normSearch(raw);
  const results = [];

  for (const item of SEARCH_INDEX) {
    const normText = normSearch(item.text);
    const normTitle = normSearch(item.title);
    const textIdx = normText.indexOf(q);
    const titleMatch = normTitle.includes(q);

    if (textIdx === -1 && !titleMatch) continue;

    let snippet = "";
    if (textIdx !== -1) {
      const start = Math.max(0, textIdx - 80);
      const end = Math.min(item.text.length, textIdx + q.length + 120);
      snippet =
        (start > 0 ? "…" : "") +
        item.text.slice(start, end).trim() +
        (end < item.text.length ? "…" : "");
    }

    results.push({
      title: item.title,
      path: item.path,
      source: item.source,
      snippet,
    });
    if (results.length >= 50) break;
  }

  return res.json({ results });
});

app.use(express.static(ROOT_DIR));

app.get("*", (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "index.html"));
});

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_questions (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        topic_path VARCHAR(255) NOT NULL,
        selected_text TEXT NOT NULL,
        explanation TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_cq_topic (topic_path),
        KEY idx_cq_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_czech_ci
    `);
    console.log("DB schema OK");
  } catch (err) {
    console.error("DB init error:", err.message);
  }
}

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Maturitni web bezi na http://localhost:${PORT}`);
  });
});

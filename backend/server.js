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

app.use(express.static(ROOT_DIR));

app.get("*", (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Maturitni web bezi na http://localhost:${PORT}`);
});

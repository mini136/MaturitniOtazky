const path = require("path");
const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const fs = require("fs");
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
  ["maturitniOtazkyPv_html", "maturitniOtazkySite"].forEach((dir) => {
    const full = path.join(ROOT_DIR, dir);
    try {
      fs.readdirSync(full).forEach((f) => {
        if (f.endsWith(".html") && f !== "index.html") {
          pages.push({
            source: dir.includes("Site") ? "site" : "pv",
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

app.use(express.static(ROOT_DIR));

app.get("*", (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Maturitni web bezi na http://localhost:${PORT}`);
});

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const pool = require("../db");

// ── List all chat sessions for the user ──────────────────────────
router.get("/sessions", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, created_at, updated_at 
       FROM chat_sessions 
       WHERE user_id = ? 
       ORDER BY updated_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar sessões de chat." });
  }
});

// ── Create a new chat session ────────────────────────────────────
router.post("/sessions", auth, async (req, res) => {
  try {
    const title = req.body.title || "Novo Chat";
    const [result] = await pool.query(
      "INSERT INTO chat_sessions (user_id, title) VALUES (?, ?)",
      [req.user.id, title]
    );
    res.status(201).json({ id: result.insertId, title, created_at: new Date().toISOString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar sessão de chat." });
  }
});

// ── Delete a chat session (and its messages) ─────────────────────
router.delete("/sessions/:id", auth, async (req, res) => {
  try {
    const sessionId = req.params.id;
    await pool.query(
      "DELETE FROM chat_history WHERE session_id = ? AND user_id = ?",
      [sessionId, req.user.id]
    );
    await pool.query(
      "DELETE FROM chat_sessions WHERE id = ? AND user_id = ?",
      [sessionId, req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao apagar sessão." });
  }
});

// ── Rename a chat session ────────────────────────────────────────
router.put("/sessions/:id", auth, async (req, res) => {
  try {
    const { title } = req.body;
    await pool.query(
      "UPDATE chat_sessions SET title = ? WHERE id = ? AND user_id = ?",
      [title, req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao renomear sessão." });
  }
});

// ── Get messages for a specific session ──────────────────────────
router.get("/sessions/:id/messages", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT role, content FROM chat_history 
       WHERE user_id = ? AND session_id = ? 
       ORDER BY sent_at ASC`,
      [req.user.id, req.params.id]
    );
    const mapped = rows.map((r) => ({ ...r, role: r.role === "model" ? "assistant" : r.role }));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao obter mensagens." });
  }
});

// ── Save a message to a session ──────────────────────────────────
router.post("/sessions/:id/messages", auth, async (req, res) => {
  const { role, content } = req.body;
  if (!role || !content) {
    return res.status(400).json({ error: "Role e content são obrigatórios." });
  }
  const dbRole = (role === "assistant" || role === "model") ? "model" : "user";

  try {
    await pool.query(
      "INSERT INTO chat_history (user_id, session_id, role, content) VALUES (?, ?, ?, ?)",
      [req.user.id, req.params.id, dbRole, content]
    );

    // Auto-title: if it's the first user message, rename the session
    if (dbRole === "user") {
      const [session] = await pool.query(
        "SELECT title FROM chat_sessions WHERE id = ? AND user_id = ?",
        [req.params.id, req.user.id]
      );
      if (session.length > 0 && session[0].title === "Novo Chat") {
        const shortTitle = content.length > 40 ? content.substring(0, 40) + "..." : content;
        await pool.query(
          "UPDATE chat_sessions SET title = ? WHERE id = ? AND user_id = ?",
          [shortTitle, req.params.id, req.user.id]
        );
      }
      // Touch updated_at
      await pool.query(
        "UPDATE chat_sessions SET updated_at = NOW() WHERE id = ? AND user_id = ?",
        [req.params.id, req.user.id]
      );
    }

    res.status(201).json({ message: "Mensagem guardada com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao guardar mensagem." });
  }
});

// ══ LEGACY ENDPOINTS (backward-compatible) ═══════════════════════
// GET /chat — returns ALL messages (flat, no session awareness)
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT role, content FROM chat_history WHERE user_id = ? ORDER BY sent_at ASC",
      [req.user.id]
    );
    const mapped = rows.map((r) => ({ ...r, role: r.role === "model" ? "assistant" : r.role }));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao obter histórico de chat." });
  }
});

// POST /chat — save message (legacy, no session)
router.post("/", auth, async (req, res) => {
  const { role, content } = req.body;
  if (!role || !content) {
    return res.status(400).json({ error: "Role e content são obrigatórios." });
  }
  const dbRole = (role === "assistant" || role === "model") ? "model" : "user";

  try {
    await pool.query(
      "INSERT INTO chat_history (user_id, role, content) VALUES (?, ?, ?)",
      [req.user.id, dbRole, content]
    );
    res.status(201).json({ message: "Mensagem guardada com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao guardar mensagem." });
  }
});

module.exports = router;

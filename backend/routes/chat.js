const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const pool = require("../db");

// Obter historial de chat do utilizador
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT role, content FROM chat_history WHERE user_id = ? ORDER BY sent_at ASC",
      [req.user.id]
    );
    // Map DB 'model' role back to 'assistant' for frontend
    const mapped = rows.map((r) => ({ ...r, role: r.role === "model" ? "assistant" : r.role }));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao obter histórico de chat." });
  }
});

// Guardar nova mensagem no historial
router.post("/", auth, async (req, res) => {
  const { role, content } = req.body;
  if (!role || !content) {
    return res.status(400).json({ error: "Role e content são obrigatórios." });
  }

  // Map 'assistant' to 'model' since that's what the DB enum accepts ('user'|'model')
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

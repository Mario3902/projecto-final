const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// Get full profile info
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, age, grade, course, goal, interests FROM users WHERE id = ?", [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Utilizador não encontrado." });
    
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar perfil." });
  }
});

// Update profile
router.put("/", auth, async (req, res) => {
  try {
    const { course, goal, grade } = req.body;
    await db.query(
      "UPDATE users SET course = ?, goal = ?, grade = ? WHERE id = ?",
      [course, goal, grade, req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar perfil." });
  }
});

module.exports = router;

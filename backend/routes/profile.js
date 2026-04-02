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

// Update profile (supports partial updates)
router.put("/", auth, async (req, res) => {
  try {
    const { name, age, course, goal, grade, interests } = req.body;
    
    const fields = [];
    const values = [];
    
    if (name !== undefined)      { fields.push("name = ?");      values.push(name); }
    if (age !== undefined)       { fields.push("age = ?");       values.push(age); }
    if (course !== undefined)    { fields.push("course = ?");    values.push(course); }
    if (goal !== undefined)      { fields.push("goal = ?");      values.push(goal); }
    if (grade !== undefined)     { fields.push("grade = ?");     values.push(grade); }
    if (interests !== undefined) { fields.push("interests = ?"); values.push(JSON.stringify(interests)); }
    
    if (fields.length === 0) return res.status(400).json({ error: "Nada para atualizar." });
    
    values.push(req.user.id);
    await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
    
    // Return updated profile
    const [rows] = await db.query("SELECT id, name, age, grade, course, goal, interests FROM users WHERE id = ?", [req.user.id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar perfil." });
  }
});

module.exports = router;

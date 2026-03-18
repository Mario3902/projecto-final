const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// Get quiz history
router.get("/results", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT subject, score, total, xp_earned, is_vocational, DATE_FORMAT(played_at, '%Y-%m-%d') as date
       FROM quiz_results 
       WHERE user_id = ? ORDER BY played_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar resultados de quiz." });
  }
});

// Save quiz result
router.post("/result", auth, async (req, res) => {
  try {
    const { subject, score, total, xpEarned, isVocational } = req.body;

    const [result] = await db.query(
      "INSERT INTO quiz_results (user_id, subject, score, total, xp_earned, is_vocational) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.id, subject, score, total, xpEarned, isVocational || false]
    );

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao guardar quiz." });
  }
});

// Save vocational result
router.post("/vocational", auth, async (req, res) => {
  try {
    const { inclination, focusSubjects, careers } = req.body;

    const [result] = await db.query(
      "INSERT INTO vocational_results (user_id, inclination, focus_subjects, careers) VALUES (?, ?, ?, ?)",
      [req.user.id, inclination, JSON.stringify(focusSubjects), JSON.stringify(careers)]
    );

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao guardar resultado vocacional." });
  }
});

module.exports = router;

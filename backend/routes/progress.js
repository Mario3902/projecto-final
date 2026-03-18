const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// Get progress stats
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT xp, level, streak, study_hours, quizzes_completed FROM user_progress WHERE user_id = ?",
      [req.user.id]
    );
    res.json(rows[0] || { xp: 0, level: 1, streak: 0, study_hours: 0, quizzes_completed: 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar progresso." });
  }
});

// Add XP
router.post("/xp", auth, async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Ler progresso atual
    const [rows] = await db.query("SELECT xp, level FROM user_progress WHERE user_id = ?", [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Progresso não encontrado." });
    
    let { xp, level } = rows[0];
    xp += amount;
    
    // Level up logic (100 XP per level)
    const newLevel = Math.floor(xp / 100) + 1;
    let leveledUp = false;
    if (newLevel > level) {
      level = newLevel;
      leveledUp = true;
    }

    await db.query("UPDATE user_progress SET xp = ?, level = ? WHERE user_id = ?", [xp, level, req.user.id]);
    res.json({ xp, level, leveledUp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao adicionar XP." });
  }
});

// Register study time
router.post("/study", auth, async (req, res) => {
  try {
    const { minutes } = req.body;
    const hours = minutes / 60;
    await db.query("UPDATE user_progress SET study_hours = study_hours + ? WHERE user_id = ?", [hours, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao registar tempo de estudo." });
  }
});

// Reset progress (clear old mock data)
router.post("/reset", auth, async (req, res) => {
  try {
    await db.query(
      "UPDATE user_progress SET xp = 0, level = 1, streak = 0, study_hours = 0, quizzes_completed = 0 WHERE user_id = ?",
      [req.user.id]
    );
    res.json({ xp: 0, level: 1, streak: 0, study_hours: 0, quizzes_completed: 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao resetar progresso." });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// Get progress stats (+ auto-update streak)
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT xp, level, streak, study_hours, quizzes_completed, last_active_date FROM user_progress WHERE user_id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.json({ xp: 0, level: 1, streak: 0, study_hours: 0, quizzes_completed: 0 });
    }

    const progress = rows[0];

    // --- Streak logic ---
    const toLocalDateStr = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = toLocalDateStr(today);

    // Parse last_active_date as local date to avoid UTC timezone shift
    let lastActive = null;
    if (progress.last_active_date) {
      const raw =
        typeof progress.last_active_date === "string"
          ? progress.last_active_date
          : progress.last_active_date.toISOString().split("T")[0];
      const [y, m, d] = raw.split("-").map(Number);
      lastActive = new Date(y, m - 1, d);
    }

    let newStreak = progress.streak || 0;

    if (!lastActive) {
      newStreak = 1;
    } else {
      const diffMs = today.getTime() - lastActive.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day — streak stays the same
      } else if (diffDays === 1) {
        // Consecutive day — increment streak
        newStreak += 1;
      } else {
        // Missed one or more days — reset to 1
        newStreak = 1;
      }
    }

    // Only write to DB if something changed
    const lastActiveStr = lastActive ? toLocalDateStr(lastActive) : null;
    if (newStreak !== progress.streak || lastActiveStr !== todayStr) {
      await db.query(
        "UPDATE user_progress SET streak = ?, last_active_date = ? WHERE user_id = ?",
        [newStreak, todayStr, req.user.id]
      );
    }

    res.json({
      xp: progress.xp,
      level: progress.level,
      streak: newStreak,
      study_hours: progress.study_hours,
      quizzes_completed: progress.quizzes_completed,
    });
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

const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// Save completed Pomodoro session
router.post("/", auth, async (req, res) => {
  try {
    const { subject_id, subject_name, topic, duration_minutes, xp_earned } = req.body;
    const [result] = await db.query(
      `INSERT INTO pomodoro_sessions (user_id, subject_id, subject_name, topic, duration_minutes, xp_earned)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, subject_id || null, subject_name || "Estudo Livre", topic || null, duration_minutes || 25, xp_earned || 25]
    );
    res.json({
      id: result.insertId,
      subject_name: subject_name || "Estudo Livre",
      topic,
      duration_minutes: duration_minutes || 25,
      xp_earned: xp_earned || 25,
      completed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao guardar sessão Pomodoro." });
  }
});

// Get Pomodoro sessions (optionally filtered by date)
router.get("/", auth, async (req, res) => {
  try {
    const { date } = req.query;
    let query = `SELECT id, subject_id, subject_name, topic, duration_minutes, xp_earned, 
                 DATE_FORMAT(completed_at, '%Y-%m-%d') as date,
                 DATE_FORMAT(completed_at, '%H:%i') as time
                 FROM pomodoro_sessions WHERE user_id = ?`;
    const params = [req.user.id];

    if (date) {
      query += ` AND DATE(completed_at) = ?`;
      params.push(date);
    }

    query += ` ORDER BY completed_at DESC LIMIT 50`;

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar sessões." });
  }
});

// Get calendar heatmap data - study minutes per day for a given month
router.get("/calendar", auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;

    const [rows] = await db.query(
      `SELECT DATE_FORMAT(completed_at, '%Y-%m-%d') as date, 
              SUM(duration_minutes) as total_minutes,
              COUNT(*) as sessions_count,
              SUM(xp_earned) as total_xp
       FROM pomodoro_sessions 
       WHERE user_id = ? AND YEAR(completed_at) = ? AND MONTH(completed_at) = ?
       GROUP BY DATE(completed_at)
       ORDER BY date`,
      [req.user.id, y, m]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar dados do calendário." });
  }
});

// Get Pomodoro stats summary
router.get("/stats", auth, async (req, res) => {
  try {
    const [totalRows] = await db.query(
      `SELECT COUNT(*) as total_sessions, 
              COALESCE(SUM(duration_minutes), 0) as total_minutes,
              COALESCE(SUM(xp_earned), 0) as total_xp
       FROM pomodoro_sessions WHERE user_id = ?`,
      [req.user.id]
    );
    const [todayRows] = await db.query(
      `SELECT COUNT(*) as today_sessions, 
              COALESCE(SUM(duration_minutes), 0) as today_minutes,
              COALESCE(SUM(xp_earned), 0) as today_xp
       FROM pomodoro_sessions WHERE user_id = ? AND DATE(completed_at) = CURDATE()`,
      [req.user.id]
    );
    res.json({
      ...totalRows[0],
      ...todayRows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar estatísticas." });
  }
});

module.exports = router;

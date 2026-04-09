const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// Get all calendar events for the user
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, title, event_date, event_type, subject_name, description
       FROM academic_calendar 
       WHERE user_id = ? 
       ORDER BY event_date ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar eventos do calendário." });
  }
});

// Get upcoming events (next 7 days)
router.get("/upcoming", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, title, event_date, event_type, subject_name, description
       FROM academic_calendar 
       WHERE user_id = ? AND event_date >= CURDATE() AND event_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
       ORDER BY event_date ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar próximos eventos." });
  }
});

// Bulk submit entire academic calendar (one-time submission)
router.post("/bulk", auth, async (req, res) => {
  const { events } = req.body;
  if (!events || !Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ error: "Lista de eventos é obrigatória." });
  }

  try {
    // Prepare values for bulk insert
    const values = events.map(e => [
      req.user.id,
      e.title,
      e.event_date,
      e.event_type || "evento",
      e.subject_name || null,
      e.description || null
    ]);

    await db.query(
      `INSERT INTO academic_calendar (user_id, title, event_date, event_type, subject_name, description)
       VALUES ?`,
      [values]
    );

    res.status(201).json({ message: "Calendário submetido com sucesso!", count: events.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao submeter calendário." });
  }
});

// Clear all calendar events (to resubmit)
router.delete("/all", auth, async (req, res) => {
  try {
    await db.query(
      `DELETE FROM academic_calendar WHERE user_id = ?`,
      [req.user.id]
    );
    res.json({ message: "Calendário limpo com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao limpar calendário." });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// Get the user's weekly schedule
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, day_of_week, TIME_FORMAT(start_time, '%H:%i') as start_time, TIME_FORMAT(end_time, '%H:%i') as end_time, subject_name
       FROM weekly_schedule 
       WHERE user_id = ? 
       ORDER BY FIELD(day_of_week, 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'), start_time ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar horário de aulas." });
  }
});

// Submit the entire weekly schedule
router.post("/bulk", auth, async (req, res) => {
  const { classes } = req.body;
  if (!classes || !Array.isArray(classes) || classes.length === 0) {
    return res.status(400).json({ error: "Lista de aulas é obrigatória." });
  }

  try {
    const values = classes.map(c => [
      req.user.id,
      c.day_of_week,
      c.start_time,
      c.end_time,
      c.subject_name
    ]);

    await db.query(`DELETE FROM weekly_schedule WHERE user_id = ?`, [req.user.id]);
    await db.query(
      `INSERT INTO weekly_schedule (user_id, day_of_week, start_time, end_time, subject_name) VALUES ?`,
      [values]
    );

    res.status(201).json({ message: "Horário guardado com sucesso!", count: classes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao submeter horário de aulas." });
  }
});

// Delete entire schedule
router.delete("/all", auth, async (req, res) => {
  try {
    await db.query(`DELETE FROM weekly_schedule WHERE user_id = ?`, [req.user.id]);
    res.json({ message: "Horário limpo com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao limpar horário." });
  }
});

module.exports = router;

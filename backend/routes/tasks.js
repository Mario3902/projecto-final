const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// List all tasks
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, title, done, DATE_FORMAT(task_date, '%Y-%m-%d') as date FROM tasks WHERE user_id = ? ORDER BY created_at DESC", 
      [req.user.id]
    );
    // converte tinyint done para boolean
    const tasks = rows.map(r => ({ ...r, done: r.done === 1 }));
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar tarefas." });
  }
});

// Create task
router.post("/", auth, async (req, res) => {
  try {
    const { title, date } = req.body;
    const taskDate = date || new Date().toISOString().split("T")[0];
    const [result] = await db.query(
      "INSERT INTO tasks (user_id, title, task_date) VALUES (?, ?, ?)",
      [req.user.id, title, taskDate]
    );
    res.json({ id: result.insertId, title, done: false, date: taskDate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar tarefa." });
  }
});

// Toggle done status
router.put("/:id/toggle", auth, async (req, res) => {
  try {
    const { id } = req.params;
    // read current status
    const [rows] = await db.query("SELECT done FROM tasks WHERE id = ? AND user_id = ?", [id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Tarefa não encontrada." });

    const newStatus = rows[0].done === 1 ? 0 : 1;
    await db.query("UPDATE tasks SET done = ? WHERE id = ? AND user_id = ?", [newStatus, id, req.user.id]);
    
    res.json({ success: true, done: newStatus === 1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar tarefa." });
  }
});

// Delete task
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM tasks WHERE id = ? AND user_id = ?", [id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao remover tarefa." });
  }
});

module.exports = router;

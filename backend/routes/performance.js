const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// Get all grades and averages
router.get("/", auth, async (req, res) => {
  try {
    const [grades] = await db.query(
      `SELECT sg.id, sg.subject_id, sg.grade, sg.trimester, sg.test_type, s.name as subject_name 
       FROM subject_grades sg
       JOIN subjects s ON sg.subject_id = s.id
       WHERE sg.user_id = ?
       ORDER BY sg.trimester ASC, sg.test_type ASC`,
      [req.user.id]
    );

    res.json({ grades });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar desempenho." });
  }
});

// Add a grade
router.post("/grade", auth, async (req, res) => {
  try {
    const { subjectId, grade, trimester, testType } = req.body;
    
    // Validate subject ownership
    const [sub] = await db.query("SELECT id FROM subjects WHERE id = ? AND user_id = ?", [subjectId, req.user.id]);
    if (sub.length === 0) return res.status(403).json({ error: "Disciplina inválida." });

    const [result] = await db.query(
      `INSERT INTO subject_grades (user_id, subject_id, grade, trimester, test_type) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE grade = VALUES(grade)`,
      [req.user.id, subjectId, grade, trimester, testType]
    );

    res.json({ success: true, id: result.insertId || result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao adicionar nota." });
  }
});

module.exports = router;

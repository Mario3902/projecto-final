const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// Get subjects and their materials
router.get("/", auth, async (req, res) => {
  try {
    // Pegar disciplinas
    const [subjects] = await db.query("SELECT id, name, emoji FROM subjects WHERE user_id = ?", [req.user.id]);
    
    // Para simplificar, vamos buscar os materiais de uma vez e agregar
    if (subjects.length === 0) return res.json([]);
    
    const subjectIds = subjects.map(s => s.id);
    const [materials] = await db.query(
      `SELECT id, subject_id, name as title, content, type, DATE_FORMAT(created_at, '%Y-%m-%d') as created_at 
       FROM subject_materials WHERE subject_id IN (?)`,
       [subjectIds]
    );

    const result = subjects.map(sub => {
      return {
        ...sub,
        materials: materials.filter(m => m.subject_id === sub.id)
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar disciplinas." });
  }
});

// Add subject
router.post("/", auth, async (req, res) => {
  try {
    const { name, emoji } = req.body;
    const [result] = await db.query(
      "INSERT INTO subjects (user_id, name, emoji) VALUES (?, ?, ?)",
      [req.user.id, name, emoji || '📚']
    );
    res.json({ id: result.insertId, name, emoji: emoji || '📚', materials: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar disciplina." });
  }
});

// Delete subject
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM subjects WHERE id = ? AND user_id = ?", [id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao remover disciplina." });
  }
});

// Add Material
router.post("/:subjectId/materials", auth, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { title, content, type, isLink } = req.body;

    // Verificar se a disciplina pertence ao user
    const [sub] = await db.query("SELECT id FROM subjects WHERE id = ? AND user_id = ?", [subjectId, req.user.id]);
    if (sub.length === 0) return res.status(403).json({ error: "Disciplina não encontrada/acesso negado." });

    const [result] = await db.query(
      "INSERT INTO subject_materials (subject_id, name, content, type) VALUES (?, ?, ?, ?)",
      [subjectId, title, content, type]
    );

    res.json({ id: result.insertId, subject_id: parseInt(subjectId), title, content, type, created_at: new Date().toISOString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao adicionar material." });
  }
});

// Remove Material
router.delete("/materials/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    // Usamos um delete com JOIN implicito para segurar q o material é de um subject q pertence ao user
    await db.query(
      `DELETE sm FROM subject_materials sm
       JOIN subjects s ON sm.subject_id = s.id
       WHERE sm.id = ? AND s.user_id = ?`,
       [id, req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao remover material." });
  }
});

module.exports = router;

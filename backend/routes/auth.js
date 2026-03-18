const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

// Registo
router.post("/register", async (req, res) => {
  try {
    const { name, age, grade, course, goal, interests, password } = req.body;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.query(
      `INSERT INTO users (name, age, grade, course, goal, interests, password) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, age, grade, course, goal, JSON.stringify(interests), hashedPassword]
    );

    const userId = result.insertId;

    // Initialize progress record
    await db.query(
      "INSERT INTO user_progress (user_id, xp, level, streak, quizzes_completed) VALUES (?, 120, 1, 3, 0)",
      [userId]
    );

    // Create token
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || "nzila_super_secret_key_2024", { expiresIn: "30d" });

    res.json({ token, user: { id: userId, name, course } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao registar utilizador." });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body; // Example using name or create an email field in the future
    
    const [rows] = await db.query("SELECT * FROM users WHERE name = ?", [name]);
    if (rows.length === 0) return res.status(400).json({ error: "Utilizador ou password incorretos." });

    const user = rows[0];
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: "Utilizador ou password incorretos." });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "nzila_super_secret_key_2024", { expiresIn: "30d" });
    res.json({ token, user: { id: user.id, name: user.name, course: user.course } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao fazer login." });
  }
});

module.exports = router;

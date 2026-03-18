const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const progressRoutes = require("./routes/progress");
const tasksRoutes = require("./routes/tasks");
const subjectsRoutes = require("./routes/subjects");
const performanceRoutes = require("./routes/performance");
const quizzesRoutes = require("./routes/quizzes");
const chatRoutes = require("./routes/chat");

const app = express();

app.use(cors());
app.use(express.json());

// Main Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/quizzes", quizzesRoutes);
app.use("/api/chat", chatRoutes);

// General Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Ocorreu um erro interno no servidor." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Nzila Backend API a correr na porta ${PORT}`);
});

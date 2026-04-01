-- =============================================================
-- NZILA DATABASE SCHEMA
-- =============================================================
CREATE DATABASE IF NOT EXISTS nzila_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nzila_db;

-- -------------------------------------------------------------
-- 1. UTILIZADORES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120)         NOT NULL,
  age         INT,
  grade       VARCHAR(30),
  course      VARCHAR(120),
  goal        TEXT,
  interests   JSON,
  password    VARCHAR(255)         NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 2. PROGRESSO / GAMIFICAÇÃO
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_progress (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT NOT NULL UNIQUE,
  xp                  INT DEFAULT 0,
  level               INT DEFAULT 1,
  streak              INT DEFAULT 0,
  study_hours         DECIMAL(6,2) DEFAULT 0.00,
  quizzes_completed   INT DEFAULT 0,
  last_active_date    DATE,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 3. TAREFAS (PLANNER)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  title       VARCHAR(255) NOT NULL,
  done        BOOLEAN DEFAULT FALSE,
  task_date   DATE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 4. DISCIPLINAS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  name        VARCHAR(120) NOT NULL,
  emoji       VARCHAR(10)  DEFAULT '📚',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 5. MATERIAIS POR DISCIPLINA
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subject_materials (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  subject_id  INT NOT NULL,
  name        VARCHAR(255),
  content     TEXT,
  type        ENUM('proof','summary','exercises','other') DEFAULT 'other',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 6. NOTAS POR DISCIPLINA (escala 0-20)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subject_grades (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  subject_id  INT NOT NULL,
  grade       DECIMAL(4,1) NOT NULL CHECK (grade >= 0 AND grade <= 20),
  trimester   ENUM('T1', 'T2', 'T3') NOT NULL,
  test_type   ENUM('p1', 'p2') NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE KEY unique_grade (user_id, subject_id, trimester, test_type)
);

-- -------------------------------------------------------------
-- 7. RESULTADOS DE QUIZ
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_results (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  subject      VARCHAR(120),
  score        INT,
  total        INT,
  xp_earned    INT DEFAULT 0,
  is_vocational BOOLEAN DEFAULT FALSE,
  played_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 8. HISTÓRICO DO CHAT COM A IA
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_history (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  role        ENUM('user','model') NOT NULL,
  content     TEXT NOT NULL,
  sent_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 9. RESULTADOS VOCACIONAIS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vocational_results (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  inclination  TEXT,
  focus_subjects JSON,
  careers      JSON,
  taken_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 10. SESSÕES POMODORO
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  subject_id       INT,
  subject_name     VARCHAR(120) DEFAULT 'Estudo Livre',
  topic            VARCHAR(255),
  duration_minutes INT DEFAULT 25,
  xp_earned        INT DEFAULT 25,
  completed_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);


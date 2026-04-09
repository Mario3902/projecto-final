-- Migration: Create academic_calendar table
-- Run this in your MySQL database (nzila_db)

CREATE TABLE IF NOT EXISTS academic_calendar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  event_type ENUM('prova','entrega','feriado','evento','outro') DEFAULT 'evento',
  subject_name VARCHAR(100) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for faster queries
CREATE INDEX idx_calendar_user_date ON academic_calendar(user_id, event_date);

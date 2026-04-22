const pool = require('./db');

async function migrate() {
  try {
    // 1. Create chat_sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) DEFAULT 'Novo Chat',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('[OK] chat_sessions table created.');

    // 2. Add session_id column to chat_history (ignore if exists)
    try {
      await pool.query(`ALTER TABLE chat_history ADD COLUMN session_id INT DEFAULT NULL`);
      console.log('[OK] session_id column added to chat_history.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('[SKIP] session_id column already exists.');
      } else {
        throw e;
      }
    }

    // 3. Migrate existing messages: group them into one session per user
    const [users] = await pool.query(
      `SELECT DISTINCT user_id FROM chat_history WHERE session_id IS NULL`
    );
    for (const row of users) {
      const [result] = await pool.query(
        `INSERT INTO chat_sessions (user_id, title) VALUES (?, ?)`,
        [row.user_id, 'Chat Anterior']
      );
      await pool.query(
        `UPDATE chat_history SET session_id = ? WHERE user_id = ? AND session_id IS NULL`,
        [result.insertId, row.user_id]
      );
      console.log(`[OK] Migrated messages for user ${row.user_id} -> session ${result.insertId}`);
    }

    console.log('\nMigration complete!');
    process.exit(0);
  } catch (e) {
    console.error('Migration Error:', e);
    process.exit(1);
  }
}

migrate();

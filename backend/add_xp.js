const pool = require('./db');

async function addXP() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log("Uso: node add_xp.js <ID_DO_UTILIZADOR> <XP_A_ADICIONAR>");
    console.log("Exemplo: node add_xp.js 1 500");
    process.exit(1);
  }

  const userId = parseInt(args[0], 10);
  const xpToAdd = parseInt(args[1], 10);

  if (isNaN(userId) || isNaN(xpToAdd)) {
    console.log("Erro: O ID e o XP devem ser números válidos.");
    process.exit(1);
  }

  try {
    // 1. Procurar o utilizador
    const [userRows] = await pool.query('SELECT name FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) {
      console.log(`Erro: Utilizador com ID ${userId} não encontrado.`);
      process.exit(1);
    }
    const userName = userRows[0].name;

    // 2. Procurar o XP atual
    const [progressRows] = await pool.query('SELECT xp, level FROM user_progress WHERE user_id = ?', [userId]);
    if (progressRows.length === 0) {
      console.log(`Erro: Perfil de progresso não encontrado para o utilizador ${userName}.`);
      process.exit(1);
    }

    const currentXp = progressRows[0].xp;
    const currentLevel = progressRows[0].level;
    const newXp = currentXp + xpToAdd;

    // 3. Atualizar o XP na base de dados (e calcular novo nível simples)
    // Se o nível depender do XP na app, podemos atualizar também.
    // Exemplo: Nível sobe a cada 100 XP
    const newLevel = Math.max(currentLevel, Math.floor(newXp / 100) + 1);

    await pool.query('UPDATE user_progress SET xp = ?, level = ? WHERE user_id = ?', [newXp, newLevel, userId]);

    console.log(`✅ Sucesso! Foram adicionados ${xpToAdd} XP ao utilizador ${userName} (ID: ${userId}).`);
    console.log(`📊 O XP total agora é ${newXp} (Nível ${newLevel}).`);

  } catch (error) {
    console.error("Erro na base de dados:", error);
  } finally {
    process.exit(0);
  }
}

addXP();

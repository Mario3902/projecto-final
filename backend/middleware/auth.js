const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || "nzila_super_secret_key_2024");
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Token inválido." });
  }
};

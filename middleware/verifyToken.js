const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Token requerido.' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), 'SECRET_KEY');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

module.exports = verifyToken; 
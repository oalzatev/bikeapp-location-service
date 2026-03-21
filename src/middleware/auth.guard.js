// AuthGuard — verifica JWT compartido con Auth Service
const jwt = require('jsonwebtoken');

const authGuard = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token de autenticación requerido' });
  }
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'supersecretkey');
    next();
  } catch {
    return res.status(403).json({ success: false, message: 'Token inválido o expirado' });
  }
};

module.exports = { authGuard };

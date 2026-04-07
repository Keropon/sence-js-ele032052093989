import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'super_secreto';

export const verificarToken = (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer '))
    token = req.headers.authorization.split(' ')[1];

  if (!token) {
    if (req.originalUrl.startsWith('/api'))
      return res.status(401).json({ ok: false, error: 'Acceso denegado. Token requerido.' });

    return res.redirect('/login');
  }

  try {
    const payload = jwt.verify(token, SECRET);
    req.usuario = payload;
    next();
  } catch (error) {
    if (req.originalUrl.startsWith('/api'))
      return res.status(403).json({ ok: false, error: 'Token inválido o expirado.' });

    res.clearCookie('token');
    return res.redirect('/login');
  }
};

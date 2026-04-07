import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'super_secreto';

export const redirectIfAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, SECRET);
      return res.redirect('/dashboard');
    }
  } catch { /* invalid or missing token — proceed to the page normally */ }
  next();
};

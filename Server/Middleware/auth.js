import jwt from 'jsonwebtoken';

export default function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Token não fornecido' });
  const parts = header.split(' ');
  if (parts.length !== 2) return res.status(401).json({ message: 'Formato de token inválido' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

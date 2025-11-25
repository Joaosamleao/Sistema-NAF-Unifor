import jwt from 'jsonwebtoken';

export const login = (req, res) => {
  const { username, password } = req.body;
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS || !process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'Auth not configured on server. Set ADMIN_USER, ADMIN_PASS and JWT_SECRET in .env' });
  }

  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token });
  }

  return res.status(401).json({ message: 'Credenciais inválidas' });
};

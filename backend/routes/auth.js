const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = ? OR u.username = ? LIMIT 1',
      [email || username, username || email]
    );
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // Log login
    await db.query('INSERT INTO login_log (user_id, login_time, status) VALUES (?, NOW(), ?)', [user.id, 'success']);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role_name },
      process.env.JWT_SECRET || 'mtl_secret',
      { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, name: user.full_name, username: user.username, email: user.email, role: user.role_name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { full_name, username, email, password, phone, department_id, role_id } = req.body;
  try {
    const [exists] = await db.query('SELECT id FROM users WHERE email=? OR username=?', [email, username]);
    if (exists.length) return res.status(400).json({ error: 'Email or username already exists' });
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (full_name, username, email, password_hash, phone, department_id, role_id, created_at) VALUES (?,?,?,?,?,?,?,NOW())',
      [full_name, username, email, hash, phone || null, department_id || null, role_id || 3]
    );
    res.json({ message: 'Account created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

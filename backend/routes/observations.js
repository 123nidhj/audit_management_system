const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const { audit_id } = req.query;
  let q = 'SELECT n.*, u.full_name as author FROM notes n LEFT JOIN users u ON n.user_id=u.id';
  const p = [];
  if (audit_id) { q += ' WHERE n.audit_id=?'; p.push(audit_id); }
  q += ' ORDER BY n.created_at DESC';
  const [rows] = await db.query(q, p);
  res.json(rows);
});

router.post('/', auth, async (req, res) => {
  const { audit_id, content, observation_type } = req.body;
  const [r] = await db.query(
    'INSERT INTO notes (audit_id, user_id, content, observation_type, created_at) VALUES (?,?,?,?,NOW())',
    [audit_id, req.user.id, content, observation_type || 'Observation']
  );
  res.json({ id: r.insertId, message: 'Saved' });
});

module.exports = router;

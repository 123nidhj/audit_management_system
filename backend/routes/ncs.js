const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

// GET all NCs (for current user if not admin)
router.get('/', auth, async (req, res) => {
  try {
    let query = `SELECT nc.*, ns.name as status_name, a.name as audit_name,
      s.name as site_name, u.full_name as assigned_to_name
      FROM non_conformances nc
      LEFT JOIN nc_statuses ns ON nc.status_id = ns.id
      LEFT JOIN audit_daily_log a ON nc.audit_id = a.id
      LEFT JOIN sites s ON a.site_id = s.id
      LEFT JOIN users u ON nc.assigned_to = u.id`;
    const params = [];
    if (req.user.role !== 'Admin') {
      query += ' WHERE nc.assigned_to = ?';
      params.push(req.user.id);
    }
    query += ' ORDER BY nc.created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// GET single NC
router.get('/:id', auth, async (req, res) => {
  const [[nc]] = await db.query(`SELECT nc.*, ns.name as status_name, a.name as audit_name,
    u.full_name as assigned_to_name FROM non_conformances nc
    LEFT JOIN nc_statuses ns ON nc.status_id = ns.id
    LEFT JOIN audit_daily_log a ON nc.audit_id = a.id
    LEFT JOIN users u ON nc.assigned_to = u.id WHERE nc.id=?`, [req.params.id]);
  res.json(nc);
});

// POST create NC
router.post('/', auth, async (req, res) => {
  const { audit_id, observation_type, clause, control, description, type_clause_desc,
          severity, category, assigned_to, target_closure_date } = req.body;
  try {
    const [r] = await db.query(`INSERT INTO non_conformances 
      (audit_id, observation_type, clause, control, description, type_clause_desc,
       severity, category, assigned_to, target_closure_date, status_id, created_by, created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,1,?,NOW())`,
      [audit_id, observation_type, clause, control, description, type_clause_desc,
       severity, category, assigned_to, target_closure_date, req.user.id]);
    res.json({ id: r.insertId, message: 'NC created' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// PATCH NC status (close/reopen)
router.patch('/:id/status', auth, async (req, res) => {
  const { status_id, remarks } = req.body;
  try {
    await db.query('UPDATE non_conformances SET status_id=? WHERE id=?', [status_id, req.params.id]);
    await db.query('INSERT INTO activity_log (user_id, action, entity, entity_id, details, created_at) VALUES (?,?,?,?,?,NOW())',
      [req.user.id, 'STATUS_CHANGE', 'nc', req.params.id, remarks || '']);
    res.json({ message: 'Status updated' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// GET NC history
router.get('/:id/history', auth, async (req, res) => {
  const [rows] = await db.query(
    'SELECT al.*, u.full_name FROM activity_log al LEFT JOIN users u ON al.user_id=u.id WHERE al.entity=? AND al.entity_id=? ORDER BY al.created_at DESC',
    ['nc', req.params.id]
  );
  res.json(rows);
});

module.exports = router;

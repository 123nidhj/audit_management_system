const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

// GET all audits
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, 
        at.name as audit_type_name, at.framework,
        s.name as site_name, s.location, s.scope as site_scope,
        d.name as department_name,
        ast.name as status_name,
        u.full_name as created_by_name
      FROM audit_daily_log a
      LEFT JOIN audit_types at ON a.audit_type_id = at.id
      LEFT JOIN sites s ON a.site_id = s.id
      LEFT JOIN departments d ON a.department_id = d.id
      LEFT JOIN audit_statuses ast ON a.status_id = ast.id
      LEFT JOIN users u ON a.created_by = u.id
      ORDER BY a.from_date DESC
    `);
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// GET single audit with participants
router.get('/:id', auth, async (req, res) => {
  try {
    const [[audit]] = await db.query(`
      SELECT a.*, at.name as audit_type_name, at.framework,
        s.name as site_name, s.location, s.scope as site_scope,
        d.name as department_name, ast.name as status_name
      FROM audit_daily_log a
      LEFT JOIN audit_types at ON a.audit_type_id = at.id
      LEFT JOIN sites s ON a.site_id = s.id
      LEFT JOIN departments d ON a.department_id = d.id
      LEFT JOIN audit_statuses ast ON a.status_id = ast.id
      WHERE a.id = ?`, [req.params.id]);
    if (!audit) return res.status(404).json({ error: 'Not found' });

    const [participants] = await db.query(
      'SELECT ap.*, u.full_name, u.email FROM audit_participants ap JOIN users u ON ap.user_id = u.id WHERE ap.audit_id = ?',
      [req.params.id]
    );
    const [ncs] = await db.query(
      'SELECT nc.*, ns.name as status_name FROM non_conformances nc LEFT JOIN nc_statuses ns ON nc.status_id = ns.id WHERE nc.audit_id = ?',
      [req.params.id]
    );
    const [notes] = await db.query('SELECT * FROM notes WHERE audit_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.json({ ...audit, participants, ncs, notes });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// POST create audit
router.post('/', auth, async (req, res) => {
  const { name, ldap_directory, audit_type_id, framework, site_id, location, department_id,
          from_date, audit_to_date, recurrence, performed_by, lead_auditor, auditors, planned_by } = req.body;
  try {
    const [r] = await db.query(`
      INSERT INTO audit_daily_log 
        (name, ldap_directory, audit_type_id, framework, site_id, location, department_id,
         from_date, audit_to_date, recurrence, performed_by, lead_auditor, planned_by, status_id, created_by, created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,NOW())`,
      [name, ldap_directory, audit_type_id, framework, site_id, location, department_id,
       from_date, audit_to_date, recurrence || null, performed_by, lead_auditor, planned_by || null, req.user.id]
    );
    const auditId = r.insertId;
    if (auditors && auditors.length) {
      for (const uid of auditors) {
        await db.query('INSERT INTO audit_participants (audit_id, user_id) VALUES (?,?)', [auditId, uid]);
      }
    }
    await db.query('INSERT INTO activity_log (user_id, action, entity, entity_id, created_at) VALUES (?,?,?,?,NOW())',
      [req.user.id, 'CREATE', 'audit', auditId]);
    res.json({ id: auditId, message: 'Audit created' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// PUT update audit
router.put('/:id', auth, async (req, res) => {
  const { name, ldap_directory, audit_type_id, framework, site_id, location, department_id,
          from_date, audit_to_date, recurrence, performed_by, lead_auditor } = req.body;
  try {
    await db.query(`UPDATE audit_daily_log SET name=?, ldap_directory=?, audit_type_id=?, framework=?,
      site_id=?, location=?, department_id=?, from_date=?, to_date=?, recurrence=?,
      performed_by=?, lead_auditor=? WHERE id=?`,
      [name, ldap_directory, audit_type_id, framework, site_id, location, department_id,
       from_date, audit_to_date, recurrence, performed_by, lead_auditor, req.params.id]);
    res.json({ message: 'Updated' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// PATCH update audit status
router.patch('/:id/status', auth, async (req, res) => {
  const { status_id, remarks } = req.body;
  try {
    await db.query('UPDATE audit_daily_log SET status_id=? WHERE id=?', [status_id, req.params.id]);
    await db.query('INSERT INTO activity_log (user_id, action, entity, entity_id, details, created_at) VALUES (?,?,?,?,?,NOW())',
      [req.user.id, 'STATUS_CHANGE', 'audit', req.params.id, remarks || '']);
    res.json({ message: 'Status updated' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// GET status history for audit
router.get('/:id/history', auth, async (req, res) => {
  const [rows] = await db.query(
    'SELECT al.*, u.full_name FROM activity_log al LEFT JOIN users u ON al.user_id=u.id WHERE al.entity=? AND al.entity_id=? ORDER BY al.created_at DESC',
    ['audit', req.params.id]
  );
  res.json(rows);
});

// DELETE audit
router.delete('/:id', auth, async (req, res) => {
  await db.query('DELETE FROM audit_daily_log WHERE id=?', [req.params.id]);
  res.json({ message: 'Deleted' });
});

module.exports = router;

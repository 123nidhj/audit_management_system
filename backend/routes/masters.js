const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

// --- SITES / PLANTS ---
router.get('/sites',        auth, async (req, res) => { const [r] = await db.query('SELECT * FROM sites ORDER BY name'); res.json(r); });
router.post('/sites',       auth, async (req, res) => { const { name, location, scope } = req.body; const [r] = await db.query('INSERT INTO sites (name, location, scope) VALUES (?,?,?)', [name, location, scope]); res.json({ id: r.insertId, name, location, scope }); });
router.put('/sites/:id',    auth, async (req, res) => { const { name, location, scope } = req.body; await db.query('UPDATE sites SET name=?, location=?, scope=? WHERE id=?', [name, location, scope, req.params.id]); res.json({ message: 'Updated' }); });
router.delete('/sites/:id', auth, async (req, res) => { await db.query('DELETE FROM sites WHERE id=?', [req.params.id]); res.json({ message: 'Deleted' }); });

// --- DEPARTMENTS ---
router.get('/departments',        auth, async (req, res) => { const [r] = await db.query('SELECT d.*, s.name as site_name FROM departments d LEFT JOIN sites s ON d.site_id=s.id ORDER BY d.name'); res.json(r); });
router.post('/departments',       auth, async (req, res) => { const { name, site_id } = req.body; const [r] = await db.query('INSERT INTO departments (name, site_id) VALUES (?,?)', [name, site_id]); res.json({ id: r.insertId, name, site_id }); });
router.put('/departments/:id',    auth, async (req, res) => { const { name, site_id } = req.body; await db.query('UPDATE departments SET name=?, site_id=? WHERE id=?', [name, site_id, req.params.id]); res.json({ message: 'Updated' }); });
router.delete('/departments/:id', auth, async (req, res) => { await db.query('DELETE FROM departments WHERE id=?', [req.params.id]); res.json({ message: 'Deleted' }); });

// --- AUDIT TYPES ---
router.get('/audit-types',        auth, async (req, res) => { const [r] = await db.query('SELECT * FROM audit_types ORDER BY name'); res.json(r); });
router.post('/audit-types',       auth, async (req, res) => { const { name, framework } = req.body; const [r] = await db.query('INSERT INTO audit_types (name, framework) VALUES (?,?)', [name, framework]); res.json({ id: r.insertId, name, framework }); });
router.put('/audit-types/:id',    auth, async (req, res) => { const { name, framework } = req.body; await db.query('UPDATE audit_types SET name=?, framework=? WHERE id=?', [name, framework, req.params.id]); res.json({ message: 'Updated' }); });
router.delete('/audit-types/:id', auth, async (req, res) => { await db.query('DELETE FROM audit_types WHERE id=?', [req.params.id]); res.json({ message: 'Deleted' }); });

// --- ROLES ---
router.get('/roles', async (req, res) => { const [r] = await db.query('SELECT * FROM roles ORDER BY name'); res.json(r); });

// --- USERS (auditors list) ---
router.get('/users', auth, async (req, res) => { const [r] = await db.query('SELECT id, full_name, username, email FROM users ORDER BY full_name'); res.json(r); });

// --- NC STATUSES ---
router.get('/nc-statuses', auth, async (req, res) => { const [r] = await db.query('SELECT * FROM nc_statuses'); res.json(r); });

// --- AUDIT STATUSES ---
router.get('/audit-statuses', auth, async (req, res) => { const [r] = await db.query('SELECT * FROM audit_statuses'); res.json(r); });

module.exports = router;

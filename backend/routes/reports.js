const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

// Aging report - NCs overdue
router.get('/aging', auth, async (req, res) => {
  const [rows] = await db.query(`
    SELECT nc.id, nc.description, nc.severity, nc.target_closure_date,
      DATEDIFF(NOW(), nc.target_closure_date) as days_overdue,
      ns.name as status, a.name as audit_name,
      s.name as site_name, u.full_name as assigned_to
    FROM non_conformances nc
    LEFT JOIN nc_statuses ns ON nc.status_id = ns.id
    LEFT JOIN audit_daily_log a ON nc.audit_id = a.id
    LEFT JOIN sites s ON a.site_id = s.id
    LEFT JOIN users u ON nc.assigned_to = u.id
    WHERE nc.target_closure_date < NOW() AND nc.status_id NOT IN (2,3)
    ORDER BY days_overdue DESC`);
  res.json(rows);
});

// Plant-wise audit summary
router.get('/plant-wise', auth, async (req, res) => {
  const [rows] = await db.query(`
    SELECT s.name as plant, s.scope,
      COUNT(DISTINCT a.id) as total_audits,
      SUM(CASE WHEN ast.name='Completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN ast.name='In Progress' THEN 1 ELSE 0 END) as in_progress,
      COUNT(DISTINCT nc.id) as total_ncs,
      SUM(CASE WHEN ns.name='Open' THEN 1 ELSE 0 END) as open_ncs
    FROM sites s
    LEFT JOIN audit_daily_log a ON a.site_id = s.id
    LEFT JOIN audit_statuses ast ON a.status_id = ast.id
    LEFT JOIN non_conformances nc ON nc.audit_id = a.id
    LEFT JOIN nc_statuses ns ON nc.status_id = ns.id
    GROUP BY s.id ORDER BY s.name`);
  res.json(rows);
});

// Dashboard summary
router.get('/summary', auth, async (req, res) => {
  const [[audits]]  = await db.query('SELECT COUNT(*) as total, SUM(CASE WHEN status_id=3 THEN 1 ELSE 0 END) as completed, SUM(CASE WHEN status_id=2 THEN 1 ELSE 0 END) as in_progress FROM audit_daily_log');
  const [[ncs]]     = await db.query('SELECT COUNT(*) as total, SUM(CASE WHEN status_id=1 THEN 1 ELSE 0 END) as open FROM non_conformances');
  const [upcoming]  = await db.query('SELECT id, name, from_date, audit_to_date FROM audit_daily_log WHERE from_date >= CURDATE() ORDER BY from_date LIMIT 5');
  res.json({ audits, ncs, upcoming });
});

// CSV export of NCs
router.get('/export/ncs', auth, async (req, res) => {
  const [rows] = await db.query(`
    SELECT nc.id, a.name as audit, s.name as plant, nc.severity, nc.category,
      nc.description, nc.clause, u.full_name as assigned_to,
      nc.target_closure_date, ns.name as status, nc.created_at
    FROM non_conformances nc
    LEFT JOIN audit_daily_log a ON nc.audit_id = a.id
    LEFT JOIN sites s ON a.site_id = s.id
    LEFT JOIN users u ON nc.assigned_to = u.id
    LEFT JOIN nc_statuses ns ON nc.status_id = ns.id
    ORDER BY nc.created_at DESC`);

  const headers = ['ID','Audit','Plant','Severity','Category','Description','Clause','Assigned To','Target Date','Status','Created At'];
  const csv = [headers.join(','), ...rows.map(r =>
    [r.id, `"${r.audit}"`, `"${r.plant}"`, r.severity, r.category,
     `"${(r.description||'').replace(/"/g,'""')}"`, r.clause,
     `"${r.assigned_to}"`, r.target_closure_date?.toISOString()?.slice(0,10),
     r.status, r.created_at?.toISOString()?.slice(0,10)].join(',')
  )].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=nc_report.csv');
  res.send(csv);
});

module.exports = router;

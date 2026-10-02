/* =============================================
   AUDIT MANAGEMENT SYSTEM - app.js
   ============================================= */

/* ---------- DATA STORE ---------- */
let currentUser = null;
let editingAuditId = null;
let statusTargetId = null;
let calendarDate = new Date(2026, 6, 1); // July 2026

const USERS = [
  { id: 1, name: 'Admin User',     username: 'admin',   email: 'admin123@gmail.com',   password: 'admin123',   role: 'admin',    avatar: 'A' },
  { id: 2, name: 'John Auditor',   username: 'auditor', email: 'auditor123@gmail.com', password: 'auditor123', role: 'auditor',  avatar: 'J' },
  { id: 3, name: 'Nidhi Customer', username: 'nidhi',   email: 'nidhi123@gmail.com',   password: 'nidhinish',  role: 'customer', avatar: 'N' },
];

let audits = [
  {
    id: 1, name: 'ISO 9001 Annual Audit', type: 'Internal',
    fromDate: '2026-07-10', toDate: '2026-07-25',
    interval: 'Annually', platform: 'On-Site',
    performedBy: 'John Auditor', company: 'Acme Corp',
    certificate: 'ISO 9001:2015', status: 'ongoing',
    notes: 'Annual quality management review.', createdBy: 'Admin User', createdAt: '2026-07-01'
  },
  {
    id: 2, name: 'Safety Compliance Check', type: 'External',
    fromDate: '2026-07-05', toDate: '2026-07-10',
    interval: 'Quarterly', platform: 'On-Site',
    performedBy: 'External Auditor', company: 'Beta Ltd',
    certificate: 'OHSAS 18001', status: 'completed',
    notes: 'Safety audit completed successfully.', createdBy: 'Admin User', createdAt: '2026-06-20'
  },
  {
    id: 3, name: 'Quality Management Review', type: 'Internal',
    fromDate: '2026-07-28', toDate: '2026-08-05',
    interval: 'Half-Yearly', platform: 'Remote',
    performedBy: 'John Auditor', company: 'Gamma Inc',
    certificate: 'ISO 9001:2015', status: 'started',
    notes: 'Mid-year quality review.', createdBy: 'Admin User', createdAt: '2026-07-12'
  },
  {
    id: 4, name: 'Environmental Audit', type: 'Certification',
    fromDate: '2026-08-15', toDate: '2026-08-20',
    interval: 'Annually', platform: 'Hybrid',
    performedBy: 'Green Auditors Ltd', company: 'Acme Corp',
    certificate: 'ISO 14001:2015', status: 'started',
    notes: 'Annual environmental compliance.', createdBy: 'Admin User', createdAt: '2026-07-13'
  }
];

let ncs = [
  {
    id: 1, auditId: 1, ncId: 'NC-001', description: 'Document control procedure not followed',
    severity: 'Major', assignedTo: 'John Auditor', dueDate: '2026-07-30',
    status: 'open', history: [
      { date: '2026-07-11', user: 'Admin User', action: 'NC Created', note: 'Raised during audit walkthrough.' }
    ]
  },
  {
    id: 2, auditId: 1, ncId: 'NC-002', description: 'Calibration records missing for 3 instruments',
    severity: 'Critical', assignedTo: 'Sara Customer', dueDate: '2026-07-20',
    status: 'in-progress', history: [
      { date: '2026-07-11', user: 'Admin User',   action: 'NC Created',           note: 'Raised on Day 1.' },
      { date: '2026-07-13', user: 'Sara Customer', action: 'Status → In Progress', note: 'Working on calibration logs.' }
    ]
  },
  {
    id: 3, auditId: 2, ncId: 'NC-003', description: 'Fire extinguisher not serviced in 18 months',
    severity: 'Minor', assignedTo: 'John Auditor', dueDate: '2026-07-15',
    status: 'resolved', history: [
      { date: '2026-07-06', user: 'Admin User',  action: 'NC Created',  note: 'Found during site inspection.' },
      { date: '2026-07-12', user: 'John Auditor', action: 'Status → Resolved', note: 'Service completed.' }
    ]
  },
  {
    id: 4, auditId: 1, ncId: 'NC-004', description: 'Training records not updated for new joiners',
    severity: 'Major', assignedTo: 'Sara Customer', dueDate: '2026-08-01',
    status: 'open', history: [
      { date: '2026-07-12', user: 'Admin User', action: 'NC Created', note: '' }
    ]
  }
];

let observations = [
  { id: 1, auditId: 1, description: 'Housekeeping in warehouse area needs improvement.', recordedBy: 'John Auditor', date: '2026-07-11', convertedToNC: false },
  { id: 2, auditId: 2, description: 'First aid box contents incomplete in Zone B.', recordedBy: 'External Auditor', date: '2026-07-07', convertedToNC: false }
];

let nextAuditId = 5;
let nextNcId = 5;
let nextObsId = 3;

/* ---------- LOGIN / LOGOUT ---------- */
function onRoleChange(role) { /* removed - role now auto-detected */ }

function switchTab(tab) {
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabSignup').classList.toggle('active', tab === 'signup');
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('signupForm').classList.toggle('hidden', tab !== 'signup');
  if (tab === 'login') {
    document.getElementById('loginRole').value = 'customer';
  }
}

function handleSignup(e) {
  e.preventDefault();
  const name     = document.getElementById('signupName').value.trim();
  const username = document.getElementById('signupUsername').value.trim();
  const email    = document.getElementById('signupEmail').value.trim();
  const phone    = document.getElementById('signupPhone').value.trim();
  const company  = document.getElementById('signupCompany').value.trim();
  const role     = document.getElementById('signupRole').value;
  const password = document.getElementById('signupPassword').value;
  const confirm  = document.getElementById('signupConfirm').value;
  const errEl    = document.getElementById('signupError');
  const sucEl    = document.getElementById('signupSuccess');

  errEl.classList.add('hidden');
  sucEl.classList.add('hidden');

  if (password !== confirm) {
    errEl.textContent = 'Passwords do not match.';
    errEl.classList.remove('hidden');
    return;
  }
  if (USERS.find(u => u.email === email)) {
    errEl.textContent = 'An account with this email already exists.';
    errEl.classList.remove('hidden');
    return;
  }
  if (USERS.find(u => u.username === username)) {
    errEl.textContent = 'Username already taken.';
    errEl.classList.remove('hidden');
    return;
  }

  USERS.push({
    id: USERS.length + 1,
    name, username, phone, email, company, password, role,
    avatar: name.charAt(0).toUpperCase()
  });

  sucEl.textContent = 'Account created successfully! You can now log in.';
  sucEl.classList.remove('hidden');
  document.getElementById('signupForm').reset();
  setTimeout(() => switchTab('login'), 1800);
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');

  const user = USERS.find(u =>
    u.email === email &&
    u.password === pass &&
    (u.username === username || u.name.toLowerCase() === username.toLowerCase())
  );
  if (!user) {
    errEl.classList.remove('hidden');
    return;
  }  errEl.classList.add('hidden');

  currentUser = user;

  document.getElementById('sidebarName').textContent = currentUser.name;
  document.getElementById('sidebarRole').textContent =
    user.role === 'admin' ? 'Admin' : user.role === 'auditor' ? 'Auditor' : 'Customer';
  document.getElementById('sidebarAvatar').textContent = currentUser.avatar;

  applyRoleVisibility(user.role);

  document.getElementById('page-login').classList.add('hidden');
  document.getElementById('page-login').classList.remove('active');
  document.getElementById('page-app').classList.remove('hidden');
  document.getElementById('page-app').classList.add('active');

  showSection('dashboard');
  renderAuditsTable();
  renderNcsTable();
  renderObservationsTable();
  renderCalendar();
}

function handleLogout() {
  currentUser = null;
  document.getElementById('page-app').classList.add('hidden');
  document.getElementById('page-app').classList.remove('active');
  document.getElementById('page-login').classList.remove('hidden');
  document.getElementById('page-login').classList.add('active');
  document.getElementById('loginForm').reset();
}

function applyRoleVisibility(role) {
  // Customers only see My NCs and Dashboard
  const adminItems = document.querySelectorAll('.admin-only');
  adminItems.forEach(el => {
    el.style.display = (role === 'admin' || role === 'auditor') ? '' : 'none';
  });
}

/* ---------- NAVIGATION ---------- */
function showSection(name) {
  document.querySelectorAll('.content-section').forEach(s => {
    s.classList.remove('active');
    s.classList.add('hidden');
  });
  const target = document.getElementById('section-' + name);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }
  // Update active nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('onclick') && item.getAttribute('onclick').includes("'" + name + "'"));
  });
  // Update topbar title
  const titles = {
    dashboard: 'Dashboard', calendar: 'Audit Calendar',
    audits: 'Audit Management', 'my-ncs': 'My Non-Conformances',
    observations: 'Audit Observations', 'audit-detail': 'Audit Detail'
  };
  document.getElementById('topbarTitle').textContent = titles[name] || 'AuditPro';
  window.scrollTo(0, 0);
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main    = document.querySelector('.main-content');
  sidebar.classList.toggle('collapsed');
  if (sidebar.classList.contains('collapsed')) {
    sidebar.classList.remove('open');
    main.classList.add('full');
  } else {
    main.classList.remove('full');
  }
}

/* ---------- MODALS ---------- */
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function openAddAuditModal() {
  editingAuditId = null;
  document.getElementById('auditModalTitle').textContent = 'Add New Audit';
  document.getElementById('addAuditForm').reset();
  openModal('modal-add-audit');
}

function openEditAuditModal(id) {
  const audit = audits.find(a => a.id === id);
  if (!audit) return;
  editingAuditId = id;
  document.getElementById('auditModalTitle').textContent = 'Edit Audit';
  document.getElementById('auditName').value        = audit.name;
  document.getElementById('auditType').value        = audit.type;
  document.getElementById('auditFromDate').value    = audit.fromDate;
  document.getElementById('auditToDate').value      = audit.toDate;
  document.getElementById('auditInterval').value    = audit.interval;
  document.getElementById('auditPlatform').value    = audit.platform;
  document.getElementById('auditPerformedBy').value = audit.performedBy;
  document.getElementById('auditCompany').value     = audit.company;
  document.getElementById('auditCertificate').value = audit.certificate;
  document.getElementById('auditNotes').value       = audit.notes;
  openModal('modal-add-audit');
}

function openAddObservationModal() { openModal('modal-add-observation'); }

function openStatusModal(auditId) {
  statusTargetId = auditId;
  const audit = audits.find(a => a.id === auditId);
  if (audit) document.getElementById('newStatusSelect').value = audit.status;
  openModal('modal-status');
}

/* ---------- SAVE / DELETE AUDIT ---------- */
function saveAudit(e) {
  e.preventDefault();
  const data = {
    name:        document.getElementById('auditName').value.trim(),
    type:        document.getElementById('auditType').value,
    fromDate:    document.getElementById('auditFromDate').value,
    toDate:      document.getElementById('auditToDate').value,
    interval:    document.getElementById('auditInterval').value,
    platform:    document.getElementById('auditPlatform').value,
    performedBy: document.getElementById('auditPerformedBy').value.trim(),
    company:     document.getElementById('auditCompany').value.trim(),
    certificate: document.getElementById('auditCertificate').value.trim(),
    notes:       document.getElementById('auditNotes').value.trim(),
  };

  if (editingAuditId) {
    const idx = audits.findIndex(a => a.id === editingAuditId);
    if (idx !== -1) audits[idx] = { ...audits[idx], ...data };
  } else {
    audits.push({
      id: nextAuditId++, ...data,
      status: 'started',
      createdBy: currentUser ? currentUser.name : 'Admin',
      createdAt: new Date().toISOString().slice(0, 10)
    });
  }

  closeModal('modal-add-audit');
  renderAuditsTable();
  renderCalendar();
  updateDashboardStats();
}

function deleteAudit(id) {
  if (!confirm('Are you sure you want to delete this audit?')) return;
  audits = audits.filter(a => a.id !== id);
  renderAuditsTable();
  renderCalendar();
  updateDashboardStats();
}

function confirmStatusChange() {
  const newStatus = document.getElementById('newStatusSelect').value;
  const remarks   = document.getElementById('statusRemarks').value;
  const idx = audits.findIndex(a => a.id === statusTargetId);
  if (idx !== -1) {
    audits[idx].status = newStatus;
    // If completed, check NCs
    if (newStatus === 'completed') {
      const openNCs = ncs.filter(n => n.auditId === statusTargetId && n.status !== 'closed' && n.status !== 'resolved');
      if (openNCs.length > 0) {
        alert(`⚠️ Note: ${openNCs.length} NC(s) are still open/in-progress for this audit.`);
      }
    }
  }
  closeModal('modal-status');
  renderAuditsTable();
  updateDashboardStats();
}

/* ---------- RENDER AUDITS TABLE ---------- */
function renderAuditsTable(list) {
  const data = list || audits;
  const tbody = document.getElementById('auditsTableBody');
  if (!tbody) return;
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#9ca3af;padding:2rem;">No audits found.</td></tr>';
    return;
  }
  tbody.innerHTML = data.map(a => `
    <tr>
      <td><strong>${a.name}</strong><br><small style="color:#9ca3af">${a.certificate || ''}</small></td>
      <td><span class="badge badge-${typeBadge(a.type)}">${a.type}</span></td>
      <td>${a.platform}</td>
      <td>${a.performedBy}</td>
      <td>${fmtDate(a.fromDate)}</td>
      <td>${fmtDate(a.toDate)}</td>
      <td><span class="status-badge ${a.status}">${capitalize(a.status)}</span></td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-sm btn-outline" onclick="viewAuditDetail(${a.id})">View</button>
          <button class="btn btn-sm btn-primary" onclick="openEditAuditModal(${a.id})">Edit</button>
          <button class="btn btn-sm btn-warning" onclick="openStatusModal(${a.id})">Status</button>
          <button class="btn btn-sm btn-danger" onclick="deleteAudit(${a.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');

  // refresh obs audit dropdown
  const sel = document.getElementById('obsAudit');
  if (sel) {
    sel.innerHTML = '<option value="">Select Audit</option>' +
      audits.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
  }
}

function filterAudits(val) {
  const lower = val.toLowerCase();
  renderAuditsTable(audits.filter(a =>
    a.name.toLowerCase().includes(lower) ||
    a.performedBy.toLowerCase().includes(lower) ||
    a.company.toLowerCase().includes(lower)
  ));
}

function filterAuditsByStatus(val) {
  renderAuditsTable(val ? audits.filter(a => a.status === val) : audits);
}

/* ---------- AUDIT DETAIL VIEW ---------- */
function viewAuditDetail(id) {
  const audit = audits.find(a => a.id === id);
  if (!audit) return;
  const auditNCs = ncs.filter(n => n.auditId === id);
  const auditObs = observations.filter(o => o.auditId === id);

  const html = `
    <div class="audit-detail-header">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;">
        <div>
          <h2>${audit.name}</h2>
          <div class="audit-meta">
            <span class="audit-meta-item">📅 ${fmtDate(audit.fromDate)} → ${fmtDate(audit.toDate)}</span>
            <span class="audit-meta-item">🏢 ${audit.company || '—'}</span>
            <span class="audit-meta-item">👤 ${audit.performedBy}</span>
            <span class="audit-meta-item">📍 ${audit.platform}</span>
          </div>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center;">
          <span class="status-badge ${audit.status}" style="font-size:0.9rem;padding:0.35rem 1rem;">${capitalize(audit.status)}</span>
          <button class="btn btn-outline btn-sm" style="background:rgba(255,255,255,0.2);color:white;border-color:rgba(255,255,255,0.4);" onclick="openStatusModal(${audit.id})">Change Status</button>
        </div>
      </div>
    </div>

    <div class="detail-grid">
      <div class="card">
        <div class="card-header">Audit Information</div>
        <table style="width:100%;font-size:0.88rem;border-collapse:collapse;">
          ${infoRow('Type', audit.type)}
          ${infoRow('Certificate/Standard', audit.certificate || '—')}
          ${infoRow('Interval', audit.interval || '—')}
          ${infoRow('Platform', audit.platform)}
          ${infoRow('Performed By', audit.performedBy)}
          ${infoRow('Company', audit.company || '—')}
          ${infoRow('Created By', audit.createdBy)}
          ${infoRow('Created On', fmtDate(audit.createdAt))}
        </table>
        ${audit.notes ? `<div style="margin-top:1rem;padding:0.75rem;background:#f9fafb;border-radius:8px;font-size:0.85rem;color:#6b7280;"><strong>Notes:</strong> ${audit.notes}</div>` : ''}
      </div>

      <div class="card">
        <div class="card-header">NC Summary for this Audit</div>
        <div class="nc-summary" style="margin-bottom:1rem;">
          ${['open','in-progress','resolved','closed'].map(s => `
            <div class="nc-item">
              <div class="nc-color ${ncColor(s)}"></div>
              <span>${capitalize(s.replace('-',' '))} NCs</span>
              <strong>${auditNCs.filter(n=>n.status===s).length}</strong>
            </div>`).join('')}
        </div>
        <button class="btn btn-primary btn-sm" onclick="openAddNCModal(${audit.id})">+ Add NC</button>
      </div>
    </div>

    <div class="card">
      <div class="card-header" style="display:flex;justify-content:space-between;">
        Non-Conformances (${auditNCs.length})
        <button class="btn btn-sm btn-primary" onclick="openAddNCModal(${audit.id})">+ Add NC</button>
      </div>
      ${auditNCs.length === 0 ? '<p style="color:#9ca3af;font-size:0.9rem;">No NCs for this audit.</p>' : `
      <table class="data-table">
        <thead><tr><th>NC ID</th><th>Description</th><th>Severity</th><th>Assigned To</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${auditNCs.map(nc => `
          <tr>
            <td><strong>${nc.ncId}</strong></td>
            <td>${nc.description}</td>
            <td><span class="badge badge-${severityBadge(nc.severity)}">${nc.severity}</span></td>
            <td>${nc.assignedTo}</td>
            <td>${fmtDate(nc.dueDate)}</td>
            <td><span class="status-badge ${nc.status}">${capitalize(nc.status.replace('-',' '))}</span></td>
            <td><button class="btn btn-sm btn-outline" onclick="viewNCDetail(${nc.id})">Details</button></td>
          </tr>`).join('')}
        </tbody>
      </table>`}
    </div>

    <div class="card">
      <div class="card-header">Observations (${auditObs.length})</div>
      ${auditObs.length === 0 ? '<p style="color:#9ca3af;font-size:0.9rem;">No observations recorded.</p>' :
        auditObs.map(o => `
          <div style="padding:0.75rem;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:0.5rem;font-size:0.88rem;">
            <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;">
              <strong>${o.recordedBy}</strong><span style="color:#9ca3af;">${fmtDate(o.date)}</span>
            </div>
            <div style="color:#4b5563;">${o.description}</div>
            ${!o.convertedToNC ? `<button class="btn btn-sm btn-warning" style="margin-top:0.5rem;" onclick="convertObsToNCById(${o.id},${audit.id})">Convert to NC</button>` : '<span style="color:#16a34a;font-size:0.8rem;">✓ Converted to NC</span>'}
          </div>`).join('')
      }
    </div>
  `;

  document.getElementById('auditDetailContent').innerHTML = html;
  showSection('audit-detail');
}

function infoRow(label, val) {
  return `<tr><td style="padding:0.5rem 0;color:#6b7280;width:45%;">${label}</td><td style="padding:0.5rem 0;font-weight:500;">${val}</td></tr>`;
}

/* ---------- NCs ---------- */
let addNCforAuditId = null;

function openAddNCModal(auditId) {
  addNCforAuditId = auditId;
  // build a small inline form
  const html = `
    <div class="modal" id="modal-add-nc" style="display:flex;">
      <div class="modal-backdrop" onclick="closeModal('modal-add-nc')"></div>
      <div class="modal-content" style="position:relative;z-index:1;">
        <div class="modal-header">
          <h3>Add Non-Conformance</h3>
          <button class="modal-close" onclick="closeModal('modal-add-nc')">✕</button>
        </div>
        <form onsubmit="saveNC(event)" style="padding:1.25rem 1.5rem;">
          <div class="form-group">
            <label>Description *</label>
            <textarea id="ncDesc" rows="3" required placeholder="Describe the non-conformance..."></textarea>
          </div>
          <div class="form-group">
            <label>Severity *</label>
            <select id="ncSeverity" required>
              <option value="">Select</option>
              <option>Critical</option><option>Major</option><option>Minor</option>
            </select>
          </div>
          <div class="form-group">
            <label>Assigned To *</label>
            <input type="text" id="ncAssigned" required placeholder="Name of person responsible" />
          </div>
          <div class="form-group">
            <label>Due Date *</label>
            <input type="date" id="ncDue" required />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" onclick="closeModal('modal-add-nc')">Cancel</button>
            <button type="submit" class="btn btn-primary">Save NC</button>
          </div>
        </form>
      </div>
    </div>`;
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div.firstElementChild);
}

function saveNC(e) {
  e.preventDefault();
  const nc = {
    id: nextNcId,
    auditId: addNCforAuditId,
    ncId: 'NC-' + String(nextNcId).padStart(3, '0'),
    description: document.getElementById('ncDesc').value.trim(),
    severity:    document.getElementById('ncSeverity').value,
    assignedTo:  document.getElementById('ncAssigned').value.trim(),
    dueDate:     document.getElementById('ncDue').value,
    status: 'open',
    history: [{ date: new Date().toISOString().slice(0,10), user: currentUser?.name || 'Admin', action: 'NC Created', note: '' }]
  };
  nextNcId++;
  ncs.push(nc);
  closeModal('modal-add-nc');
  document.getElementById('modal-add-nc')?.remove();
  viewAuditDetail(addNCforAuditId);
  renderNcsTable();
  updateDashboardStats();
}

function renderNcsTable(list) {
  const data = list || ncs;
  const tbody = document.getElementById('ncsTableBody');
  if (!tbody) return;
  const userNCs = currentUser?.role === 'customer' || currentUser?.role === 'auditor'
    ? data.filter(n => n.assignedTo === currentUser.name)
    : data;
  if (userNCs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#9ca3af;padding:2rem;">No NCs found.</td></tr>';
    return;
  }
  tbody.innerHTML = userNCs.map(nc => {
    const audit = audits.find(a => a.id === nc.auditId);
    return `
      <tr>
        <td><strong>${nc.ncId}</strong></td>
        <td>${nc.description}</td>
        <td>${audit ? audit.name : '—'}</td>
        <td><span class="badge badge-${severityBadge(nc.severity)}">${nc.severity}</span></td>
        <td>${nc.assignedTo}</td>
        <td>${fmtDate(nc.dueDate)}</td>
        <td><span class="status-badge ${nc.status}">${capitalize(nc.status.replace('-',' '))}</span></td>
        <td>
          <div class="actions-cell">
            <button class="btn btn-sm btn-outline" onclick="viewNCDetail(${nc.id})">Details</button>
            <button class="btn btn-sm btn-warning" onclick="changeNCStatus(${nc.id})">Status</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function filterNCs(val) {
  renderNcsTable(val ? ncs.filter(n => n.status === val) : ncs);
}

function changeNCStatus(id) {
  const nc = ncs.find(n => n.id === id);
  if (!nc) return;
  const opts = ['open','in-progress','resolved','closed'];
  const cur  = opts.indexOf(nc.status);
  const next = opts[(cur + 1) % opts.length];
  if (!confirm(`Change NC ${nc.ncId} status to "${capitalize(next)}"?`)) return;
  nc.history.push({
    date: new Date().toISOString().slice(0,10),
    user: currentUser?.name || 'User',
    action: `Status → ${capitalize(next)}`,
    note: ''
  });
  nc.status = next;
  renderNcsTable();
  updateDashboardStats();
}

/* ---------- NC DETAIL MODAL ---------- */
function viewNCDetail(id) {
  const nc = ncs.find(n => n.id === id);
  if (!nc) return;
  const audit = audits.find(a => a.id === nc.auditId);

  document.getElementById('ncDetailContent').innerHTML = `
    <div style="padding:1.25rem 1.5rem;">
      <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1.25rem;">
        <div style="flex:1;min-width:200px;">
          <div style="font-size:0.78rem;color:#9ca3af;margin-bottom:0.2rem;">NC ID</div>
          <div style="font-weight:700;font-size:1.1rem;">${nc.ncId}</div>
        </div>
        <div style="flex:1;min-width:200px;">
          <div style="font-size:0.78rem;color:#9ca3af;margin-bottom:0.2rem;">Audit</div>
          <div style="font-weight:500;">${audit ? audit.name : '—'}</div>
        </div>
        <div>
          <span class="status-badge ${nc.status}" style="font-size:0.9rem;">${capitalize(nc.status.replace('-',' '))}</span>
        </div>
      </div>

      <div style="background:#f9fafb;border-radius:8px;padding:1rem;margin-bottom:1.25rem;">
        <strong>Description:</strong>
        <p style="margin-top:0.4rem;color:#4b5563;font-size:0.9rem;">${nc.description}</p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-bottom:1.25rem;">
        <div><div style="font-size:0.78rem;color:#9ca3af;">Severity</div>
          <span class="badge badge-${severityBadge(nc.severity)}">${nc.severity}</span></div>
        <div><div style="font-size:0.78rem;color:#9ca3af;">Assigned To</div>
          <div style="font-weight:500;">${nc.assignedTo}</div></div>
        <div><div style="font-size:0.78rem;color:#9ca3af;">Due Date</div>
          <div style="font-weight:500;">${fmtDate(nc.dueDate)}</div></div>
      </div>

      <div>
        <div style="font-weight:600;margin-bottom:0.75rem;">NC History / Updates</div>
        <div class="nc-history">
          ${nc.history.map(h => `
            <div class="nc-history-item">
              <div class="nc-history-date">${h.date}</div>
              <div>
                <strong>${h.user}</strong> — ${h.action}
                ${h.note ? `<br><span style="color:#6b7280;">${h.note}</span>` : ''}
              </div>
            </div>`).join('')}
        </div>
        <div style="margin-top:1rem;">
          <textarea id="ncUpdateNote" rows="2" placeholder="Add update / note..." style="width:100%;padding:0.6rem;border:1px solid #d1d5db;border-radius:8px;font-size:0.88rem;font-family:inherit;"></textarea>
          <div style="display:flex;gap:0.5rem;margin-top:0.5rem;flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" onclick="addNCUpdate(${nc.id})">Add Note</button>
            <button class="btn btn-warning btn-sm" onclick="changeNCStatus(${nc.id});closeModal('modal-nc-detail')">Change Status</button>
            <button class="btn btn-success btn-sm" onclick="closeNCById(${nc.id})">Mark Resolved</button>
          </div>
        </div>
      </div>
    </div>`;
  openModal('modal-nc-detail');
}

function addNCUpdate(id) {
  const note = document.getElementById('ncUpdateNote').value.trim();
  if (!note) return;
  const nc = ncs.find(n => n.id === id);
  if (!nc) return;
  nc.history.push({
    date: new Date().toISOString().slice(0,10),
    user: currentUser?.name || 'User',
    action: 'Note Added',
    note: note
  });
  viewNCDetail(id); // refresh modal
}

function closeNCById(id) {
  const nc = ncs.find(n => n.id === id);
  if (!nc) return;
  nc.status = 'closed';
  nc.history.push({
    date: new Date().toISOString().slice(0,10),
    user: currentUser?.name || 'User',
    action: 'Status → Closed',
    note: ''
  });
  closeModal('modal-nc-detail');
  renderNcsTable();
  updateDashboardStats();
  alert('NC marked as resolved/closed.');
}

/* ---------- OBSERVATIONS ---------- */
function saveObservation(e) {
  e.preventDefault();
  const obs = {
    id: nextObsId++,
    auditId: parseInt(document.getElementById('obsAudit').value) || null,
    description: document.getElementById('obsDescription').value.trim(),
    recordedBy: document.getElementById('obsBy').value.trim() || (currentUser?.name || 'User'),
    date: new Date().toISOString().slice(0, 10),
    convertedToNC: false
  };
  observations.push(obs);
  closeModal('modal-add-observation');
  document.getElementById('modal-add-observation').querySelector('form').reset();
  renderObservationsTable();
}

function renderObservationsTable() {
  const tbody = document.getElementById('observationsTableBody');
  if (!tbody) return;
  if (observations.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:2rem;">No observations found.</td></tr>';
    return;
  }
  tbody.innerHTML = observations.map(o => {
    const audit = audits.find(a => a.id === o.auditId);
    return `
      <tr>
        <td>${o.description}</td>
        <td>${audit ? audit.name : '—'}</td>
        <td>${o.recordedBy}</td>
        <td>${fmtDate(o.date)}</td>
        <td>
          ${o.convertedToNC
            ? '<span style="color:#16a34a;font-size:0.82rem;">✓ Converted to NC</span>'
            : `<button class="btn btn-sm btn-warning" onclick="convertObsToNCById(${o.id},${o.auditId || 0})">Convert to NC</button>`
          }
        </td>
      </tr>`;
  }).join('');
}

function convertObsToNCById(obsId, auditId) {
  const obs = observations.find(o => o.id === obsId);
  if (!obs) return;
  obs.convertedToNC = true;
  const nc = {
    id: nextNcId,
    auditId: auditId,
    ncId: 'NC-' + String(nextNcId).padStart(3, '0'),
    description: obs.description,
    severity: 'Minor',
    assignedTo: obs.recordedBy,
    dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0,10),
    status: 'open',
    history: [{ date: obs.date, user: obs.recordedBy, action: 'Converted from Observation', note: obs.description }]
  };
  nextNcId++;
  ncs.push(nc);
  renderNcsTable();
  renderObservationsTable();
  updateDashboardStats();
  alert(`Observation converted to ${nc.ncId}.`);
}

function convertObsToNC() {
  const desc    = document.getElementById('obsDescription').value.trim();
  const auditId = parseInt(document.getElementById('obsAudit').value) || null;
  const by      = document.getElementById('obsBy').value.trim() || (currentUser?.name || 'User');
  if (!desc) { alert('Please enter an observation description.'); return; }
  const obs = { id: nextObsId++, auditId, description: desc, recordedBy: by, date: new Date().toISOString().slice(0,10), convertedToNC: true };
  observations.push(obs);
  convertObsToNCById(obs.id, auditId || 0);
  closeModal('modal-add-observation');
  document.getElementById('modal-add-observation').querySelector('form').reset();
}

/* ---------- CALENDAR ---------- */
function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  if (!grid) return;
  const year  = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  document.getElementById('calendarMonthYear').textContent =
    calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let html = days.map(d => `<div class="cal-day-header">${d}</div>`).join('');

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  for (let i = 0; i < firstDay; i++) html += '<div class="cal-day empty"></div>';

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = today.getFullYear()===year && today.getMonth()===month && today.getDate()===d;

    const dayAudits = audits.filter(a => {
      const from = new Date(a.fromDate);
      const to   = new Date(a.toDate);
      const cur  = new Date(year, month, d);
      return cur >= new Date(from.getFullYear(), from.getMonth(), from.getDate()) &&
             cur <= new Date(to.getFullYear(),   to.getMonth(),   to.getDate());
    });

    const events = dayAudits.slice(0, 3).map(a =>
      `<div class="cal-event ${a.status}" title="${a.name}">${a.name.length > 14 ? a.name.slice(0,14)+'…' : a.name}</div>`
    ).join('') + (dayAudits.length > 3 ? `<div class="cal-event" style="color:#6b7280;">+${dayAudits.length-3} more</div>` : '');

    html += `
      <div class="cal-day ${isToday ? 'today' : ''}" onclick="showCalendarDay(${d}, ${month}, ${year})">
        <div class="cal-day-num">${d}</div>
        ${events}
      </div>`;
  }

  grid.innerHTML = html;
}

function changeMonth(delta) {
  calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + delta, 1);
  renderCalendar();
  document.getElementById('calendarDayDetail').style.display = 'none';
}

function showCalendarDay(d, month, year) {
  const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const dayAudits = audits.filter(a => {
    const cur  = new Date(year, month, d);
    const from = new Date(a.fromDate);
    const to   = new Date(a.toDate);
    return cur >= new Date(from.getFullYear(), from.getMonth(), from.getDate()) &&
           cur <= new Date(to.getFullYear(),   to.getMonth(),   to.getDate());
  });

  const detail = document.getElementById('calendarDayDetail');
  const title  = document.getElementById('calendarDayTitle');
  const list   = document.getElementById('calendarDayList');

  const dispDate = new Date(year, month, d).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  title.textContent = `Audits on ${dispDate}`;

  if (dayAudits.length === 0) {
    list.innerHTML = '<p style="color:#9ca3af;font-size:0.9rem;padding:0.5rem 0;">No audits scheduled on this day.</p>';
  } else {
    list.innerHTML = dayAudits.map(a => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:0.5rem;flex-wrap:wrap;gap:0.5rem;">
        <div>
          <strong>${a.name}</strong>
          <div style="font-size:0.82rem;color:#6b7280;">${a.type} · ${a.platform} · ${a.performedBy}</div>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center;">
          <span class="status-badge ${a.status}">${capitalize(a.status)}</span>
          <button class="btn btn-sm btn-outline" onclick="viewAuditDetail(${a.id})">View</button>
        </div>
      </div>`).join('');
  }
  detail.style.display = 'block';
  detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ---------- DASHBOARD STATS ---------- */
function updateDashboardStats() {
  const total     = audits.length;
  const completed = audits.filter(a => a.status === 'completed').length;
  const ongoing   = audits.filter(a => a.status === 'ongoing').length;
  const openNCs   = ncs.filter(n => n.status === 'open' || n.status === 'in-progress').length;

  const statVals = document.querySelectorAll('.stat-value');
  if (statVals[0]) statVals[0].textContent = total;
  if (statVals[1]) statVals[1].textContent = completed;
  if (statVals[2]) statVals[2].textContent = ongoing;
  if (statVals[3]) statVals[3].textContent = openNCs;

  // NC summary on dashboard
  const ncItems = document.querySelectorAll('.nc-item strong');
  const critical   = ncs.filter(n => n.severity === 'Critical' && n.status !== 'closed').length;
  const major      = ncs.filter(n => n.severity === 'Major'    && n.status !== 'closed').length;
  const minor      = ncs.filter(n => n.severity === 'Minor'    && n.status !== 'closed').length;
  const closedNCs  = ncs.filter(n => n.status === 'closed' || n.status === 'resolved').length;
  if (ncItems[0]) ncItems[0].textContent = critical;
  if (ncItems[1]) ncItems[1].textContent = major;
  if (ncItems[2]) ncItems[2].textContent = minor;
  if (ncItems[3]) ncItems[3].textContent = closedNCs;

  // Recent audits table on dashboard
  const recentBody = document.querySelector('#section-dashboard .data-table tbody');
  if (recentBody) {
    const recent = [...audits].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
    recentBody.innerHTML = recent.map(a => `
      <tr>
        <td><a href="#" style="color:var(--primary);font-weight:500;" onclick="viewAuditDetail(${a.id});return false;">${a.name}</a></td>
        <td><span class="badge badge-${typeBadge(a.type)}">${a.type}</span></td>
        <td><span class="status-badge ${a.status}">${capitalize(a.status)}</span></td>
        <td>${fmtDate(a.toDate)}</td>
      </tr>`).join('');
  }
}

/* ---------- HELPERS ---------- */
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { day:'2-digit', month:'short', year:'numeric' });
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function typeBadge(type) {
  const map = { 'Internal':'blue', 'External':'purple', 'Certification':'green', 'Surveillance':'orange', 'Customer Audit':'red' };
  return map[type] || 'blue';
}

function severityBadge(sev) {
  const map = { 'Critical':'red', 'Major':'orange', 'Minor':'blue' };
  return map[sev] || 'blue';
}

function ncColor(status) {
  const map = { 'open':'red', 'in-progress':'orange', 'resolved':'yellow', 'closed':'green' };
  return map[status] || 'green';
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // Set default login date in calendar to today
  calendarDate = new Date();
  calendarDate.setDate(1);
});

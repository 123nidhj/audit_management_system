/* MTL Audit System - Frontend App */
let currentUser = null;
let calDate = new Date();
let allAudits = [];
let editingAuditId = null;
let statusAuditId  = null;
let currentMasterType = null;
let editingMasterId   = null;

/* ====== AUTH ====== */
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  try {
    const data = await API.login({ username, password });
    localStorage.setItem('mtl_token', data.token);
    localStorage.setItem('mtl_user', JSON.stringify(data.user));
    currentUser = data.user;
    initApp();
  } catch {
    document.getElementById('loginError').classList.remove('hidden');
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const errEl = document.getElementById('suError');
  const sucEl = document.getElementById('suSuccess');
  errEl.classList.add('hidden'); sucEl.classList.add('hidden');
  const pass = document.getElementById('suPassword').value;
  if (pass !== document.getElementById('suConfirm').value) {
    errEl.textContent = 'Passwords do not match'; errEl.classList.remove('hidden'); return;
  }
  try {
    await API.register({
      full_name:    document.getElementById('suName').value.trim(),
      username:     document.getElementById('suUsername').value.trim(),
      email:        document.getElementById('suEmail').value.trim(),
      company_code: document.getElementById('suCompanyCode').value.trim(),
      phone:        document.getElementById('suPhone').value.trim(),
      password:     pass
    });
    sucEl.textContent = 'Account created! You can now login.';
    sucEl.classList.remove('hidden');
    setTimeout(() => switchTab('login'), 1500);
  } catch (err) {
    errEl.textContent = err.message; errEl.classList.remove('hidden');
  }
}

function switchTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('loginForm').classList.toggle('hidden', !isLogin);
  document.getElementById('signupForm').classList.toggle('hidden', isLogin);
  document.getElementById('signupSwitch').classList.toggle('hidden', isLogin);
  const switchEl = document.querySelector('.auth-switch:not(#signupSwitch)');
  if (switchEl) switchEl.classList.toggle('hidden', !isLogin);
}

function logout() {
  localStorage.removeItem('mtl_token');
  localStorage.removeItem('mtl_user');
  currentUser = null;
  document.getElementById('page-app').classList.add('hidden');
  document.getElementById('page-login').classList.remove('hidden');
}

function applyRBAC() {
  if (!currentUser) return;
  const role = (currentUser.role || '').toLowerCase();
  const isAdmin = (role === 'admin');
  const isAuditor = (role === 'auditor');

  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });

  document.querySelectorAll('.admin-auditor-only').forEach(el => {
    el.style.display = (isAdmin || isAuditor) ? '' : 'none';
  });

  const adminSec = document.getElementById('sidebarAdminSection');
  if (adminSec) adminSec.style.display = isAdmin ? '' : 'none';
}

function initApp() {
  document.getElementById('page-login').classList.add('hidden');
  document.getElementById('page-app').classList.remove('hidden');
  document.getElementById('sidebarName').textContent = currentUser.name;
  document.getElementById('sidebarRole').textContent = currentUser.role;
  document.getElementById('sidebarAv').textContent   = (currentUser.name || 'U')[0].toUpperCase();
  document.getElementById('topbarTitle').textContent = 'Dashboard';
  applyRBAC();
  loadDashboard();
  renderCalendar();
}

/* ====== NAV ====== */
function showSection(name) {
  const role = currentUser ? (currentUser.role || '').toLowerCase() : '';
  if (role !== 'admin' && name.startsWith('master-')) {
    alert('Access restricted: Only administrators can view Master settings.');
    showSection('dashboard');
    return;
  }

  document.querySelectorAll('.section').forEach(s => {
    s.classList.remove('active');
    s.classList.add('hidden');
  });
  const sec = document.getElementById('section-' + name);
  if (sec) {
    sec.classList.remove('hidden');
    sec.classList.add('active');
  }
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.remove('active');
  });
  // find matching nav item
  const allNav = document.querySelectorAll('.nav-item');
  allNav.forEach(n => {
    const oc = n.getAttribute('onclick') || '';
    if (oc.includes(name)) n.classList.add('active');
  });
  const titles = { dashboard:'Dashboard', audits:'Audit Management', calendar:'Audit Calendar',
    ncs:'Non-Conformances', observations:'Observations', reports:'Reports',
    'master-plants':'Plants / Sites', 'master-departments':'Departments',
    'master-audit-types':'Audit Types', 'master-users':'Users' };
  document.getElementById('topbarTitle').textContent = titles[name] || 'Audit Management System';

  applyRBAC();

  if (name === 'audits')              loadAudits();
  else if (name === 'ncs')            loadNCs();
  else if (name === 'observations')   loadObs();
  else if (name === 'reports')        { loadAgingReport(); loadPlantReport(); }
  else if (name === 'master-plants')  loadPlants();
  else if (name === 'master-departments') loadDepts();
  else if (name === 'master-audit-types') loadAuditTypes();
  else if (name === 'master-users')   loadUsers();
  else if (name === 'calendar')       renderCalendar();
  else if (name === 'dashboard')      loadDashboard();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.querySelector('.main-content').classList.toggle('full');
}

/* ====== DASHBOARD ====== */
async function loadDashboard() {
  try {
    const d = await API.getSummary();
    document.getElementById('statTotal').textContent     = d.audits.total || 0;
    document.getElementById('statCompleted').textContent = d.audits.completed || 0;
    document.getElementById('statProgress').textContent  = d.audits.in_progress || 0;
    document.getElementById('statOpenNCs').textContent   = d.ncs.open || 0;

    document.getElementById('upcomingList').innerHTML = d.upcoming.length ? d.upcoming.map(a =>
      `<div style="padding:8px 0;border-bottom:1px solid #eee;font-size:12.5px">
        <strong>${a.name}</strong><br>
        <span style="color:#777">${fmt(a.from_date)} → ${fmt(a.audit_to_date)}</span>
      </div>`).join('') : '<p style="color:#aaa;padding:8px 0">No upcoming audits</p>';
  } catch {}

  try {
    const ncs = await API.getNCs();
    document.getElementById('recentNCs').innerHTML = ncs.slice(0,5).map(n =>
      `<div style="padding:7px 0;border-bottom:1px solid #eee;font-size:12.5px">
        <span class="badge badge-${sevColor(n.severity)}">${n.severity}</span>
        <strong style="margin-left:6px">${n.description?.slice(0,50)}...</strong><br>
        <span style="color:#777">${n.audit_name} — ${n.assigned_to_name || '—'}</span>
      </div>`).join('') || '<p style="color:#aaa;padding:8px 0">No NCs</p>';
  } catch {}
}

/* ====== AUDITS ====== */
async function loadAudits(statusFilter) {
  try {
    allAudits = await API.getAudits();
    let list = allAudits;
    if (statusFilter) list = list.filter(a => a.status_name === statusFilter);
    const role = (currentUser?.role || '').toLowerCase();
    const isAdmin = role === 'admin';
    const isAuditor = role === 'auditor';

    document.getElementById('auditsTbody').innerHTML = list.map(a => `
      <tr>
        <td><a onclick="viewAudit(${a.id})" style="color:var(--blue);cursor:pointer;font-weight:600">${a.name}</a></td>
        <td>${a.audit_type_name || '—'}</td>
        <td>${a.site_name || '—'}</td>
        <td>${a.lead_auditor || '—'}</td>
        <td>${fmt(a.from_date)}</td>
        <td>${fmt(a.audit_to_date)}</td>
        <td><span class="badge badge-${statusColor(a.status_name)}">${a.status_name || 'Planned'}</span></td>
        <td><div class="actions-cell">
          <button class="btn btn-sm btn-outline" onclick="viewAudit(${a.id})">View</button>
          ${isAdmin ? `<button class="btn btn-sm btn-primary" onclick="openAuditModal(${a.id})">Edit</button>` : ''}
          ${isAdmin || isAuditor ? `<button class="btn btn-sm btn-outline" onclick="openStatusModal(${a.id})">Status</button>` : ''}
          ${isAdmin ? `<button class="btn btn-sm btn-danger" onclick="deleteAudit(${a.id})">Del</button>` : ''}
        </div></td>
      </tr>`).join('') || '<tr><td colspan="8" style="text-align:center;color:#aaa;padding:16px">No audits found</td></tr>';
  } catch (err) { console.error(err); }
}

async function viewAudit(id) {
  try {
    const a = await API.getAudit(id);
    const history = await API.auditHistory(id);
    const role = (currentUser?.role || '').toLowerCase();
    const canRaiseNC = role === 'admin' || role === 'auditor';

    document.getElementById('detailTitle').textContent = a.name;
    document.getElementById('auditDetailBody').innerHTML = `
      <div class="detail-hdr">
        <h3>${a.name}</h3>
        <div class="detail-meta">
          <span>${a.audit_type_name || '—'}</span>
          <span>📍 ${a.site_name || '—'}</span>
          <span>📅 ${fmt(a.from_date)} → ${fmt(a.audit_to_date)}</span>
          <span class="badge badge-${statusColor(a.status_name)}">${a.status_name || 'Planned'}</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
        <div class="card" style="margin:0">
          <div class="card-hdr">Audit Info</div>
          <table class="info-table">
            <tr><td>Standard</td><td>${a.framework || '—'}</td></tr>
            <tr><td>Location</td><td>${a.location || '—'}</td></tr>
            <tr><td>Department</td><td>${a.department_name || '—'}</td></tr>
            <tr><td>Lead Auditor</td><td>${a.lead_auditor || '—'}</td></tr>
            <tr><td>Performed By</td><td>${a.performed_by || '—'}</td></tr>
            <tr><td>Recurrence</td><td>${a.recurrence || 'None'}</td></tr>
            <tr><td>LDAP</td><td>${a.ldap_directory || '—'}</td></tr>
          </table>
        </div>
        <div class="card" style="margin:0">
          <div class="card-hdr">Auditors (${a.participants?.length || 0})</div>
          ${a.participants?.map(p => `<div style="padding:5px 0;border-bottom:1px solid #eee;font-size:12.5px">${p.full_name}</div>`).join('') || '<p style="color:#aaa">None assigned</p>'}
        </div>
      </div>

      <div class="card" style="margin-bottom:14px">
        <div class="card-hdr" style="display:flex;justify-content:space-between;align-items:center">
          Non-Conformances (${a.ncs?.length || 0})
          ${canRaiseNC ? `<button class="btn btn-sm btn-primary" onclick="openNCModal(${a.id})">+ Raise NC</button>` : ''}
        </div>
        ${a.ncs?.length ? `<table class="tbl"><thead><tr><th>Severity</th><th>Description</th><th>Assigned To</th><th>Target</th><th>Status</th><th></th></tr></thead><tbody>
          ${a.ncs.map(nc => `<tr>
            <td><span class="badge badge-${sevColor(nc.severity)}">${nc.severity}</span></td>
            <td>${nc.description?.slice(0,60)}</td>
            <td>${nc.assigned_to || '—'}</td>
            <td>${fmt(nc.target_closure_date)}</td>
            <td><span class="badge badge-${ncStatusColor(nc.status_name)}">${nc.status_name}</span></td>
            <td><button class="btn btn-sm btn-outline" onclick="viewNCDetail(${nc.id})">View</button></td>
          </tr>`).join('')}
        </tbody></table>` : '<p style="color:#aaa;font-size:12px">No NCs raised.</p>'}
      </div>

      <div class="card" style="margin-bottom:14px">
        <div class="card-hdr">Notes (${a.notes?.length || 0})</div>
        ${a.notes?.map(n => `<div style="padding:6px 0;border-bottom:1px solid #eee;font-size:12.5px"><strong>${n.author}</strong> <span style="color:#aaa;font-size:11px">${fmt(n.created_at)}</span><br>${n.content}</div>`).join('') || '<p style="color:#aaa;font-size:12px">No notes.</p>'}
      </div>

      <div class="card">
        <div class="card-hdr">Status History</div>
        ${history.map(h => `<div class="history-item"><div class="history-date">${fmt(h.created_at)}</div><div><strong>${h.full_name}</strong> — ${h.action} ${h.details ? '<br><span style="color:#666">'+h.details+'</span>' : ''}</div></div>`).join('') || '<p style="color:#aaa;font-size:12px">No history.</p>'}
      </div>
    `;
    openModal('modal-audit-detail');
  } catch (err) { alert('Error loading audit'); }
}

async function openAuditModal(id) {
  if (!currentUser || currentUser.role !== 'Admin') {
    alert('Access restricted: Only administrators can create or edit audits.');
    return;
  }
  editingAuditId = id || null;
  document.getElementById('auditModalTitle').textContent = id ? 'Edit Audit' : 'New Audit';
  document.getElementById('auditForm').reset();
  // Load dropdowns
  try {
    const [types, sites, users] = await Promise.all([API.getAuditTypes(), API.getSites(), API.getUsers()]);
    document.getElementById('af_type').innerHTML = '<option value="">Select</option>' + types.map(t => `<option value="${t.id}">${t.name} — ${t.framework}</option>`).join('');
    document.getElementById('af_site').innerHTML = '<option value="">Select</option>' + sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    document.getElementById('af_auditors').innerHTML = users.map(u => `<option value="${u.id}">${u.full_name}</option>`).join('');
    if (id) {
      const a = await API.getAudit(id);
      document.getElementById('af_name').value = a.name;
      document.getElementById('af_ldap').value = a.ldap_directory || '';
      document.getElementById('af_type').value = a.audit_type_id;
      document.getElementById('af_framework').value = a.framework || '';
      document.getElementById('af_site').value = a.site_id;
      document.getElementById('af_location').value = a.location || '';
      document.getElementById('af_performed_by').value = a.performed_by || '';
      document.getElementById('af_lead_auditor').value = a.lead_auditor || '';
      document.getElementById('af_from').value = a.from_date?.slice(0,10) || '';
      document.getElementById('af_to').value = a.audit_to_date?.slice(0,10) || '';
      document.getElementById('af_recurrence').value = a.recurrence || '';
      await loadDeptsBysite(a.site_id, a.department_id);
    }
  } catch {}
  openModal('modal-audit');
}

async function loadDeptsBysite(siteId, selectId) {
  const depts = await API.getDepts();
  const filtered = depts.filter(d => !siteId || d.site_id == siteId);
  document.getElementById('af_dept').innerHTML = '<option value="">Select</option>' + filtered.map(d => `<option value="${d.id}" ${selectId==d.id?'selected':''}>${d.name}</option>`).join('');
}

async function saveAudit(e) {
  e.preventDefault();
  const auditors = [...document.getElementById('af_auditors').selectedOptions].map(o => o.value);
  const body = {
    name: document.getElementById('af_name').value,
    ldap_directory: document.getElementById('af_ldap').value,
    audit_type_id: document.getElementById('af_type').value,
    framework: document.getElementById('af_framework').value,
    site_id: document.getElementById('af_site').value,
    location: document.getElementById('af_location').value,
    department_id: document.getElementById('af_dept').value,
    performed_by: document.getElementById('af_performed_by').value,
    lead_auditor: document.getElementById('af_lead_auditor').value,
    from_date: document.getElementById('af_from').value,
    audit_to_date: document.getElementById('af_to').value,
    recurrence: document.getElementById('af_recurrence').value,
    auditors
  };
  try {
    if (editingAuditId) await API.updateAudit(editingAuditId, body);
    else await API.createAudit(body);
    closeModal('modal-audit');
    loadAudits();
    renderCalendar();
    loadDashboard();
  } catch (err) { alert(err.message); }
}

async function deleteAudit(id) {
  if (!currentUser || currentUser.role !== 'Admin') {
    alert('Access restricted: Only administrators can delete audits.');
    return;
  }
  if (!confirm('Delete this audit?')) return;
  await API.deleteAudit(id);
  loadAudits();
}

function openStatusModal(id) {
  if (!currentUser || currentUser.role === 'Customer') {
    alert('Access restricted: Customers cannot update audit status.');
    return;
  }
  statusAuditId = id;
  document.getElementById('statusRemarks').value = '';
  openModal('modal-status');
}
async function confirmStatus() {
  const status_id = document.getElementById('statusSelect').value;
  const remarks   = document.getElementById('statusRemarks').value;
  await API.auditStatus(statusAuditId, { status_id, remarks });
  closeModal('modal-status');
  loadAudits();
  loadDashboard();
}

/* ====== NCs ====== */
async function loadNCs(statusFilter) {
  try {
    const ncs = await API.getNCs();
    let list = ncs;
    if (statusFilter) list = list.filter(n => n.status_name === statusFilter);
    const role = (currentUser?.role || '').toLowerCase();
    const isCustomer = role === 'customer';

    document.getElementById('ncsTbody').innerHTML = list.map(nc => `
      <tr>
        <td><strong>NC-${String(nc.id).padStart(3,'0')}</strong></td>
        <td>${nc.audit_name || '—'}</td>
        <td>${nc.site_name || '—'}</td>
        <td><span class="badge badge-${sevColor(nc.severity)}">${nc.severity}</span></td>
        <td>${nc.description?.slice(0,50)}...</td>
        <td>${nc.assigned_to_name || '—'}</td>
        <td>${fmt(nc.target_closure_date)}</td>
        <td><span class="badge badge-${ncStatusColor(nc.status_name)}">${nc.status_name}</span></td>
        <td><div class="actions-cell">
          <button class="btn btn-sm btn-outline" onclick="viewNCDetail(${nc.id})">View</button>
          ${isCustomer ? `
            ${String(nc.assigned_to) === String(currentUser?.id) ? `
              ${nc.status_name !== 'Resolved' && nc.status_name !== 'Closed' ? `<button class="btn btn-sm btn-primary" onclick="changeNCStatus(${nc.id},3)">Mark Resolved</button>` : ''}
            ` : `<span style="font-size:11px;color:#94a3b8;padding:2px 6px;background:#f1f5f9;border-radius:4px" title="Assigned to another person">Assigned to: ${nc.assigned_to_name || 'Other'}</span>`}
          ` : `
            <button class="btn btn-sm btn-success" onclick="changeNCStatus(${nc.id},2)">Close</button>
            <button class="btn btn-sm btn-danger"  onclick="changeNCStatus(${nc.id},4)">Reopen</button>
          `}
        </div></td>
      </tr>`).join('') || '<tr><td colspan="9" style="text-align:center;color:#aaa;padding:16px">No NCs</td></tr>';
  } catch(e){console.error(e)}
}

async function openNCModal(auditId) {
  if (!currentUser || currentUser.role === 'Customer') {
    alert('Access restricted: Customers cannot raise Non-Conformances.');
    return;
  }
  document.getElementById('nc_audit_id').value = auditId;
  document.getElementById('ncForm').reset();
  const users = await API.getUsers();
  document.getElementById('nc_assign').innerHTML = '<option value="">Select</option>' + users.map(u => `<option value="${u.id}">${u.full_name}</option>`).join('');
  openModal('modal-nc');
}

async function saveNC(e) {
  e.preventDefault();
  const body = {
    audit_id:           document.getElementById('nc_audit_id').value,
    observation_type:   document.getElementById('nc_obs_type').value,
    severity:           document.getElementById('nc_severity').value,
    clause:             document.getElementById('nc_clause').value,
    category:           document.getElementById('nc_category').value,
    description:        document.getElementById('nc_desc').value,
    type_clause_desc:   document.getElementById('nc_type_desc').value,
    assigned_to:        document.getElementById('nc_assign').value,
    target_closure_date:document.getElementById('nc_target').value,
  };
  try {
    await API.createNC(body);
    closeModal('modal-nc');
    if (document.getElementById('section-ncs').classList.contains('active')) loadNCs();
    loadDashboard();
    alert('NC created successfully');
  } catch(err){ alert(err.message); }
}

async function viewNCDetail(id) {
  try {
    const nc = await API.getNCs().then(list => list.find(n => n.id === id));
    const history = await API.ncHistory(id);
    const role = (currentUser?.role || '').toLowerCase();
    const isCustomer = role === 'customer';

    document.getElementById('ncDetailBody').innerHTML = `
      <div class="detail-hdr">
        <h3>NC-${String(nc.id).padStart(3,'0')}</h3>
        <div class="detail-meta">
          <span><span class="badge badge-${sevColor(nc.severity)}">${nc.severity}</span></span>
          <span>${nc.audit_name}</span>
          <span><span class="badge badge-${ncStatusColor(nc.status_name)}">${nc.status_name}</span></span>
        </div>
      </div>
      <table class="info-table" style="margin-bottom:14px">
        <tr><td>Description</td><td>${nc.description}</td></tr>
        <tr><td>Observation Type</td><td>${nc.observation_type || '—'}</td></tr>
        <tr><td>Clause</td><td>${nc.clause || '—'}</td></tr>
        <tr><td>Category</td><td>${nc.category || '—'}</td></tr>
        <tr><td>Assigned To</td><td>${nc.assigned_to_name || '—'}</td></tr>
        <tr><td>Target Closure</td><td>${fmt(nc.target_closure_date)}</td></tr>
        <tr><td>Plant</td><td>${nc.site_name || '—'}</td></tr>
      </table>
      <div style="margin-bottom:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        ${isCustomer ? `
          ${String(nc.assigned_to) === String(currentUser?.id) ? `
            ${nc.status_name !== 'Resolved' && nc.status_name !== 'Closed' ? `<button class="btn btn-sm btn-primary" onclick="changeNCStatus(${nc.id},3);closeModal('modal-nc-detail')">Mark Resolved</button>` : ''}
          ` : `<span style="color:#64748b;font-size:12px;padding:5px 10px;background:#f1f5f9;border-radius:4px">🔒 Assigned to ${nc.assigned_to_name || 'another user'} (Only the assigned owner can mark resolved)</span>`}
        ` : `
          <button class="btn btn-sm btn-success" onclick="changeNCStatus(${nc.id},2);closeModal('modal-nc-detail')">Close NC</button>
          <button class="btn btn-sm btn-danger"  onclick="changeNCStatus(${nc.id},4);closeModal('modal-nc-detail')">Reopen</button>
          <button class="btn btn-sm btn-outline" onclick="changeNCStatus(${nc.id},3);closeModal('modal-nc-detail')">Mark Resolved</button>
        `}
      </div>
      <div class="card-hdr">History</div>
      ${history.map(h => `<div class="history-item"><div class="history-date">${fmt(h.created_at)}</div><div><strong>${h.full_name}</strong> — ${h.action} ${h.details?'<br><span style="color:#666">'+h.details+'</span>':''}</div></div>`).join('') || '<p style="color:#aaa;font-size:12px">No history</p>'}
    `;
    openModal('modal-nc-detail');
  } catch(e){alert('Error loading NC')}
}

async function changeNCStatus(id, statusId) {
  await API.ncStatus(id, { status_id: statusId });
  loadNCs();
  loadDashboard();
}

/* ====== OBSERVATIONS ====== */
async function loadObs() {
  try {
    const obs = await API.getObs();
    document.getElementById('obsTbody').innerHTML = obs.map(o => `
      <tr>
        <td>${o.audit_name || '—'}</td>
        <td>${o.observation_type || '—'}</td>
        <td>${o.content}</td>
        <td>${o.author || '—'}</td>
        <td>${fmt(o.created_at)}</td>
      </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:#aaa;padding:16px">No observations</td></tr>';
  } catch(e){console.error(e)}
}

async function openObsModal() {
  if (!currentUser || currentUser.role === 'Customer') {
    alert('Access restricted: Customers cannot add observations.');
    return;
  }
  const audits = await API.getAudits();
  document.getElementById('obs_audit').innerHTML = '<option value="">Select Audit</option>' + audits.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
  openModal('modal-obs');
}

async function saveObs(e) {
  e.preventDefault();
  await API.createObs({
    audit_id: document.getElementById('obs_audit').value,
    observation_type: document.getElementById('obs_type').value,
    content: document.getElementById('obs_desc').value,
  });
  closeModal('modal-obs');
  loadObs();
}

/* ====== REPORTS ====== */
async function loadAgingReport() {
  try {
    const rows = await API.getAging();
    document.getElementById('agingTbody').innerHTML = rows.map(r => `
      <tr>
        <td>${r.description?.slice(0,50)}</td>
        <td>${r.site_name || '—'}</td>
        <td><span class="badge badge-${sevColor(r.severity)}">${r.severity}</span></td>
        <td style="color:var(--red);font-weight:bold">${r.days_overdue} days</td>
        <td>${r.assigned_to || '—'}</td>
        <td>${r.status}</td>
      </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:green;padding:16px">No overdue NCs</td></tr>';
  } catch(e){console.error(e)}
}

async function loadPlantReport() {
  try {
    const rows = await API.getPlantWise();
    document.getElementById('plantTbody').innerHTML = rows.map(r => `
      <tr>
        <td><strong>${r.plant}</strong></td>
        <td>${r.scope || '—'}</td>
        <td>${r.total_audits}</td>
        <td>${r.completed}</td>
        <td>${r.in_progress}</td>
        <td>${r.total_ncs}</td>
        <td style="color:var(--red)">${r.open_ncs}</td>
      </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;color:#aaa;padding:16px">No data</td></tr>';
  } catch(e){console.error(e)}
}

function exportCSV() {
  window.open('http://localhost:3001/api/reports/export/ncs', '_blank');
}

/* ====== MASTERS ====== */
async function loadPlants() {
  const rows = await API.getSites();
  document.getElementById('plantsTbody').innerHTML = rows.map(r => `
    <tr>
      <td><strong>${r.name}</strong></td><td>${r.location||'—'}</td><td>${r.scope||'—'}</td>
      <td><div class="actions-cell">
        <button class="btn btn-sm btn-primary" onclick="openMasterModal('plant',${r.id},'${esc(r.name)}','${esc(r.location||'')}','${esc(r.scope||'')}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteMaster('plant',${r.id})">Del</button>
      </div></td>
    </tr>`).join('');
}

async function loadDepts() {
  const rows = await API.getDepts();
  document.getElementById('deptsTbody').innerHTML = rows.map(r => `
    <tr>
      <td>${r.name}</td><td>${r.site_name||'—'}</td>
      <td><div class="actions-cell">
        <button class="btn btn-sm btn-primary" onclick="openMasterModal('dept',${r.id},'${esc(r.name)}',${r.site_id||0})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteMaster('dept',${r.id})">Del</button>
      </div></td>
    </tr>`).join('');
}

async function loadAuditTypes() {
  const rows = await API.getAuditTypes();
  document.getElementById('auditTypesTbody').innerHTML = rows.map(r => `
    <tr>
      <td>${r.name}</td><td>${r.framework||'—'}</td>
      <td><div class="actions-cell">
        <button class="btn btn-sm btn-primary" onclick="openMasterModal('auditType',${r.id},'${esc(r.name)}','${esc(r.framework||'')}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteMaster('auditType',${r.id})">Del</button>
      </div></td>
    </tr>`).join('');
}

async function loadUsers() {
  const rows = await API.getUsers();
  const isAdmin = currentUser && (currentUser.role || '').toLowerCase() === 'admin';
  document.getElementById('usersTbody').innerHTML = rows.map(r => `
    <tr>
      <td><strong>${r.full_name}</strong></td>
      <td>${r.username}</td>
      <td>${r.email}</td>
      <td><span class="badge badge-${(r.role_name||'').toLowerCase()==='admin'?'red':(r.role_name||'').toLowerCase()==='auditor'?'orange':'blue'}">${r.role_name||'Customer'}</span></td>
      <td>${isAdmin && String(r.id) !== String(currentUser.id) ? `<button class="btn btn-sm btn-danger" onclick="deleteUser(${r.id})">Del</button>` : '—'}</td>
    </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:#aaa;padding:16px">No users found</td></tr>';
}

function openUserModal() {
  if (!currentUser || currentUser.role !== 'Admin') {
    alert('Access restricted: Only administrators can create users.');
    return;
  }
  document.getElementById('userForm').reset();
  openModal('modal-user');
}

async function saveUser(e) {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'Admin') return;
  const body = {
    full_name: document.getElementById('uf_name').value.trim(),
    username:  document.getElementById('uf_username').value.trim(),
    email:     document.getElementById('uf_email').value.trim(),
    phone:     document.getElementById('uf_phone').value.trim(),
    role_id:   document.getElementById('uf_role').value,
    password:  document.getElementById('uf_password').value
  };
  try {
    await API.createUser(body);
    closeModal('modal-user');
    loadUsers();
    alert('User created successfully');
  } catch (err) {
    alert(err.message);
  }
}

async function deleteUser(id) {
  if (!currentUser || currentUser.role !== 'Admin') return;
  if (!confirm('Are you sure you want to remove this user account?')) return;
  try {
    await API.deleteUser(id);
    loadUsers();
  } catch (err) {
    alert(err.message);
  }
}

async function openMasterModal(type, id, ...vals) {
  if (!currentUser || currentUser.role !== 'Admin') {
    alert('Access restricted: Only administrators can modify Master settings.');
    return;
  }
  currentMasterType = type;
  editingMasterId   = id || null;
  const titles = { plant:'Plant / Site', dept:'Department', auditType:'Audit Type' };
  document.getElementById('masterModalTitle').textContent = (id ? 'Edit ' : 'Add ') + (titles[type] || '');
  let fields = '';
  if (type === 'plant') {
    fields = `<div class="form-group"><label>Plant Name *</label><input id="mf1" value="${vals[0]||''}" required/></div>
      <div class="form-group"><label>Location</label><input id="mf2" value="${vals[1]||''}"/></div>
      <div class="form-group"><label>Scope</label><input id="mf3" value="${vals[2]||''}" placeholder="e.g. ISO 9001"/></div>`;
  } else if (type === 'dept') {
    const sites = await API.getSites();
    fields = `<div class="form-group"><label>Department Name *</label><input id="mf1" value="${vals[0]||''}" required/></div>
      <div class="form-group"><label>Plant *</label><select id="mf2">${sites.map(s=>`<option value="${s.id}" ${s.id==vals[1]?'selected':''}>${s.name}</option>`).join('')}</select></div>`;
  } else if (type === 'auditType') {
    fields = `<div class="form-group"><label>Type Name *</label><input id="mf1" value="${vals[0]||''}" required/></div>
      <div class="form-group"><label>Standard / Framework</label><input id="mf2" value="${vals[1]||''}" placeholder="e.g. ISO 9001:2015"/></div>`;
  }
  document.getElementById('masterFormFields').innerHTML = fields;
  openModal('modal-master');
}

async function saveMaster(e) {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'Admin') {
    alert('Access restricted: Only administrators can save Master settings.');
    return;
  }
  const v1 = document.getElementById('mf1')?.value;
  const v2 = document.getElementById('mf2')?.value;
  const v3 = document.getElementById('mf3')?.value;
  try {
    if (currentMasterType === 'plant') {
      if (editingMasterId) await API.updateSite(editingMasterId, { name:v1, location:v2, scope:v3 });
      else await API.createSite({ name:v1, location:v2, scope:v3 });
      closeModal('modal-master'); loadPlants();
    } else if (currentMasterType === 'dept') {
      if (editingMasterId) await API.updateDept(editingMasterId, { name:v1, site_id:v2 });
      else await API.createDept({ name:v1, site_id:v2 });
      closeModal('modal-master'); loadDepts();
    } else if (currentMasterType === 'auditType') {
      if (editingMasterId) await API.updateAuditType(editingMasterId, { name:v1, framework:v2 });
      else await API.createAuditType({ name:v1, framework:v2 });
      closeModal('modal-master'); loadAuditTypes();
    }
  } catch(err){ alert(err.message); }
}

async function deleteMaster(type, id) {
  if (!currentUser || currentUser.role !== 'Admin') {
    alert('Access restricted: Only administrators can delete Master records.');
    return;
  }
  if (!confirm('Delete this item?')) return;
  if (type === 'plant')     await API.deleteSite(id);
  else if (type === 'dept') await API.deleteDept(id);
  else if (type === 'auditType') await API.deleteAuditType(id);
  if (type === 'plant')     loadPlants();
  else if (type === 'dept') loadDepts();
  else if (type === 'auditType') loadAuditTypes();
}

/* ====== CALENDAR ====== */
async function renderCalendar() {
  const year = calDate.getFullYear(), month = calDate.getMonth();
  document.getElementById('calTitle').textContent = calDate.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const grid = document.getElementById('calGrid');
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let html = days.map(d => `<div class="cal-hdr">${d}</div>`).join('');
  const first = new Date(year, month, 1).getDay();
  const last  = new Date(year, month+1, 0).getDate();
  const today = new Date();

  let audits = [];
  try { audits = await API.getAudits(); } catch {}

  for (let i=0;i<first;i++) html += '<div class="cal-day empty"></div>';
  for (let d=1;d<=last;d++) {
    const cur = new Date(year, month, d);
    const isToday = today.getFullYear()===year && today.getMonth()===month && today.getDate()===d;
    const dayAudits = audits.filter(a => {
      const f = new Date(a.from_date), t = new Date(a.audit_to_date);
      return cur >= new Date(f.getFullYear(),f.getMonth(),f.getDate()) && cur <= new Date(t.getFullYear(),t.getMonth(),t.getDate());
    });
    const evs = dayAudits.slice(0,3).map(a => {
      const cls = a.status_name==='Completed'?'completed':a.status_name==='In Progress'?'inprogress':'planned';
      return `<div class="cal-ev ${cls}" title="${a.name}">${a.name.slice(0,16)}</div>`;
    }).join('') + (dayAudits.length>3?`<div class="cal-ev" style="color:#888">+${dayAudits.length-3} more</div>`:'');
    html += `<div class="cal-day${isToday?' today':''}" onclick="showCalDay(${d},${month},${year})">
      <div class="cal-day-num">${d}</div>${evs}</div>`;
  }
  grid.innerHTML = html;
}

async function showCalDay(d, month, year) {
  const cur = new Date(year, month, d);
  let audits = [];
  try { audits = await API.getAudits(); } catch {}
  const dayAudits = audits.filter(a => {
    const f = new Date(a.from_date), t = new Date(a.audit_to_date);
    return cur >= new Date(f.getFullYear(),f.getMonth(),f.getDate()) && cur <= new Date(t.getFullYear(),t.getMonth(),t.getDate());
  });
  const card = document.getElementById('calDayCard');
  document.getElementById('calDayTitle').textContent = cur.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  document.getElementById('calDayBody').innerHTML = dayAudits.length ? dayAudits.map(a =>
    `<div style="padding:8px 0;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
      <div><strong>${a.name}</strong><br><span style="color:#777;font-size:12px">${a.site_name||''} · ${a.lead_auditor||''}</span></div>
      <div style="display:flex;gap:6px;align-items:center">
        <span class="badge badge-${statusColor(a.status_name)}">${a.status_name||'Planned'}</span>
        <button class="btn btn-sm btn-outline" onclick="viewAudit(${a.id})">View</button>
      </div>
    </div>`).join('') : '<p style="color:#aaa;padding:8px 0">No audits on this day</p>';
  card.style.display = 'block';
  card.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function calPrev() { calDate = new Date(calDate.getFullYear(), calDate.getMonth()-1, 1); renderCalendar(); document.getElementById('calDayCard').style.display='none'; }
function calNext() { calDate = new Date(calDate.getFullYear(), calDate.getMonth()+1, 1); renderCalendar(); document.getElementById('calDayCard').style.display='none'; }

/* ====== MODAL HELPERS ====== */
function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

/* ====== UTILS ====== */
function fmt(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); }
function esc(s) { return (s||'').replace(/'/g,"\\'"); }
function filterTable(tbodyId, val) {
  const lower = val.toLowerCase();
  document.querySelectorAll('#'+tbodyId+' tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(lower) ? '' : 'none';
  });
}
function statusColor(s) {
  const m = {'Planned':'blue','In Progress':'orange','Completed':'green','Cancelled':'gray'};
  return m[s] || 'blue';
}
function sevColor(s) { return s==='Critical'?'red':s==='Major'?'orange':'blue'; }
function ncStatusColor(s) {
  const m = {'Open':'red','Closed':'green','Resolved':'blue','Reopen':'orange'};
  return m[s] || 'gray';
}

/* ====== INIT ====== */
window.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem('mtl_user');
  const token  = localStorage.getItem('mtl_token');
  if (stored && token) {
    currentUser = JSON.parse(stored);
    initApp();
  }
  calDate.setDate(1);
});

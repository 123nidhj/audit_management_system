const BASE = window.location.origin + '/api';

function token() { return localStorage.getItem('mtl_token'); }

async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  if (res.status === 401) { logout(); return; }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const API = {
  login:       (b)    => api('POST', '/auth/login', b),
  register:    (b)    => api('POST', '/auth/register', b),

  getAudits:   ()     => api('GET',  '/audits'),
  getAudit:    (id)   => api('GET',  '/audits/' + id),
  createAudit: (b)    => api('POST', '/audits', b),
  updateAudit: (id,b) => api('PUT',  '/audits/' + id, b),
  deleteAudit: (id)   => api('DELETE','/audits/' + id),
  auditStatus: (id,b) => api('PATCH','/audits/' + id + '/status', b),
  auditHistory:(id)   => api('GET',  '/audits/' + id + '/history'),

  getNCs:      ()     => api('GET',  '/ncs'),
  createNC:    (b)    => api('POST', '/ncs', b),
  ncStatus:    (id,b) => api('PATCH','/ncs/' + id + '/status', b),
  ncHistory:   (id)   => api('GET',  '/ncs/' + id + '/history'),

  getObs:      (aid)  => api('GET',  '/observations' + (aid ? '?audit_id='+aid : '')),
  createObs:   (b)    => api('POST', '/observations', b),

  getSites:    ()     => api('GET',  '/masters/sites'),
  createSite:  (b)    => api('POST', '/masters/sites', b),
  updateSite:  (id,b) => api('PUT',  '/masters/sites/'+id, b),
  deleteSite:  (id)   => api('DELETE','/masters/sites/'+id),

  getDepts:    ()     => api('GET',  '/masters/departments'),
  createDept:  (b)    => api('POST', '/masters/departments', b),
  updateDept:  (id,b) => api('PUT',  '/masters/departments/'+id, b),
  deleteDept:  (id)   => api('DELETE','/masters/departments/'+id),

  getAuditTypes:    ()     => api('GET',  '/masters/audit-types'),
  createAuditType:  (b)    => api('POST', '/masters/audit-types', b),
  updateAuditType:  (id,b) => api('PUT',  '/masters/audit-types/'+id, b),
  deleteAuditType:  (id)   => api('DELETE','/masters/audit-types/'+id),

  getRoles:    ()     => api('GET',  '/masters/roles'),
  getUsers:    ()     => api('GET',  '/masters/users'),
  createUser:  (b)    => api('POST', '/masters/users', b),
  deleteUser:  (id)   => api('DELETE','/masters/users/'+id),

  getSummary:  ()     => api('GET',  '/reports/summary'),
  getAging:    ()     => api('GET',  '/reports/aging'),
  getPlantWise:()     => api('GET',  '/reports/plant-wise'),
  exportCSVUrl:()     => BASE + '/reports/export/ncs?token=' + token(),
};

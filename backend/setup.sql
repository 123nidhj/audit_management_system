USE audit_management;

-- Roles
INSERT IGNORE INTO roles (id, name) VALUES (1,'Admin'),(2,'Auditor'),(3,'Customer');

-- Audit Statuses
INSERT IGNORE INTO audit_statuses (id, name) VALUES (1,'Planned'),(2,'In Progress'),(3,'Completed'),(4,'Cancelled');

-- NC Statuses
INSERT IGNORE INTO nc_statuses (id, name) VALUES (1,'Open'),(2,'Closed'),(3,'Resolved'),(4,'Reopen');

-- Sample Sites
INSERT IGNORE INTO sites (id, name, location, scope) VALUES
  (1,'Plant A - Mumbai','Mumbai','ISO 9001'),
  (2,'Plant B - Pune','Pune','ISO 14001');

-- Sample Departments
INSERT IGNORE INTO departments (id, name, site_id) VALUES
  (1,'Quality',1),(2,'Operations',1),(3,'HR',1),
  (4,'Quality',2),(5,'Production',2);

-- Sample Audit Types
INSERT IGNORE INTO audit_types (id, name, framework) VALUES
  (1,'Internal Audit','ISO 9001:2015'),
  (2,'External Audit','ISO 14001:2015'),
  (3,'Certification Audit','ISO 45001:2018'),
  (4,'Surveillance Audit','ISO 9001:2015');

-- Add missing columns if not present
ALTER TABLE audit_daily_log ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE audit_daily_log ADD COLUMN IF NOT EXISTS ldap_directory VARCHAR(255);
ALTER TABLE audit_daily_log ADD COLUMN IF NOT EXISTS framework VARCHAR(255);
ALTER TABLE audit_daily_log ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE audit_daily_log ADD COLUMN IF NOT EXISTS recurrence VARCHAR(50);
ALTER TABLE audit_daily_log ADD COLUMN IF NOT EXISTS performed_by VARCHAR(255);
ALTER TABLE audit_daily_log ADD COLUMN IF NOT EXISTS lead_auditor VARCHAR(255);
ALTER TABLE audit_daily_log ADD COLUMN IF NOT EXISTS planned_by INT;
ALTER TABLE audit_daily_log ADD COLUMN IF NOT EXISTS from_date DATE;
ALTER TABLE audit_daily_log ADD COLUMN IF NOT EXISTS to_date DATE;
ALTER TABLE audit_daily_log ADD COLUMN IF NOT EXISTS audit_type_id INT;
ALTER TABLE audit_daily_log ADD COLUMN IF NOT EXISTS site_id INT;
ALTER TABLE audit_daily_log ADD COLUMN IF NOT EXISTS department_id INT;
ALTER TABLE audit_daily_log ADD COLUMN IF NOT EXISTS status_id INT DEFAULT 1;
ALTER TABLE audit_daily_log ADD COLUMN IF NOT EXISTS created_by INT;
ALTER TABLE audit_daily_log ADD COLUMN IF NOT EXISTS created_at DATETIME;

ALTER TABLE non_conformances ADD COLUMN IF NOT EXISTS observation_type VARCHAR(100);
ALTER TABLE non_conformances ADD COLUMN IF NOT EXISTS clause VARCHAR(255);
ALTER TABLE non_conformances ADD COLUMN IF NOT EXISTS control VARCHAR(255);
ALTER TABLE non_conformances ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE non_conformances ADD COLUMN IF NOT EXISTS type_clause_desc TEXT;
ALTER TABLE non_conformances ADD COLUMN IF NOT EXISTS severity VARCHAR(50);
ALTER TABLE non_conformances ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE non_conformances ADD COLUMN IF NOT EXISTS assigned_to INT;
ALTER TABLE non_conformances ADD COLUMN IF NOT EXISTS target_closure_date DATE;
ALTER TABLE non_conformances ADD COLUMN IF NOT EXISTS status_id INT DEFAULT 1;
ALTER TABLE non_conformances ADD COLUMN IF NOT EXISTS created_by INT;
ALTER TABLE non_conformances ADD COLUMN IF NOT EXISTS created_at DATETIME;
ALTER TABLE non_conformances ADD COLUMN IF NOT EXISTS audit_id INT;

ALTER TABLE notes ADD COLUMN IF NOT EXISTS audit_id INT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_id INT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS observation_type VARCHAR(100);
ALTER TABLE notes ADD COLUMN IF NOT EXISTS created_at DATETIME;

ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id INT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INT DEFAULT 3;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at DATETIME;

ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS user_id INT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS action VARCHAR(100);
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS entity VARCHAR(100);
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS entity_id INT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS details TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS created_at DATETIME;

ALTER TABLE login_log ADD COLUMN IF NOT EXISTS user_id INT;
ALTER TABLE login_log ADD COLUMN IF NOT EXISTS login_time DATETIME;
ALTER TABLE login_log ADD COLUMN IF NOT EXISTS status VARCHAR(50);

ALTER TABLE audit_participants ADD COLUMN IF NOT EXISTS audit_id INT;
ALTER TABLE audit_participants ADD COLUMN IF NOT EXISTS user_id INT;

ALTER TABLE audit_sites ADD COLUMN IF NOT EXISTS audit_id INT;
ALTER TABLE audit_sites ADD COLUMN IF NOT EXISTS site_id INT;

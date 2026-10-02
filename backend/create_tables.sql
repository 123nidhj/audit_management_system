USE audit_management;

CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS sites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  scope VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  site_id INT,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255),
  username VARCHAR(100) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  phone VARCHAR(20),
  department_id INT,
  role_id INT DEFAULT 3,
  created_at DATETIME DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  framework VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS audit_statuses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS nc_statuses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_daily_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  ldap_directory VARCHAR(255),
  audit_type_id INT,
  framework VARCHAR(255),
  site_id INT,
  location VARCHAR(255),
  department_id INT,
  from_date DATE,
  audit_to_date DATE,
  recurrence VARCHAR(50),
  performed_by VARCHAR(255),
  lead_auditor VARCHAR(255),
  planned_by INT,
  status_id INT DEFAULT 1,
  created_by INT,
  created_at DATETIME DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  audit_id INT,
  user_id INT
);

CREATE TABLE IF NOT EXISTS audit_sites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  audit_id INT,
  site_id INT
);

CREATE TABLE IF NOT EXISTS non_conformances (
  id INT PRIMARY KEY AUTO_INCREMENT,
  audit_id INT,
  observation_type VARCHAR(100),
  clause VARCHAR(255),
  control VARCHAR(255),
  description TEXT,
  type_clause_desc TEXT,
  severity VARCHAR(50),
  category VARCHAR(100),
  assigned_to INT,
  target_closure_date DATE,
  status_id INT DEFAULT 1,
  created_by INT,
  created_at DATETIME DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  audit_id INT,
  user_id INT,
  content TEXT,
  observation_type VARCHAR(100),
  created_at DATETIME DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100),
  entity VARCHAR(100),
  entity_id INT,
  details TEXT,
  created_at DATETIME DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS login_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  login_time DATETIME,
  status VARCHAR(50)
);

-- Seed data
INSERT IGNORE INTO roles (id, name) VALUES (1,'Admin'),(2,'Auditor'),(3,'Customer');
INSERT IGNORE INTO audit_statuses (id, name) VALUES (1,'Planned'),(2,'In Progress'),(3,'Completed'),(4,'Cancelled');
INSERT IGNORE INTO nc_statuses (id, name) VALUES (1,'Open'),(2,'Closed'),(3,'Resolved'),(4,'Reopen');
INSERT IGNORE INTO sites (id, name, location, scope) VALUES (1,'Plant A - Mumbai','Mumbai','ISO 9001'),(2,'Plant B - Pune','Pune','ISO 14001');
INSERT IGNORE INTO departments (id, name, site_id) VALUES (1,'Quality',1),(2,'Operations',1),(3,'HR',1),(4,'Quality',2),(5,'Production',2);
INSERT IGNORE INTO audit_types (id, name, framework) VALUES (1,'Internal Audit','ISO 9001:2015'),(2,'External Audit','ISO 14001:2015'),(3,'Certification Audit','ISO 45001:2018'),(4,'Surveillance Audit','ISO 9001:2015');

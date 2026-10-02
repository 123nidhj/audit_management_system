/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.3.2-MariaDB, for osx10.19 (arm64)
--
-- Host: 127.0.0.1    Database: audit_management
-- ------------------------------------------------------
-- Server version	12.3.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `activity_log`
--

DROP TABLE IF EXISTS `activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) DEFAULT NULL,
  `entity` varchar(100) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_log`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `activity_log` WRITE;
/*!40000 ALTER TABLE `activity_log` DISABLE KEYS */;
INSERT INTO `activity_log` VALUES
(1,2,'CREATE','audit',4,NULL,'2026-09-26 13:10:13'),
(2,2,'STATUS_CHANGE','audit',4,'','2026-09-26 13:15:15'),
(3,4,'STATUS_CHANGE','nc',1,'','2026-09-26 13:57:13'),
(4,2,'CREATE','audit',5,NULL,'2026-09-26 15:58:54'),
(5,6,'STATUS_CHANGE','nc',4,'','2026-09-26 16:02:46'),
(6,3,'STATUS_CHANGE','audit',5,'','2026-09-26 16:05:06'),
(7,3,'STATUS_CHANGE','nc',4,'','2026-09-26 16:05:14');
/*!40000 ALTER TABLE `activity_log` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `audit_daily_log`
--

DROP TABLE IF EXISTS `audit_daily_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_daily_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `ldap_directory` varchar(255) DEFAULT NULL,
  `audit_type_id` int(11) DEFAULT NULL,
  `framework` varchar(255) DEFAULT NULL,
  `site_id` int(11) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `audit_to_date` date DEFAULT NULL,
  `recurrence` varchar(50) DEFAULT NULL,
  `performed_by` varchar(255) DEFAULT NULL,
  `lead_auditor` varchar(255) DEFAULT NULL,
  `planned_by` int(11) DEFAULT NULL,
  `status_id` int(11) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_daily_log`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `audit_daily_log` WRITE;
/*!40000 ALTER TABLE `audit_daily_log` DISABLE KEYS */;
INSERT INTO `audit_daily_log` VALUES
(1,'ISO 9001 Annual Audit',NULL,1,'ISO 9001:2015',1,'Mumbai',1,'2026-08-10','2026-08-20','Annually','John Smith','John Smith',NULL,2,1,'2026-08-17 13:28:38'),
(2,'Safety Compliance Audit',NULL,2,'ISO 45001:2018',2,'Pune',4,'2026-08-25','2026-08-28','Quarterly','Sara Jones','Sara Jones',NULL,1,1,'2026-08-17 13:28:38'),
(3,'Quality Review Q3',NULL,1,'ISO 9001:2015',1,'Mumbai',2,'2026-09-01','2026-09-05','Quarterly','Mike Lee','Mike Lee',NULL,1,1,'2026-08-17 13:28:38'),
(4,'Information Security Audit','DC=corp,DC=mtl,OU=Security',1,'ISO/IEC 27001:2022',3,'chennai',6,'2026-09-27','2026-10-08','Quarterly','nish','nidhi',NULL,2,2,'2026-09-26 13:10:13'),
(5,'Information','DC=corp,DC=mtl,OU=Security',1,'ISO/IEC 27001:2022',3,'karnataka',6,'2026-10-01','2026-10-10','','nidhi','nish',NULL,3,2,'2026-09-26 15:58:54');
/*!40000 ALTER TABLE `audit_daily_log` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `audit_participants`
--

DROP TABLE IF EXISTS `audit_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_participants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `audit_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_participants`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `audit_participants` WRITE;
/*!40000 ALTER TABLE `audit_participants` DISABLE KEYS */;
INSERT INTO `audit_participants` VALUES
(1,4,3),
(2,5,1);
/*!40000 ALTER TABLE `audit_participants` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `audit_sites`
--

DROP TABLE IF EXISTS `audit_sites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_sites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `audit_id` int(11) DEFAULT NULL,
  `site_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_sites`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `audit_sites` WRITE;
/*!40000 ALTER TABLE `audit_sites` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_sites` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `audit_statuses`
--

DROP TABLE IF EXISTS `audit_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_statuses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_statuses`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `audit_statuses` WRITE;
/*!40000 ALTER TABLE `audit_statuses` DISABLE KEYS */;
INSERT INTO `audit_statuses` VALUES
(1,'Planned'),
(2,'In Progress'),
(3,'Completed'),
(4,'Cancelled');
/*!40000 ALTER TABLE `audit_statuses` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `audit_types`
--

DROP TABLE IF EXISTS `audit_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `framework` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_types`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `audit_types` WRITE;
/*!40000 ALTER TABLE `audit_types` DISABLE KEYS */;
INSERT INTO `audit_types` VALUES
(1,'Internal Audit','ISO 9001:2015'),
(2,'External Audit','ISO 14001:2015'),
(3,'Certification Audit','ISO 45001:2018'),
(4,'Surveillance Audit','ISO 9001:2015');
/*!40000 ALTER TABLE `audit_types` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `site_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `site_id` (`site_id`),
  CONSTRAINT `1` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES
(1,'Quality',1),
(2,'Operations',1),
(3,'HR',1),
(4,'Quality',2),
(5,'Production',2),
(6,'IT ',3);
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `login_log`
--

DROP TABLE IF EXISTS `login_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `login_time` datetime DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_log`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `login_log` WRITE;
/*!40000 ALTER TABLE `login_log` DISABLE KEYS */;
INSERT INTO `login_log` VALUES
(1,1,'2026-08-17 13:20:17','success'),
(2,1,'2026-08-17 19:13:45','success'),
(3,1,'2026-08-17 19:13:56','success'),
(4,1,'2026-08-17 19:17:08','success'),
(5,1,'2026-08-17 19:18:25','success'),
(6,2,'2026-09-26 12:24:57','success'),
(7,2,'2026-09-26 12:25:19','success'),
(8,2,'2026-09-26 12:25:47','success'),
(9,2,'2026-09-26 12:29:34','success'),
(10,2,'2026-09-26 12:33:06','success'),
(11,3,'2026-09-26 12:37:10','success'),
(12,3,'2026-09-26 12:37:50','success'),
(13,2,'2026-09-26 12:56:02','success'),
(14,2,'2026-09-26 13:06:18','success'),
(15,4,'2026-09-26 13:21:56','success'),
(16,5,'2026-09-26 13:23:14','success'),
(17,5,'2026-09-26 13:37:15','success'),
(18,4,'2026-09-26 13:56:29','success'),
(19,2,'2026-09-26 14:14:45','success'),
(20,4,'2026-09-26 15:46:08','success'),
(21,2,'2026-09-26 15:57:16','success'),
(22,6,'2026-09-26 16:02:19','success'),
(23,3,'2026-09-26 16:04:44','success'),
(24,2,'2026-09-27 09:48:42','success'),
(25,7,'2026-09-27 15:18:27','success'),
(26,5,'2026-09-27 16:54:47','success');
/*!40000 ALTER TABLE `login_log` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `nc_statuses`
--

DROP TABLE IF EXISTS `nc_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `nc_statuses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nc_statuses`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `nc_statuses` WRITE;
/*!40000 ALTER TABLE `nc_statuses` DISABLE KEYS */;
INSERT INTO `nc_statuses` VALUES
(1,'Open'),
(2,'Closed'),
(3,'Resolved'),
(4,'Reopen');
/*!40000 ALTER TABLE `nc_statuses` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `non_conformances`
--

DROP TABLE IF EXISTS `non_conformances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `non_conformances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `audit_id` int(11) DEFAULT NULL,
  `observation_type` varchar(100) DEFAULT NULL,
  `clause` varchar(255) DEFAULT NULL,
  `control` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `type_clause_desc` text DEFAULT NULL,
  `severity` varchar(50) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `target_closure_date` date DEFAULT NULL,
  `status_id` int(11) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `non_conformances`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `non_conformances` WRITE;
/*!40000 ALTER TABLE `non_conformances` DISABLE KEYS */;
INSERT INTO `non_conformances` VALUES
(1,1,'NC','4.2',NULL,'Document control procedure not followed',NULL,'Major','Documentation',4,'2026-08-30',3,NULL,'2026-08-17 13:40:15'),
(2,1,'NC','7.1',NULL,'Calibration records missing for 3 instruments',NULL,'Critical','Resources',1,'2026-08-25',1,NULL,'2026-08-17 13:40:15'),
(3,2,'Observation','8.1',NULL,'Fire extinguisher not serviced',NULL,'Minor','Operations',4,'2026-09-15',1,NULL,'2026-08-17 13:40:15'),
(4,4,'NC','A.9.2 User Access Provisioning',NULL,' Quarterly privilege access reviews were not documented for cloud systems.','Non-compliance with ISO 27001 clause A.9.2.','Critical','access control',3,'2026-10-08',2,2,'2026-09-26 13:14:17');
/*!40000 ALTER TABLE `non_conformances` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `notes`
--

DROP TABLE IF EXISTS `notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `audit_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `observation_type` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `notes` WRITE;
/*!40000 ALTER TABLE `notes` DISABLE KEYS */;
INSERT INTO `notes` VALUES
(1,4,2,'\"Plant leadership and department heads were present on time for the opening meeting and provided full access to all records.\"','Positive','2026-09-26 14:16:00');
/*!40000 ALTER TABLE `notes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES
(1,'Admin'),
(2,'Auditor'),
(3,'Customer');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `sites`
--

DROP TABLE IF EXISTS `sites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `scope` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sites`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `sites` WRITE;
/*!40000 ALTER TABLE `sites` DISABLE KEYS */;
INSERT INTO `sites` VALUES
(1,'Plant A - Mumbai','Mumbai','ISO 9001'),
(2,'Plant B - Pune','Pune','ISO 14001'),
(3,'plant c ','chennai','iso 222');
/*!40000 ALTER TABLE `sites` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `role_id` int(11) DEFAULT 3,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'jack','jackko','nidhisshetty303@gmail.com','$2b$10$RPnOVZ0k5sZ0qJfaVHRlduj3DVwJBvRqYjSG8cpcEWXk9ChU7/nBa','7866654437',NULL,1,'2026-08-17 13:20:05'),
(2,'Admin User','admin','admin@mtl.com','$2b$10$3gMFsC4/SRSXd.EvQxpUfeSshNRSeQdjjUrqiSzfIfl/dxcanu.xC','9999999999',NULL,1,'2026-09-26 00:00:29'),
(3,'Lead Auditor','auditor','auditor@mtl.com','$2b$10$3gMFsC4/SRSXd.EvQxpUfeSshNRSeQdjjUrqiSzfIfl/dxcanu.xC',NULL,NULL,2,'2026-09-26 12:32:37'),
(4,'preu','preu','preu123@gmail.com','d901ccb54e06512ab887f55f6b46d1b2d32a756bc16f3b4404484a59efdabf45','2277889916',NULL,3,'2026-09-26 13:21:48'),
(5,'Demo Customer','customer1','customer1@mtl.com','b041c0aeb35bb0fa4aa668ca5a920b590196fdaf9a00eb852c9b7f4d123cc6d6','9876543210',NULL,3,'2026-09-26 13:23:07'),
(6,'pre','pre','pre23@gmail.com','7072710435c73c4849f3ed4c5f50f519f42f6a3d0eb0bee1bce90d73bac15f05','2236578965',NULL,3,'2026-09-26 16:02:12');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-30 22:15:22

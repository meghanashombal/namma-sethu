CREATE DATABASE IF NOT EXISTS namma_sethu
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE namma_sethu;

-- =========================================================
-- 1. AUTHORITIES
-- =========================================================

CREATE TABLE IF NOT EXISTS authorities (
    authority_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    authority_type VARCHAR(100),
    taluk VARCHAR(150),
    pin_code VARCHAR(20),
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(500),
    source_note VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_authority_taluk (taluk)
);

-- =========================================================
-- 2. DEPARTMENTS / VERIFIED CIVIC ROLES
-- =========================================================

CREATE TABLE IF NOT EXISTS departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL,
    responsibility_description TEXT,
    source_note VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- 3. JURISDICTIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS jurisdictions (
    jurisdiction_id INT AUTO_INCREMENT PRIMARY KEY,
    subdivision VARCHAR(150),
    taluk VARCHAR(150) NOT NULL,
    authority_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (authority_id)
        REFERENCES authorities(authority_id),
    INDEX idx_jurisdiction_taluk (taluk)
);

-- =========================================================
-- 4. JURISDICTION VERSIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS jurisdiction_versions (
    version_id INT AUTO_INCREMENT PRIMARY KEY,
    jurisdiction_id INT NOT NULL,
    authority_id INT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE NULL,
    version_status ENUM('ACTIVE','HISTORICAL','PLANNED') DEFAULT 'ACTIVE',
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (jurisdiction_id)
        REFERENCES jurisdictions(jurisdiction_id),
    FOREIGN KEY (authority_id)
        REFERENCES authorities(authority_id),
    INDEX idx_jversion_dates (jurisdiction_id, valid_from, valid_to),
    INDEX idx_jversion_status (version_status)
);

-- =========================================================
-- 5. AUTHORITY CONTACTS
-- =========================================================

CREATE TABLE IF NOT EXISTS authority_contacts (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    taluk VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    office_phone VARCHAR(50),
    mobile_phone VARCHAR(50),
    authority_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (authority_id)
        REFERENCES authorities(authority_id),
    INDEX idx_contact_taluk (taluk)
);

-- =========================================================
-- 6. LOCATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    village_name VARCHAR(255) NOT NULL,
    village_code VARCHAR(50),
    taluk VARCHAR(150) DEFAULT 'Mysuru',
    location_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_location (village_name, village_code),
    INDEX idx_location_taluk (taluk),
    INDEX idx_location_name (village_name)
);

-- =========================================================
-- 7. SERVICES
-- =========================================================

CREATE TABLE IF NOT EXISTS services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    source_note VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- 8. RESPONSIBILITY RULES
-- =========================================================

CREATE TABLE IF NOT EXISTS responsibility_rules (
    rule_id INT AUTO_INCREMENT PRIMARY KEY,
    issue_type VARCHAR(100) NOT NULL,
    department_id INT NULL,
    authority_id INT NULL,
    jurisdiction_id INT NULL,
    effective_from DATE NULL,
    effective_to DATE NULL,
    rule_status ENUM('ACTIVE','INACTIVE','REVIEW') DEFAULT 'ACTIVE',
    explanation TEXT,
    source_note VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id)
        REFERENCES departments(department_id),
    FOREIGN KEY (authority_id)
        REFERENCES authorities(authority_id),
    FOREIGN KEY (jurisdiction_id)
        REFERENCES jurisdictions(jurisdiction_id),
    INDEX idx_rule_issue (issue_type),
    INDEX idx_rule_status (rule_status)
);

-- =========================================================
-- 9. SLA RULES
-- =========================================================

CREATE TABLE IF NOT EXISTS sla_rules (
    sla_rule_id INT AUTO_INCREMENT PRIMARY KEY,
    issue_type VARCHAR(100) NOT NULL,
    priority ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL,
    routing_hours INT NOT NULL DEFAULT 24,
    resolution_hours INT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    explanation TEXT,
    source_note VARCHAR(500),
    rule_status ENUM('ACTIVE','INACTIVE','REVIEW') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sla_issue_priority (issue_type, priority)
);

-- =========================================================
-- 10. ESCALATION POLICIES
-- =========================================================

CREATE TABLE IF NOT EXISTS escalation_policies (
    escalation_policy_id INT AUTO_INCREMENT PRIMARY KEY,
    issue_type VARCHAR(100),
    priority ENUM('LOW','MEDIUM','HIGH','CRITICAL'),
    level_number INT NOT NULL,
    trigger_after_hours INT NOT NULL,
    action_type ENUM(
        'REMINDER',
        'SUPERVISOR',
        'HIGHER_AUTHORITY',
        'ADMIN_REVIEW',
        'SLA_BREACH'
    ) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_escalation_policy (issue_type, priority, level_number)
);

-- =========================================================
-- 11. USERS
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('CITIZEN','STAFF','ADMIN') NOT NULL DEFAULT 'CITIZEN',
    phone VARCHAR(30),
    preferred_language ENUM('EN','KN') DEFAULT 'EN',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role)
);

-- =========================================================
-- 12. COMPLAINTS
-- =========================================================

CREATE TABLE IF NOT EXISTS complaints (
    complaint_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_code VARCHAR(30) NOT NULL UNIQUE,

    user_id INT NOT NULL,

    issue_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,

    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,
    location_text VARCHAR(500),
    location_id INT NULL,
    location_source ENUM('AUTO','MANUAL','TEXT','UNKNOWN') DEFAULT 'UNKNOWN',

    priority ENUM('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'MEDIUM',

    status ENUM(
        'SUBMITTED',
        'CHECKING_LOCATION',
        'MANUAL_REVIEW',
        'ROUTED',
        'ACKNOWLEDGED',
        'ASSIGNED',
        'IN_PROGRESS',
        'SLA_BREACHED',
        'RESOLVED',
        'REOPENED',
        'CLOSED'
    ) DEFAULT 'SUBMITTED',

    assigned_authority_id INT NULL,
    assigned_department_id INT NULL,
    assigned_staff_id INT NULL,

    routing_deadline DATETIME NULL,
    resolution_deadline DATETIME NULL,

    is_public BOOLEAN DEFAULT TRUE,
    is_duplicate BOOLEAN DEFAULT FALSE,
    tracking_token VARCHAR(100) NOT NULL UNIQUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id),
    FOREIGN KEY (location_id)
        REFERENCES locations(location_id),
    FOREIGN KEY (assigned_authority_id)
        REFERENCES authorities(authority_id),
    FOREIGN KEY (assigned_department_id)
        REFERENCES departments(department_id),
    FOREIGN KEY (assigned_staff_id)
        REFERENCES users(user_id),

    INDEX idx_complaint_user (user_id),
    INDEX idx_complaint_status (status),
    INDEX idx_complaint_issue (issue_type),
    INDEX idx_complaint_priority (priority),
    INDEX idx_complaint_location (latitude, longitude),
    INDEX idx_complaint_created (created_at)
);

-- =========================================================
-- 13. COMPLAINT MEDIA
-- =========================================================

CREATE TABLE IF NOT EXISTS complaint_media (
    media_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    stored_path VARCHAR(500) NOT NULL,
    media_type ENUM('IMAGE','VIDEO','AUDIO','OTHER') NOT NULL,
    file_size BIGINT,
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id)
        ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by)
        REFERENCES users(user_id),

    INDEX idx_media_complaint (complaint_id)
);

-- =========================================================
-- 14. ROUTING DECISIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS routing_decisions (
    routing_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    jurisdiction_version_id INT NULL,
    authority_id INT NULL,
    department_id INT NULL,
    rule_id INT NULL,

    detected_issue_type VARCHAR(100),
    explanation TEXT NOT NULL,

    decided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    decision_status ENUM(
        'ROUTED',
        'MANUAL_REVIEW',
        'FAILED'
    ) DEFAULT 'ROUTED',

    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id)
        ON DELETE CASCADE,
    FOREIGN KEY (jurisdiction_version_id)
        REFERENCES jurisdiction_versions(version_id),
    FOREIGN KEY (authority_id)
        REFERENCES authorities(authority_id),
    FOREIGN KEY (department_id)
        REFERENCES departments(department_id),
    FOREIGN KEY (rule_id)
        REFERENCES responsibility_rules(rule_id),

    INDEX idx_routing_complaint (complaint_id),
    INDEX idx_routing_status (decision_status)
);

-- =========================================================
-- 15. STATUS HISTORY
-- =========================================================

CREATE TABLE IF NOT EXISTS complaint_status_history (
    history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INT NULL,
    note TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id)
        ON DELETE CASCADE,
    FOREIGN KEY (changed_by)
        REFERENCES users(user_id),

    INDEX idx_history_complaint (complaint_id, changed_at)
);

-- =========================================================
-- 16. COMPLAINT NOTES
-- =========================================================

CREATE TABLE IF NOT EXISTS complaint_notes (
    note_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    INDEX idx_notes_complaint (complaint_id)
);

-- =========================================================
-- 17. DUPLICATE DETECTION
-- =========================================================

CREATE TABLE IF NOT EXISTS complaint_duplicates (
    duplicate_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    possible_duplicate_id BIGINT NOT NULL,
    similarity_score DECIMAL(5,2),
    reason VARCHAR(500),
    user_decision ENUM('PENDING','LINKED','SEPARATE','IGNORED')
        DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id)
        ON DELETE CASCADE,
    FOREIGN KEY (possible_duplicate_id)
        REFERENCES complaints(complaint_id)
        ON DELETE CASCADE,

    INDEX idx_duplicate_complaint (complaint_id)
);

-- =========================================================
-- 18. ESCALATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS complaint_escalations (
    escalation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    escalation_policy_id INT NULL,
    level_number INT NOT NULL,
    escalation_type ENUM(
        'REMINDER',
        'SUPERVISOR',
        'HIGHER_AUTHORITY',
        'ADMIN_REVIEW',
        'SLA_BREACH'
    ) NOT NULL,
    reason TEXT NOT NULL,
    escalated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    created_by INT NULL,

    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id)
        ON DELETE CASCADE,
    FOREIGN KEY (escalation_policy_id)
        REFERENCES escalation_policies(escalation_policy_id),
    FOREIGN KEY (created_by)
        REFERENCES users(user_id),

    INDEX idx_escalation_complaint (complaint_id),
    INDEX idx_escalation_level (level_number)
);

-- =========================================================
-- 19. RESOLUTION PROOF
-- =========================================================

CREATE TABLE IF NOT EXISTS complaint_resolutions (
    resolution_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    resolved_by INT NOT NULL,
    resolution_note TEXT NOT NULL,
    resolution_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,

    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id)
        ON DELETE CASCADE,
    FOREIGN KEY (resolved_by)
        REFERENCES users(user_id),

    INDEX idx_resolution_complaint (complaint_id)
);

-- =========================================================
-- 20. CITIZEN VERIFICATION
-- =========================================================

CREATE TABLE IF NOT EXISTS complaint_verifications (
    verification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    verification_result ENUM('YES','NO') NOT NULL,
    comment TEXT,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    INDEX idx_verification_complaint (complaint_id)
);

-- =========================================================
-- 21. COMMUNITY CONFIRMATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS community_confirmations (
    confirmation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    confirmation_type ENUM('CONFIRM','NOT_RELEVANT') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_community_confirmation (complaint_id, user_id),

    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);

-- =========================================================
-- 22. NOTIFICATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    complaint_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(100),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id),
    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id)
        ON DELETE SET NULL,

    INDEX idx_notification_user (user_id, is_read),
    INDEX idx_notification_created (created_at)
);

-- =========================================================
-- 23. AUDIT LOGS
-- =========================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_created (created_at)
);

-- =========================================================
-- 24. OFFICIAL SOURCES
-- =========================================================

CREATE TABLE IF NOT EXISTS official_sources (
    source_id INT AUTO_INCREMENT PRIMARY KEY,
    source_name VARCHAR(255) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    purpose TEXT,
    data_type VARCHAR(100),
    last_verified DATE NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- 25. HELPLINES
-- =========================================================

CREATE TABLE IF NOT EXISTS helplines (
    helpline_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    phone VARCHAR(100),
    description TEXT,
    source_note VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
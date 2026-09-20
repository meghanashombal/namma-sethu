import {
  Complaint,
  ComplaintStatus,
  Jurisdiction,
  JurisdictionVersion,
  SlaRule,
  EscalationPolicy,
  NotificationItem,
  AuditLog,
  User,
  UserRole,
  CivicHotspot,
  OfficialSource,
  HelplineItem,
  ResolutionProof,
  CitizenVerification,
  SmsMessage,
} from '../types';

import {
  INITIAL_COMPLAINTS,
  INITIAL_JURISDICTIONS,
  INITIAL_JURISDICTION_VERSIONS,
  OFFICIAL_SLA_RULES,
  OFFICIAL_ESCALATION_POLICIES,
  OFFICIAL_SOURCES,
  OFFICIAL_HELPLINES,
  DEMO_USERS,
  INITIAL_HOTSPOTS,
} from '../data/mysuruOfficialData';

const STORAGE_KEYS = {
  COMPLAINTS: 'namma_sethu_complaints_v1',
  JURISDICTIONS: 'namma_sethu_jurisdictions_v1',
  JURISDICTION_VERSIONS: 'namma_sethu_jurisdiction_versions_v1',
  SLA_RULES: 'namma_sethu_sla_rules_v1',
  ESCALATION_POLICIES: 'namma_sethu_escalation_policies_v1',
  NOTIFICATIONS: 'namma_sethu_notifications_v1',
  AUDIT_LOGS: 'namma_sethu_audit_logs_v1',
  CURRENT_USER: 'namma_sethu_current_user_v1',
  HOTSPOTS: 'namma_sethu_hotspots_v1',
  SMS_LOGS: 'namma_sethu_sms_logs_v1',
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export class StorageService {
  // Initialize storage with official data if empty
  static init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) {
      setStored(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.JURISDICTIONS)) {
      setStored(STORAGE_KEYS.JURISDICTIONS, INITIAL_JURISDICTIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.JURISDICTION_VERSIONS)) {
      setStored(STORAGE_KEYS.JURISDICTION_VERSIONS, INITIAL_JURISDICTION_VERSIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SLA_RULES)) {
      setStored(STORAGE_KEYS.SLA_RULES, OFFICIAL_SLA_RULES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ESCALATION_POLICIES)) {
      setStored(STORAGE_KEYS.ESCALATION_POLICIES, OFFICIAL_ESCALATION_POLICIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.HOTSPOTS)) {
      setStored(STORAGE_KEYS.HOTSPOTS, INITIAL_HOTSPOTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      setStored(STORAGE_KEYS.CURRENT_USER, DEMO_USERS[0]); // Default to Meghana (Citizen)
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      const initialLogs: AuditLog[] = [
        {
          id: 'log-seed-1',
          timestamp: '2026-09-01T00:00:00.000Z',
          user: 'System Setup',
          userRole: 'SYSTEM',
          action: 'Official Data Imported',
          details: 'Official Mysuru City Corporation Wards (1-65), Sub-Divisions and TMC dataset loaded.',
        },
        {
          id: 'log-seed-2',
          timestamp: '2026-09-01T00:05:00.000Z',
          user: 'Admin Ramesh',
          userRole: 'ADMIN',
          action: 'Jurisdiction Version Updated',
          details: 'Hinkal Urban Sector upgraded from Version 1 (Gram Panchayat) to Version 2 (MCC Zone 8).',
        },
      ];
      setStored(STORAGE_KEYS.AUDIT_LOGS, initialLogs);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      const initialNotifs: NotificationItem[] = [
        {
          id: 'notif-1',
          userId: 'usr-citizen-1',
          complaintId: 'MY-2026-1001',
          title: 'Complaint Routed Successfully',
          message: 'Your pothole report MY-2026-1001 has been assigned to MCC Engineering Division within 24h SLA.',
          type: 'info',
          timestamp: '2026-09-17T09:30:00.000Z',
          isRead: false,
        },
        {
          id: 'notif-2',
          userId: 'usr-citizen-1',
          complaintId: 'MY-2026-0915',
          title: 'Resolution Proof Ready for Verification',
          message: 'Water pipeline in Saraswathipuram has been repaired. Please verify if the issue is solved.',
          type: 'success',
          timestamp: '2026-09-16T16:35:00.000Z',
          isRead: false,
        },
      ];
      setStored(STORAGE_KEYS.NOTIFICATIONS, initialNotifs);
    }
  }

  // --- Reset All to Demo Seed ---
  static resetToOfficialSeed(): void {
    setStored(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
    setStored(STORAGE_KEYS.JURISDICTIONS, INITIAL_JURISDICTIONS);
    setStored(STORAGE_KEYS.JURISDICTION_VERSIONS, INITIAL_JURISDICTION_VERSIONS);
    setStored(STORAGE_KEYS.SLA_RULES, OFFICIAL_SLA_RULES);
    setStored(STORAGE_KEYS.ESCALATION_POLICIES, OFFICIAL_ESCALATION_POLICIES);
    setStored(STORAGE_KEYS.HOTSPOTS, INITIAL_HOTSPOTS);
    StorageService.logAudit('Reset Demo Data', 'ADMIN', undefined, undefined, 'Restored official Mysuru seed state');
  }

  // --- AUTH / USER SESSIONS ---
  static getCurrentUser(): User {
    return getStored<User>(STORAGE_KEYS.CURRENT_USER, DEMO_USERS[0]);
  }

  static setCurrentUser(user: User): void {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
    StorageService.logAudit('User Login / Switch Role', user.role, undefined, undefined, `Switched to user ${user.name} (${user.role})`);
  }

  static getDemoUsers(): User[] {
    return DEMO_USERS;
  }

  // --- COMPLAINTS ---
  static getComplaints(): Complaint[] {
    return getStored<Complaint[]>(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
  }

  static getComplaintById(id: string): Complaint | undefined {
    const all = StorageService.getComplaints();
    return all.find((c) => c.id.toLowerCase() === id.trim().toLowerCase());
  }

  static saveComplaint(complaint: Complaint): void {
    const all = StorageService.getComplaints();
    const existingIndex = all.findIndex((c) => c.id === complaint.id);
    if (existingIndex >= 0) {
      all[existingIndex] = complaint;
    } else {
      all.unshift(complaint);
    }
    setStored(STORAGE_KEYS.COMPLAINTS, all);

    // Create notification for citizen
    StorageService.addNotification({
      userId: complaint.citizenId,
      complaintId: complaint.id,
      title: `Complaint ${complaint.id} Logged`,
      message: `Your complaint for ${complaint.category} has been routed to ${complaint.routingDecision.authority}.`,
      type: 'info',
    });

    // Auto-dispatch SMS notification to citizen's mobile number with tracking link
    StorageService.dispatchComplaintSms(complaint);

    StorageService.logAudit('Complaint Created / Routed', 'CITIZEN', complaint.id, undefined, `Routed to ${complaint.routingDecision.department}`);
  }

  static updateComplaintStatus(
    complaintId: string,
    newStatus: ComplaintStatus,
    actorName: string,
    actorRole: UserRole,
    description: string
  ): Complaint | undefined {
    const all = StorageService.getComplaints();
    const target = all.find((c) => c.id === complaintId);
    if (!target) return undefined;

    const oldStatus = target.status;
    target.status = newStatus;
    target.updatedAt = new Date().toISOString();

    target.timeline.push({
      id: `tl-${Date.now()}`,
      status: newStatus,
      timestamp: new Date().toISOString(),
      title: `Status: ${newStatus}`,
      description,
      actor: actorName,
      actorRole,
    });

    setStored(STORAGE_KEYS.COMPLAINTS, all);

    StorageService.addNotification({
      userId: target.citizenId,
      complaintId: target.id,
      title: `Status Updated: ${newStatus}`,
      message: `Complaint ${target.id} changed from ${oldStatus} to ${newStatus}.`,
      type: newStatus === 'Resolved' || newStatus === 'Closed' ? 'success' : 'info',
    });

    StorageService.logAudit('Status Changed', actorRole, target.id, oldStatus, newStatus);
    return target;
  }

  static acknowledgeComplaint(complaintId: string, staffUser: User): Complaint | undefined {
    const all = StorageService.getComplaints();
    const target = all.find((c) => c.id === complaintId);
    if (!target) return undefined;

    target.status = 'Acknowledged';
    target.updatedAt = new Date().toISOString();
    target.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'Acknowledged',
      timestamp: new Date().toISOString(),
      title: 'Acknowledged by Official Staff',
      description: `Official staff ${staffUser.name} acknowledged the grievance at ${staffUser.department || target.routingDecision.department}.`,
      actor: staffUser.name,
      actorRole: 'STAFF',
    });

    setStored(STORAGE_KEYS.COMPLAINTS, all);
    StorageService.logAudit('Complaint Acknowledged', 'STAFF', complaintId, undefined, `Acknowledged by ${staffUser.name}`);
    return target;
  }

  static assignComplaint(complaintId: string, staffUser: User, assigneeName: string): Complaint | undefined {
    const all = StorageService.getComplaints();
    const target = all.find((c) => c.id === complaintId);
    if (!target) return undefined;

    target.status = 'Assigned';
    target.assignedStaffName = assigneeName;
    target.updatedAt = new Date().toISOString();
    target.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'Assigned',
      timestamp: new Date().toISOString(),
      title: 'Assigned to Ward Engineer',
      description: `Assigned to ${assigneeName} for on-site inspection and execution.`,
      actor: staffUser.name,
      actorRole: 'STAFF',
    });

    setStored(STORAGE_KEYS.COMPLAINTS, all);
    StorageService.logAudit('Staff Assigned', 'STAFF', complaintId, undefined, `Assigned to ${assigneeName}`);
    return target;
  }

  static addComplaintNote(complaintId: string, staffUser: User, noteText: string): Complaint | undefined {
    const all = StorageService.getComplaints();
    const target = all.find((c) => c.id === complaintId);
    if (!target) return undefined;

    target.internalNotes.push({
      id: `note-${Date.now()}`,
      author: staffUser.name,
      text: noteText,
      createdAt: new Date().toISOString(),
    });

    setStored(STORAGE_KEYS.COMPLAINTS, all);
    StorageService.logAudit('Internal Note Added', staffUser.role, complaintId, undefined, noteText.slice(0, 40));
    return target;
  }

  static escalateComplaint(
    complaintId: string,
    reason: string,
    forcedLevel?: number,
    actorName: string = 'System Admin',
    actorRole: UserRole = 'ADMIN'
  ): Complaint | undefined {
    const all = StorageService.getComplaints();
    const target = all.find((c) => c.id === complaintId);
    if (!target) return undefined;

    const newLevel = forcedLevel !== undefined ? forcedLevel : Math.min(4, (target.escalationLevel || 0) + 1);
    target.escalationLevel = newLevel;
    target.lastEscalatedAt = new Date().toISOString();
    target.escalationReason = reason;
    target.status = 'Escalated';
    target.updatedAt = new Date().toISOString();

    target.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'Escalated',
      timestamp: new Date().toISOString(),
      title: `Escalated to Level ${newLevel}`,
      description: `SLA breached — automatically escalated according to the configured escalation policy (Level ${newLevel}). Reason: ${reason}`,
      actor: actorName,
      actorRole,
    });

    setStored(STORAGE_KEYS.COMPLAINTS, all);

    StorageService.addNotification({
      userId: target.citizenId,
      complaintId: target.id,
      title: `Escalation Notice: Level ${newLevel}`,
      message: `Your complaint ${target.id} was escalated to Level ${newLevel} (${target.routingDecision.authority}).`,
      type: 'warning',
    });

    StorageService.logAudit('Complaint Escalated', actorRole, complaintId, `Level ${newLevel - 1}`, `Level ${newLevel}: ${reason}`);
    return target;
  }

  static uploadResolutionProof(complaintId: string, proof: ResolutionProof): Complaint | undefined {
    const all = StorageService.getComplaints();
    const target = all.find((c) => c.id === complaintId);
    if (!target) return undefined;

    target.resolutionProof = proof;
    target.status = 'Awaiting Verification';
    target.updatedAt = new Date().toISOString();

    target.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'Resolved',
      timestamp: proof.resolvedAt,
      title: 'Resolution Proof Uploaded',
      description: `Work finished. Note: "${proof.resolutionNote}". Awaiting citizen verification.`,
      actor: proof.resolvedBy,
      actorRole: 'STAFF',
      photoUrl: proof.afterPhotoUrl,
    });

    setStored(STORAGE_KEYS.COMPLAINTS, all);

    StorageService.addNotification({
      userId: target.citizenId,
      complaintId: target.id,
      title: 'Problem Marked Resolved — Please Verify',
      message: `Staff uploaded resolution proof for ${target.id}. Please confirm if the problem is fixed.`,
      type: 'success',
    });

    StorageService.logAudit('Resolution Proof Uploaded', 'STAFF', complaintId, 'In Progress', 'Awaiting Verification');
    return target;
  }

  static verifyCitizenResolution(
    complaintId: string,
    isResolved: boolean,
    feedback: string,
    proofPhoto?: string
  ): Complaint | undefined {
    const all = StorageService.getComplaints();
    const target = all.find((c) => c.id === complaintId);
    if (!target) return undefined;

    target.citizenVerification = {
      verifiedAt: new Date().toISOString(),
      isSatisfied: isResolved,
      feedbackText: feedback,
      proofPhotoUrl: proofPhoto,
    };
    target.updatedAt = new Date().toISOString();

    if (isResolved) {
      target.status = 'Closed';
      target.timeline.push({
        id: `tl-${Date.now()}`,
        status: 'Closed',
        timestamp: new Date().toISOString(),
        title: 'Citizen Confirmed & Closed',
        description: `Citizen verified: "YES, ISSUE RESOLVED". Feedback: "${feedback || 'No remarks'}".`,
        actor: target.citizenName,
        actorRole: 'CITIZEN',
      });
      StorageService.logAudit('Citizen Verified Issue Resolved', 'CITIZEN', complaintId, 'Awaiting Verification', 'Closed');
    } else {
      target.status = 'Reopened';
      target.escalationLevel = Math.max(1, target.escalationLevel + 1);
      target.timeline.push({
        id: `tl-${Date.now()}`,
        status: 'Reopened',
        timestamp: new Date().toISOString(),
        title: 'Citizen Reopened: Issue Still Exists',
        description: `Citizen reported problem persists: "${feedback}". Reopened for mandatory rework.`,
        actor: target.citizenName,
        actorRole: 'CITIZEN',
        photoUrl: proofPhoto,
      });
      StorageService.logAudit('Citizen Reopened Complaint', 'CITIZEN', complaintId, 'Awaiting Verification', 'Reopened');
    }

    setStored(STORAGE_KEYS.COMPLAINTS, all);
    return target;
  }

  static addCommunityConfirmation(complaintId: string, userId: string, isConfirm: boolean): Complaint | undefined {
    const all = StorageService.getComplaints();
    const target = all.find((c) => c.id === complaintId);
    if (!target) return undefined;

    if (!target.confirmedUserIds) target.confirmedUserIds = [];

    const alreadyConfirmed = target.confirmedUserIds.includes(userId);

    if (isConfirm) {
      if (!alreadyConfirmed) {
        target.confirmedUserIds.push(userId);
        target.confirmationsCount = (target.confirmationsCount || 0) + 1;
      }
    } else {
      // "Problem no longer exists"
      if (alreadyConfirmed) {
        target.confirmedUserIds = target.confirmedUserIds.filter((id) => id !== userId);
        target.confirmationsCount = Math.max(0, (target.confirmationsCount || 1) - 1);
      }
    }

    setStored(STORAGE_KEYS.COMPLAINTS, all);
    return target;
  }

  static linkDuplicateComplaint(sourceComplaintId: string, parentComplaintId: string): void {
    const all = StorageService.getComplaints();
    const source = all.find((c) => c.id === sourceComplaintId);
    const parent = all.find((c) => c.id === parentComplaintId);

    if (source && parent) {
      source.duplicateOfId = parent.id;
      source.status = 'Closed';
      source.timeline.push({
        id: `tl-${Date.now()}`,
        status: 'Closed',
        timestamp: new Date().toISOString(),
        title: 'Linked as Duplicate',
        description: `Linked to nearby existing complaint #${parent.id}. Updates will reflect automatically.`,
        actor: 'Citizen Selection',
        actorRole: 'CITIZEN',
      });

      if (!parent.linkedDuplicates) parent.linkedDuplicates = [];
      if (!parent.linkedDuplicates.includes(source.id)) {
        parent.linkedDuplicates.push(source.id);
        parent.confirmationsCount = (parent.confirmationsCount || 0) + 1;
      }

      setStored(STORAGE_KEYS.COMPLAINTS, all);
      StorageService.logAudit('Complaint Linked as Duplicate', 'CITIZEN', sourceComplaintId, undefined, `Linked to ${parentComplaintId}`);
    }
  }

  // --- DYNAMIC JURISDICTION & VERSIONS ---
  static getJurisdictions(): Jurisdiction[] {
    return getStored<Jurisdiction[]>(STORAGE_KEYS.JURISDICTIONS, INITIAL_JURISDICTIONS);
  }

  static getJurisdictionVersions(): JurisdictionVersion[] {
    return getStored<JurisdictionVersion[]>(STORAGE_KEYS.JURISDICTION_VERSIONS, INITIAL_JURISDICTION_VERSIONS);
  }

  static addJurisdictionVersion(newVersion: Omit<JurisdictionVersion, 'id'>): JurisdictionVersion {
    const versions = StorageService.getJurisdictionVersions();

    // Prevent overlapping active versions for the same jurisdiction
    if (newVersion.isActive) {
      versions.forEach((v) => {
        if (v.jurisdictionId === newVersion.jurisdictionId && v.isActive) {
          v.isActive = false;
          v.effectiveEndDate = newVersion.effectiveStartDate; // Set predecessor end date
        }
      });
    }

    const created: JurisdictionVersion = {
      ...newVersion,
      id: `jv-${Date.now()}`,
    };

    versions.push(created);
    setStored(STORAGE_KEYS.JURISDICTION_VERSIONS, versions);

    // Update the parent jurisdiction's active version reference if active
    if (created.isActive) {
      const jurisdictions = StorageService.getJurisdictions();
      const parent = jurisdictions.find((j) => j.id === created.jurisdictionId);
      if (parent) {
        parent.activeVersionId = created.id;
        setStored(STORAGE_KEYS.JURISDICTIONS, jurisdictions);
      }
    }

    StorageService.logAudit(
      'Jurisdiction Version Created',
      'ADMIN',
      undefined,
      undefined,
      `${created.jurisdictionName} v${created.versionNumber} (${created.governingBody})`
    );

    return created;
  }

  // --- SLA CONFIGURATION ---
  static getSlaRules(): SlaRule[] {
    return getStored<SlaRule[]>(STORAGE_KEYS.SLA_RULES, OFFICIAL_SLA_RULES);
  }

  static updateSlaRule(ruleId: string, days: number, isActive: boolean): void {
    const rules = StorageService.getSlaRules();
    const target = rules.find((r) => r.id === ruleId);
    if (target) {
      const oldDays = target.expectedResolutionDays;
      target.expectedResolutionDays = days;
      target.isActive = isActive;
      setStored(STORAGE_KEYS.SLA_RULES, rules);
      StorageService.logAudit('SLA Rule Updated', 'ADMIN', undefined, `${oldDays} days`, `${days} days`);
    }
  }

  // --- ESCALATION POLICIES ---
  static getEscalationPolicies(): EscalationPolicy[] {
    return getStored<EscalationPolicy[]>(STORAGE_KEYS.ESCALATION_POLICIES, OFFICIAL_ESCALATION_POLICIES);
  }

  static updateEscalationPolicy(policyId: string, hours: number, role: string): void {
    const policies = StorageService.getEscalationPolicies();
    const target = policies.find((p) => p.id === policyId);
    if (target) {
      target.thresholdHours = hours;
      target.targetRole = role;
      setStored(STORAGE_KEYS.ESCALATION_POLICIES, policies);
      StorageService.logAudit('Escalation Policy Updated', 'ADMIN', undefined, undefined, `Level ${target.level}: ${hours}h`);
    }
  }

  // --- NOTIFICATIONS ---
  static getNotifications(userId: string): NotificationItem[] {
    const all = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return all.filter((n) => n.userId === userId || n.userId === 'all');
  }

  static addNotification(item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>): void {
    const all = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    all.unshift({
      ...item,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, all);
  }

  static markNotificationAsRead(id: string): void {
    const all = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const target = all.find((n) => n.id === id);
    if (target) {
      target.isRead = true;
      setStored(STORAGE_KEYS.NOTIFICATIONS, all);
    }
  }

  static markAllNotificationsAsRead(userId: string): void {
    const all = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    all.forEach((n) => {
      if (n.userId === userId || n.userId === 'all') n.isRead = true;
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, all);
  }

  // --- SMS MOBILE MESSAGING SYSTEM ---
  static getSmsMessages(): SmsMessage[] {
    return getStored<SmsMessage[]>(STORAGE_KEYS.SMS_LOGS, [
      {
        id: 'sms-seed-1',
        recipientPhone: '+91 98450 12345',
        recipientName: 'Ramesh Gowda',
        complaintId: 'MY-2026-1001',
        senderId: 'GOVT-MYSURU',
        message:
          'Dear Ramesh Gowda, your grievance #MY-2026-1001 for "Pothole / Road Damage" at Kalidasa Road is registered & routed to Mysuru City Corporation (MCC) - Zone 3. Track live: https://nammasethu.karnataka.gov.in/track/MY-2026-1001. 24-hr SLA active. - Namma Sethu',
        trackingUrl: 'https://nammasethu.karnataka.gov.in/track/MY-2026-1001',
        timestamp: '2026-09-17T09:30:00.000Z',
        status: 'DELIVERED',
      },
    ]);
  }

  static dispatchComplaintSms(complaint: Complaint, customText?: string): SmsMessage {
    const all = StorageService.getSmsMessages();
    const phone = complaint.citizenPhone || '+91 98450 12345';
    const trackingUrl = `https://nammasethu.karnataka.gov.in/track/${complaint.id}`;
    const authority = complaint.routingDecision?.authority || 'Mysuru Municipal Authority';

    const messageText =
      customText ||
      `Dear ${complaint.citizenName}, your grievance #${complaint.id} for "${complaint.category}" is registered and routed to ${authority}. Track live at ${trackingUrl}. Expected resolution by ${complaint.expectedResolutionDate || '48 hours'}. 24-hr Routing SLA Active. - Govt of Karnataka (Namma Sethu)`;

    const newSms: SmsMessage = {
      id: `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipientPhone: phone,
      recipientName: complaint.citizenName,
      complaintId: complaint.id,
      senderId: 'GOVT-MYSURU',
      message: messageText,
      trackingUrl,
      timestamp: new Date().toISOString(),
      status: 'DELIVERED',
    };

    all.unshift(newSms);
    setStored(STORAGE_KEYS.SMS_LOGS, all);

    // Global custom event for instant UI banner / alert delivery
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent('namma_sethu_sms_dispatched', {
            detail: newSms,
          })
        );
      } catch (err) {
        console.error('Error dispatching SMS event:', err);
      }
    }

    StorageService.logAudit(
      'SMS Tracking Sent to Citizen',
      'SYSTEM',
      complaint.id,
      undefined,
      `Delivered SMS to ${phone} with tracking link for ${complaint.id}`
    );

    return newSms;
  }

  // --- AUDIT LOGS ---
  static getAuditLogs(): AuditLog[] {
    return getStored<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  static logAudit(
    action: string,
    userRole: UserRole | 'SYSTEM',
    complaintId?: string,
    oldValue?: string,
    newValue?: string,
    user: string = 'Current User'
  ): void {
    const logs = StorageService.getAuditLogs();
    logs.unshift({
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      user,
      userRole,
      action,
      complaintId,
      oldValue,
      newValue,
      details: newValue || action,
    });
    setStored(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 100)); // Cap to 100 most recent
  }

  // --- HOTSPOTS ---
  static getHotspots(): CivicHotspot[] {
    return getStored<CivicHotspot[]>(STORAGE_KEYS.HOTSPOTS, INITIAL_HOTSPOTS);
  }

  // --- OFFICIAL SOURCES & HELPLINES ---
  static getOfficialSources(): OfficialSource[] {
    return OFFICIAL_SOURCES;
  }

  static getHelplines(): HelplineItem[] {
    return OFFICIAL_HELPLINES;
  }
}

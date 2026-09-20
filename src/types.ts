export type UserRole = 'CITIZEN' | 'STAFF' | 'ADMIN';

export type ComplaintStatus =
  | 'Submitted'
  | 'Routed'
  | 'Acknowledged'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Awaiting Verification'
  | 'Closed'
  | 'Reopened'
  | 'SLA Breached'
  | 'Escalated'
  | 'Needs Review';

export type PriorityLevel = 'Normal' | 'Medium' | 'High' | 'Emergency';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  department?: string;
  authority?: string;
  avatar?: string;
  preferredLanguage?: string;
}

export interface JurisdictionVersion {
  id: string;
  jurisdictionId: string;
  jurisdictionName: string;
  versionNumber: number;
  governingBody: string; // e.g., "Mysuru City Corporation" or "Hinkal Gram Panchayat"
  effectiveStartDate: string; // YYYY-MM-DD
  effectiveEndDate: string | null; // null = ongoing
  isActive: boolean;
  notes?: string;
  changeReason?: string;
}

export interface Jurisdiction {
  id: string;
  name: string; // e.g. "Mysuru Urban Zone 1", "Hinkal", "Bogadi", "Nanjangud TMC"
  code: string;
  type: 'City Corporation' | 'Town Municipal Council' | 'Town Panchayat' | 'Gram Panchayat';
  subdivision: string;
  taluk: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  activeVersionId: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  authority: string; // e.g., "Mysuru City Corporation"
  contactPerson: string;
  phone: string;
  email: string;
  responsibilities: string[];
}

export interface ResponsibilityRule {
  id: string;
  category: string;
  subCategory?: string;
  jurisdictionType?: string;
  departmentId: string;
  departmentName: string;
  authorityName: string;
  ruleTitle: string;
  slaDays: number;
  priorityDefault: PriorityLevel;
  isActive: boolean;
}

export interface RoutingDecision {
  complaintId: string;
  routedAt: string;
  complaintLocationName: string;
  lat: number;
  lng: number;
  jurisdictionId: string;
  jurisdictionName: string;
  jurisdictionVersionNumber: number;
  governingBody: string;
  category: string;
  ruleApplied: string;
  department: string;
  authority: string;
  routingDeadline: string; // Submission + 24 hours
  routingSlaStatus: 'Within SLA' | 'SLA Breached';
  explanation: string;
  isManualReviewRequired: boolean;
}

export interface TimelineEvent {
  id: string;
  status: ComplaintStatus | string;
  timestamp: string;
  title: string;
  description: string;
  actor: string;
  actorRole: UserRole | 'SYSTEM';
  photoUrl?: string;
}

export interface ResolutionProof {
  resolvedAt: string;
  resolvedBy: string;
  resolutionNote: string;
  beforePhotoUrl?: string;
  afterPhotoUrl: string;
  locationVerified?: boolean;
}

export interface CitizenVerification {
  verifiedAt: string;
  isSatisfied: boolean;
  feedbackText: string;
  proofPhotoUrl?: string;
}

export interface Complaint {
  id: string; // e.g. "MY-2026-1001"
  title?: string;
  citizenId: string;
  citizenName: string;
  citizenPhone?: string;
  citizenEmail?: string;
  category: string;
  description: string;
  photoUrls: string[];
  videoUrl?: string;
  lat: number;
  lng: number;
  locationName: string;
  address: string;
  landmark?: string;
  status: ComplaintStatus;
  priority: PriorityLevel;
  isEmergencySafetyConcern: boolean;
  isUrgentSafety?: boolean;
  
  // Routing & Responsibility
  routingDecision: RoutingDecision;
  assignedStaffId?: string;
  assignedStaffName?: string;
  
  // Dates & SLA
  createdAt: string;
  updatedAt: string;
  routingDeadline: string; // createdAt + 24h
  expectedResolutionDate: string; // Based on SLA rule
  escalationLevel: number; // 0, 1, 2, 3, 4
  lastEscalatedAt?: string;
  escalationReason?: string;
  
  // Verification & Resolution
  resolutionProof?: ResolutionProof;
  citizenVerification?: CitizenVerification;
  
  // Community Features
  confirmationsCount: number;
  confirmedUserIds: string[];
  duplicateOfId?: string;
  linkedDuplicates: string[]; // List of complaint IDs linked as duplicate
  
  // Notes & History
  timeline: TimelineEvent[];
  internalNotes: { id: string; author: string; text: string; createdAt: string }[];
}

export interface SlaRule {
  id: string;
  category: string;
  authority: string;
  department: string;
  expectedResolutionDays: number;
  workingDaysOnly?: boolean;
  isWorkingDays?: boolean;
  isActive: boolean;
}

export interface EscalationPolicy {
  id: string;
  level: number;
  name: string;
  thresholdHours: number;
  targetRole: string;
  actionSummary?: string;
  actionDescription?: string;
  notificationMessage?: string;
  isActive: boolean;
  isAutomated?: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  complaintId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
}

export interface SmsMessage {
  id: string;
  recipientPhone: string;
  recipientName: string;
  complaintId: string;
  senderId: string;
  message: string;
  trackingUrl: string;
  timestamp: string;
  status: 'DELIVERED' | 'SENT';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: UserRole | 'SYSTEM';
  action: string;
  complaintId?: string;
  oldValue?: string;
  newValue?: string;
  details: string;
}

export interface CivicHotspot {
  id: string;
  locality?: string;
  name?: string;
  category: string;
  lat: number;
  lng: number;
  totalReports?: number;
  complaintCount?: number;
  resolvedCount?: number;
  inProgressCount?: number;
  pendingCount?: number;
  lastReportedDate?: string;
  severity?: 'Moderate' | 'High' | 'Critical';
  reason?: string;
  radiusMeters?: number;
}

export interface OfficialSource {
  id: string;
  name: string;
  url: string;
  dataType?: string;
  lastVerifiedDate: string;
  notes?: string;
  verifiedAgency?: string;
  authority?: string;
  description?: string;
}

export interface HelplineItem {
  id: string;
  title?: string;
  department?: string;
  service?: string;
  number?: string;
  phone?: string;
  availability?: string;
  timings?: string;
  authority?: string;
  purpose?: string;
  type?: 'Emergency' | 'Municipal' | 'Utility' | 'Administrative';
}

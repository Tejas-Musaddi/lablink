export type Role = 'student' | 'faculty' | 'lab_manager' | 'admin';

export type EquipmentCategory =
  | 'GPU & AI Workstations'
  | 'Rapid Prototyping & 3D'
  | 'Robotics & Autonomous Systems'
  | 'Electronics & Embedded Testing'
  | 'Chemical & Spectrometry'
  | 'Biotechnology & Microscopy'
  | 'Mechanical & Materials Testing'
  | 'Optics & Photonics';

export type EquipmentCondition = 'optimal' | 'good' | 'fair' | 'maintenance_required' | 'out_of_service';

export type EquipmentAvailability = 'available' | 'in_use' | 'reserved' | 'under_maintenance';

export interface OperatingHours {
  open: string;  // e.g. "08:00"
  close: string; // e.g. "20:00"
  daysOfWeek: number[]; // [1, 2, 3, 4, 5] (Monday=1, Sunday=0)
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  building: string;
  headOfDepartment: string;
  totalLabs: number;
  color: string;
}

export interface Laboratory {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  roomNumber: string;
  building: string;
  managerId: string;
  capacity: number;
  operatingHours: OperatingHours;
  safetyTier: 1 | 2 | 3; // 1=general, 2=trained, 3=hazardous
  contactEmail: string;
  imageUrl?: string;
}

export interface EquipmentSpec {
  [key: string]: string | number;
}

export interface Equipment {
  id: string;
  name: string;
  code: string; // asset tag, e.g. "EQ-GPU-001"
  categoryId: EquipmentCategory;
  departmentId: string;
  labId: string;
  description: string;
  specs: EquipmentSpec;
  condition: EquipmentCondition;
  availability: EquipmentAvailability;
  prerequisites: string[]; // e.g. ["Laser Safety Certification", "GPU Cluster Intro"]
  qrCodeId: string;
  hourlyOperatingCost?: number;
  replacementCost?: number;
  maxBookingHoursPerSlot: number;
  locationDetails: string;
  serialNumber: string;
  totalHoursLogged: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  equivalentEquipmentIds?: string[];
  svgIconType?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId: string;
  avatarUrl?: string;
  priorUsageHours: number; // for Fairness Index calculation
  completedTrainings: string[];
  activeProjectIds: string[];
}

export type ProjectPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  departmentId: string;
  leadStudentId: string;
  teamMembers: string[];
  facultySupervisorId: string;
  deadline: string; // ISO string
  priority: ProjectPriority;
  status: 'active' | 'completed' | 'on_hold' | 'proposed';
  requiredEquipmentCategories: EquipmentCategory[];
  attachedRequirements: string[];
  createdAt: string;
}

export type BookingStatus =
  | 'pending_approval'
  | 'confirmed'
  | 'rejected'
  | 'in_session'
  | 'completed'
  | 'cancelled'
  | 'waitlisted';

export interface BookingRequest {
  id: string;
  projectId: string;
  userId: string;
  equipmentId: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  purpose: string;
  createdAt: string;
  status: BookingStatus;
  urgencyScore?: number;
  allocatedSlot?: {
    startTime: string;
    endTime: string;
    equipmentId: string;
  };
  rejectionReason?: string;
  facultyComment?: string;
}

export interface Booking {
  id: string;
  requestId: string;
  projectId: string;
  userId: string;
  equipmentId: string;
  labId: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  status: BookingStatus;
  checkedInAt?: string;
  checkedOutAt?: string;
  notes?: string;
  createdAt: string;
}

export interface WaitlistEntry {
  id: string;
  bookingRequestId: string;
  equipmentId: string;
  preferredStartTime: string;
  preferredEndTime: string;
  priorityScore: number;
  queuePosition: number;
  createdAt: string;
  status: 'active' | 'promoted' | 'expired';
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  labId: string;
  title: string;
  description: string;
  scheduledStart: string; // ISO string
  scheduledEnd: string;   // ISO string
  performedBy: string;
  type: 'routine' | 'calibration' | 'repair' | 'firmware';
  status: 'scheduled' | 'in_progress' | 'completed';
  cost?: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'conflict' | 'approval' | 'maintenance' | 'system';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  entityType: 'booking' | 'equipment' | 'project' | 'conflict_resolution' | 'system_reset';
  entityId: string;
  details: string;
}

export interface EngineWeightConfig {
  deadlineUrgency: number;       // default 0.30
  projectPriority: number;       // default 0.20
  waitingTime: number;           // default 0.20
  usageFairness: number;         // default 0.15
  requirementCriticality: number;// default 0.15
}

export interface ScoreBreakdown {
  deadlineUrgency: number;
  projectPriority: number;
  waitingTime: number;
  usageFairness: number;
  requirementCriticality: number;
  totalScore: number;
}

export interface FeasibilityCheckResult {
  feasible: boolean;
  reasons: string[];
}

export interface ExplanationItem {
  requestId: string;
  requestTitle: string;
  userName: string;
  assignedEquipmentId?: string;
  allocatedSlot?: {
    startTime: string;
    endTime: string;
  };
  scoreBreakdown: ScoreBreakdown;
  status: 'allocated' | 'alternative_slot' | 'alternative_equipment' | 'waitlisted' | 'rejected_infeasible';
  explanationText: string;
  appliedConstraints: string[];
  whyAlternativeOffered?: string;
}

export interface AllocationResult {
  conflictId?: string;
  equipmentId: string;
  timestamp: string;
  totalRequests: number;
  allocatedRequests: number;
  shiftedToAlternativeSlots: number;
  shiftedToAlternativeUnits: number;
  waitlistedRequests: number;
  rejectedInfeasibleRequests: number;
  fairnessIndexBefore: number; // 0 to 1 scale (e.g. 0.62)
  fairnessIndexAfter: number;  // 0 to 1 scale (e.g. 0.89)
  explanations: ExplanationItem[];
  feasibleSchedule: {
    requestId: string;
    equipmentId: string;
    startTime: string;
    endTime: string;
    status: BookingStatus;
  }[];
}

export interface ConflictCase {
  id: string;
  title: string;
  equipmentId: string;
  equipmentName: string;
  contendingRequestIds: string[];
  detectedAt: string;
  status: 'detected' | 'analyzed' | 'resolved' | 'pending_faculty_approval';
  targetWindow: {
    startTime: string;
    endTime: string;
  };
  resolution?: AllocationResult;
  isHeroScenario?: boolean;
}

import { z } from 'zod';
import { InitialDataState, getInitialSeedData } from '../data/seedData';

const STORAGE_KEY = 'lablink_state_v1';

// Schemas for critical entities
const RoleSchema = z.enum(['student', 'faculty', 'lab_manager', 'admin']);
const EquipmentConditionSchema = z.enum(['optimal', 'good', 'fair', 'maintenance_required', 'out_of_service']);
const EquipmentAvailabilitySchema = z.enum(['available', 'in_use', 'reserved', 'under_maintenance']);

const DepartmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string(),
  building: z.string(),
  headOfDepartment: z.string(),
  totalLabs: z.number(),
  color: z.string(),
});

const LaboratorySchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  departmentId: z.string(),
  roomNumber: z.string(),
  building: z.string().optional(),
  managerId: z.string(),
  capacity: z.number(),
  operatingHours: z.object({
    open: z.string(),
    close: z.string(),
    daysOfWeek: z.array(z.number()),
  }),
  safetyTier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  contactEmail: z.string(),
  imageUrl: z.string().optional(),
});

const EquipmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  categoryId: z.string(),
  departmentId: z.string(),
  labId: z.string(),
  description: z.string(),
  specs: z.record(z.union([z.string(), z.number()])),
  condition: EquipmentConditionSchema,
  availability: EquipmentAvailabilitySchema,
  prerequisites: z.array(z.string()),
  qrCodeId: z.string(),
  hourlyOperatingCost: z.number().optional(),
  replacementCost: z.number().optional(),
  maxBookingHoursPerSlot: z.number(),
  locationDetails: z.string(),
  serialNumber: z.string(),
  totalHoursLogged: z.number(),
  lastMaintenanceDate: z.string(),
  nextMaintenanceDate: z.string(),
  equivalentEquipmentIds: z.array(z.string()).optional(),
  svgIconType: z.string().optional(),
});

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: RoleSchema,
  departmentId: z.string(),
  avatarUrl: z.string().optional(),
  priorUsageHours: z.number(),
  completedTrainings: z.array(z.string()),
  activeProjectIds: z.array(z.string()),
});

const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  departmentId: z.string(),
  leadStudentId: z.string(),
  teamMembers: z.array(z.string()),
  facultySupervisorId: z.string(),
  deadline: z.string(),
  priority: z.enum(['low', 'normal', 'high', 'critical']),
  status: z.enum(['active', 'completed', 'on_hold', 'proposed']),
  requiredEquipmentCategories: z.array(z.any()),
  attachedRequirements: z.array(z.string()),
  createdAt: z.string(),
});

const BookingStatusSchema = z.enum([
  'pending_approval',
  'confirmed',
  'rejected',
  'in_session',
  'completed',
  'cancelled',
  'waitlisted',
]);

const BookingSchema = z.object({
  id: z.string(),
  requestId: z.string(),
  projectId: z.string(),
  userId: z.string(),
  equipmentId: z.string(),
  labId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  status: BookingStatusSchema,
  checkedInAt: z.string().optional(),
  checkedOutAt: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
});

const BookingRequestSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  userId: z.string(),
  equipmentId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  purpose: z.string(),
  createdAt: z.string(),
  status: BookingStatusSchema,
  urgencyScore: z.number().optional(),
  allocatedSlot: z.object({
    startTime: z.string(),
    endTime: z.string(),
    equipmentId: z.string(),
  }).optional(),
  rejectionReason: z.string().optional(),
  facultyComment: z.string().optional(),
});

const ConflictCaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  equipmentId: z.string(),
  equipmentName: z.string(),
  contendingRequestIds: z.array(z.string()),
  detectedAt: z.string(),
  status: z.enum(['detected', 'analyzed', 'resolved', 'pending_faculty_approval']),
  targetWindow: z.object({
    startTime: z.string(),
    endTime: z.string(),
  }),
  resolution: z.any().optional(),
  isHeroScenario: z.boolean().optional(),
});

const MaintenanceRecordSchema = z.object({
  id: z.string(),
  equipmentId: z.string(),
  labId: z.string(),
  title: z.string(),
  description: z.string(),
  scheduledStart: z.string(),
  scheduledEnd: z.string(),
  performedBy: z.string(),
  type: z.enum(['routine', 'calibration', 'repair', 'firmware']),
  status: z.enum(['scheduled', 'in_progress', 'completed']),
  cost: z.number().optional(),
});

const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['booking', 'conflict', 'approval', 'maintenance', 'system']),
  read: z.boolean(),
  actionUrl: z.string().optional(),
  createdAt: z.string(),
});

const AuditLogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  actorId: z.string(),
  actorName: z.string(),
  actorRole: RoleSchema,
  action: z.string(),
  entityType: z.enum(['booking', 'equipment', 'project', 'conflict_resolution', 'system_reset']),
  entityId: z.string(),
  details: z.string(),
});

const EngineWeightsSchema = z.object({
  deadlineUrgency: z.number(),
  projectPriority: z.number(),
  waitingTime: z.number(),
  usageFairness: z.number(),
  requirementCriticality: z.number(),
});

const StateStorageSchema = z.object({
  departments: z.array(DepartmentSchema),
  laboratories: z.array(LaboratorySchema),
  equipment: z.array(EquipmentSchema),
  users: z.array(UserSchema),
  projects: z.array(ProjectSchema),
  bookings: z.array(BookingSchema),
  bookingRequests: z.array(BookingRequestSchema),
  conflicts: z.array(ConflictCaseSchema),
  maintenanceRecords: z.array(MaintenanceRecordSchema),
  notifications: z.array(NotificationSchema),
  auditLogs: z.array(AuditLogEntrySchema),
  engineWeights: EngineWeightsSchema,
});

export const StorageService = {
  load(): InitialDataState {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return getInitialSeedData();
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = getInitialSeedData();
        this.save(initial);
        return initial;
      }
      const parsed = JSON.parse(raw);
      const validation = StateStorageSchema.safeParse(parsed);
      if (!validation.success) {
        console.warn('Corrupted local storage data detected, falling back to seed data:', validation.error);
        const fresh = getInitialSeedData();
        this.save(fresh);
        return fresh;
      }
      return validation.data as unknown as InitialDataState;
    } catch (err) {
      console.error('Failed to read from localStorage:', err);
      const fresh = getInitialSeedData();
      return fresh;
    }
  },

  save(data: InitialDataState): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch (err) {
      console.error('Failed to write to localStorage:', err);
    }
  },

  reset(): InitialDataState {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
    const fresh = getInitialSeedData();
    this.save(fresh);
    return fresh;
  },
};

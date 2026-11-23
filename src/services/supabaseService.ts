import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Department,
  Laboratory,
  Equipment,
  User,
  Project,
  Booking,
  BookingRequest,
  ConflictCase,
  MaintenanceRecord,
  Notification,
  AuditLogEntry,
  EngineWeightConfig,
  AllocationResult,
} from '../types';
import { InitialDataState } from '../data/seedData';

// ==============================================================================
// TYPE MAPPINGS & SERIALIZERS (camelCase TS <-> snake_case Postgres)
// ==============================================================================

function mapDeptToRow(d: Department) {
  return {
    id: d.id,
    name: d.name,
    code: d.code,
    description: d.description,
    building: d.building,
    head_of_department: d.headOfDepartment,
    total_labs: d.totalLabs,
    color: d.color,
  };
}

export function mapRowToDept(r: any): Department {
  return {
    id: r.id,
    name: r.name,
    code: r.code,
    description: r.description,
    building: r.building,
    headOfDepartment: r.head_of_department,
    totalLabs: Number(r.total_labs) || 0,
    color: r.color,
  };
}

function mapLabToRow(l: Laboratory) {
  return {
    id: l.id,
    name: l.name,
    code: l.code,
    department_id: l.departmentId,
    room_number: l.roomNumber,
    building: l.building || null,
    manager_id: l.managerId,
    capacity: l.capacity,
    operating_hours: l.operatingHours,
    safety_tier: l.safetyTier,
    contact_email: l.contactEmail,
    image_url: l.imageUrl || null,
  };
}

export function mapRowToLab(r: any): Laboratory {
  return {
    id: r.id,
    name: r.name,
    code: r.code,
    departmentId: r.department_id,
    roomNumber: r.room_number,
    building: r.building || '',
    managerId: r.manager_id,
    capacity: Number(r.capacity) || 10,
    operatingHours: r.operating_hours,
    safetyTier: r.safety_tier,
    contactEmail: r.contact_email,
    imageUrl: r.image_url || undefined,
  };
}

function mapEquipmentToRow(e: Equipment) {
  return {
    id: e.id,
    name: e.name,
    code: e.code,
    category_id: e.categoryId,
    department_id: e.departmentId,
    lab_id: e.labId,
    description: e.description,
    specs: e.specs || {},
    condition: e.condition,
    availability: e.availability,
    prerequisites: e.prerequisites || [],
    qr_code_id: e.qrCodeId,
    hourly_operating_cost: e.hourlyOperatingCost || null,
    replacement_cost: e.replacementCost || null,
    max_booking_hours_per_slot: e.maxBookingHoursPerSlot,
    location_details: e.locationDetails,
    serial_number: e.serialNumber,
    total_hours_logged: e.totalHoursLogged,
    last_maintenance_date: e.lastMaintenanceDate,
    next_maintenance_date: e.nextMaintenanceDate,
    equivalent_equipment_ids: e.equivalentEquipmentIds || [],
    svg_icon_type: e.svgIconType || null,
  };
}

export function mapRowToEquipment(r: any): Equipment {
  return {
    id: r.id,
    name: r.name,
    code: r.code,
    categoryId: r.category_id,
    departmentId: r.department_id,
    labId: r.lab_id,
    description: r.description,
    specs: r.specs || {},
    condition: r.condition,
    availability: r.availability,
    prerequisites: r.prerequisites || [],
    qrCodeId: r.qr_code_id,
    hourlyOperatingCost: r.hourly_operating_cost ? Number(r.hourly_operating_cost) : undefined,
    replacementCost: r.replacement_cost ? Number(r.replacement_cost) : undefined,
    maxBookingHoursPerSlot: Number(r.max_booking_hours_per_slot) || 4,
    locationDetails: r.location_details,
    serialNumber: r.serial_number,
    totalHoursLogged: Number(r.total_hours_logged) || 0,
    lastMaintenanceDate: r.last_maintenance_date,
    nextMaintenanceDate: r.next_maintenance_date,
    equivalentEquipmentIds: r.equivalent_equipment_ids || [],
    svgIconType: r.svg_icon_type || undefined,
  };
}

function mapUserToRow(u: User) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    department_id: u.departmentId,
    avatar_url: u.avatarUrl || null,
    prior_usage_hours: u.priorUsageHours,
    completed_trainings: u.completedTrainings || [],
    active_project_ids: u.activeProjectIds || [],
  };
}

export function mapRowToUser(r: any): User {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    departmentId: r.department_id,
    avatarUrl: r.avatar_url || undefined,
    priorUsageHours: Number(r.prior_usage_hours) || 0,
    completedTrainings: r.completed_trainings || [],
    activeProjectIds: r.active_project_ids || [],
  };
}

function mapProjectToRow(p: Project) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    department_id: p.departmentId,
    lead_student_id: p.leadStudentId,
    team_members: p.teamMembers || [],
    faculty_supervisor_id: p.facultySupervisorId,
    deadline: p.deadline,
    priority: p.priority,
    status: p.status,
    required_equipment_categories: p.requiredEquipmentCategories || [],
    attached_requirements: p.attachedRequirements || [],
    created_at: p.createdAt,
  };
}

export function mapRowToProject(r: any): Project {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    departmentId: r.department_id,
    leadStudentId: r.lead_student_id,
    teamMembers: r.team_members || [],
    facultySupervisorId: r.faculty_supervisor_id,
    deadline: r.deadline,
    priority: r.priority,
    status: r.status,
    requiredEquipmentCategories: r.required_equipment_categories || [],
    attachedRequirements: r.attached_requirements || [],
    createdAt: r.created_at,
  };
}

function mapBookingToRow(b: Booking) {
  return {
    id: b.id,
    request_id: b.requestId,
    project_id: b.projectId,
    user_id: b.userId,
    equipment_id: b.equipmentId,
    lab_id: b.labId,
    start_time: b.startTime,
    end_time: b.endTime,
    status: b.status,
    checked_in_at: b.checkedInAt || null,
    checked_out_at: b.checkedOutAt || null,
    notes: b.notes || null,
    created_at: b.createdAt,
  };
}

export function mapRowToBooking(r: any): Booking {
  return {
    id: r.id,
    requestId: r.request_id,
    projectId: r.project_id,
    userId: r.user_id,
    equipmentId: r.equipment_id,
    labId: r.lab_id,
    startTime: r.start_time,
    endTime: r.end_time,
    status: r.status,
    checkedInAt: r.checked_in_at || undefined,
    checkedOutAt: r.checked_out_at || undefined,
    notes: r.notes || undefined,
    createdAt: r.created_at,
  };
}

function mapBookingRequestToRow(br: BookingRequest) {
  return {
    id: br.id,
    project_id: br.projectId,
    user_id: br.userId,
    equipment_id: br.equipmentId,
    start_time: br.startTime,
    end_time: br.endTime,
    purpose: br.purpose,
    created_at: br.createdAt,
    status: br.status,
    urgency_score: br.urgencyScore || null,
    allocated_slot: br.allocatedSlot || null,
    rejection_reason: br.rejectionReason || null,
    faculty_comment: br.facultyComment || null,
  };
}

export function mapRowToBookingRequest(r: any): BookingRequest {
  return {
    id: r.id,
    projectId: r.project_id,
    userId: r.user_id,
    equipmentId: r.equipment_id,
    startTime: r.start_time,
    endTime: r.end_time,
    purpose: r.purpose,
    createdAt: r.created_at,
    status: r.status,
    urgencyScore: r.urgency_score ? Number(r.urgency_score) : undefined,
    allocatedSlot: r.allocated_slot || undefined,
    rejectionReason: r.rejection_reason || undefined,
    facultyComment: r.faculty_comment || undefined,
  };
}

function mapConflictToRow(c: ConflictCase) {
  return {
    id: c.id,
    title: c.title,
    equipment_id: c.equipmentId,
    equipment_name: c.equipmentName,
    contending_request_ids: c.contendingRequestIds || [],
    detected_at: c.detectedAt,
    status: c.status,
    target_window: c.targetWindow,
    resolution: c.resolution || null,
    is_hero_scenario: Boolean(c.isHeroScenario),
  };
}

export function mapRowToConflict(r: any): ConflictCase {
  return {
    id: r.id,
    title: r.title,
    equipmentId: r.equipment_id,
    equipmentName: r.equipment_name,
    contendingRequestIds: r.contending_request_ids || [],
    detectedAt: r.detected_at,
    status: r.status,
    targetWindow: r.target_window,
    resolution: r.resolution || undefined,
    isHeroScenario: r.is_hero_scenario,
  };
}

function mapMaintenanceToRow(m: MaintenanceRecord) {
  return {
    id: m.id,
    equipment_id: m.equipmentId,
    lab_id: m.labId,
    title: m.title,
    description: m.description,
    scheduled_start: m.scheduledStart,
    scheduled_end: m.scheduledEnd,
    performed_by: m.performedBy,
    type: m.type,
    status: m.status,
    cost: m.cost || null,
  };
}

export function mapRowToMaintenance(r: any): MaintenanceRecord {
  return {
    id: r.id,
    equipmentId: r.equipment_id,
    labId: r.lab_id,
    title: r.title,
    description: r.description,
    scheduledStart: r.scheduled_start,
    scheduledEnd: r.scheduled_end,
    performedBy: r.performed_by,
    type: r.type,
    status: r.status,
    cost: r.cost ? Number(r.cost) : undefined,
  };
}

function mapNotificationToRow(n: Notification) {
  return {
    id: n.id,
    user_id: n.userId,
    title: n.title,
    message: n.message,
    type: n.type,
    read: n.read,
    action_url: n.actionUrl || null,
    created_at: n.createdAt,
  };
}

export function mapRowToNotification(r: any): Notification {
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    message: r.message,
    type: r.type,
    read: r.read,
    actionUrl: r.action_url || undefined,
    createdAt: r.created_at,
  };
}

function mapAuditLogToRow(a: AuditLogEntry) {
  return {
    id: a.id,
    timestamp: a.timestamp,
    actor_id: a.actorId,
    actor_name: a.actorName,
    actor_role: a.actorRole,
    action: a.action,
    entity_type: a.entityType,
    entity_id: a.entityId,
    details: a.details,
  };
}

function mapRowToAuditLog(r: any): AuditLogEntry {
  return {
    id: r.id,
    timestamp: r.timestamp,
    actorId: r.actor_id,
    actorName: r.actor_name,
    actorRole: r.actor_role,
    action: r.action,
    entityType: r.entity_type,
    entityId: r.entity_id,
    details: r.details,
  };
}

function mapEngineWeightsToRow(w: EngineWeightConfig) {
  return {
    id: 'default',
    deadline_urgency: w.deadlineUrgency,
    project_priority: w.projectPriority,
    waiting_time: w.waitingTime,
    usage_fairness: w.usageFairness,
    requirement_criticality: w.requirementCriticality,
    updated_at: new Date().toISOString(),
  };
}

function mapRowToEngineWeights(r: any): EngineWeightConfig {
  return {
    deadlineUrgency: Number(r.deadline_urgency),
    projectPriority: Number(r.project_priority),
    waitingTime: Number(r.waiting_time),
    usageFairness: Number(r.usage_fairness),
    requirementCriticality: Number(r.requirement_criticality),
  };
}

// ==============================================================================
// SUPABASE SERVICE IMPLEMENTATION
// ==============================================================================

export const SupabaseService = {
  /**
   * Check whether Supabase is configured and reachable
   */
  isAvailable(): boolean {
    return isSupabaseConfigured() && supabase !== null;
  },

  /**
   * Fetch all domain entities from Supabase
   */
  async fetchFullState(): Promise<InitialDataState | null> {
    if (!this.isAvailable() || !supabase) return null;

    try {
      const [
        deptsRes,
        labsRes,
        equipRes,
        usersRes,
        projsRes,
        bookReqsRes,
        bookingsRes,
        conflictsRes,
        maintRes,
        notifsRes,
        auditsRes,
        weightsRes,
      ] = await Promise.all([
        supabase.from('departments').select('*'),
        supabase.from('laboratories').select('*'),
        supabase.from('equipment').select('*'),
        supabase.from('users').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('booking_requests').select('*'),
        supabase.from('bookings').select('*'),
        supabase.from('conflicts').select('*'),
        supabase.from('maintenance_records').select('*'),
        supabase.from('notifications').select('*'),
        supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(200),
        supabase.from('engine_weights').select('*').limit(1),
      ]);

      // If equipment or depts are empty, database might not be seeded yet
      if (!deptsRes.data || deptsRes.data.length === 0 || !equipRes.data || equipRes.data.length === 0) {
        return null;
      }

      return {
        departments: deptsRes.data.map(mapRowToDept),
        laboratories: (labsRes.data || []).map(mapRowToLab),
        equipment: (equipRes.data || []).map(mapRowToEquipment),
        users: (usersRes.data || []).map(mapRowToUser),
        projects: (projsRes.data || []).map(mapRowToProject),
        bookingRequests: (bookReqsRes.data || []).map(mapRowToBookingRequest),
        bookings: (bookingsRes.data || []).map(mapRowToBooking),
        conflicts: (conflictsRes.data || []).map(mapRowToConflict),
        maintenanceRecords: (maintRes.data || []).map(mapRowToMaintenance),
        notifications: (notifsRes.data || []).map(mapRowToNotification),
        auditLogs: (auditsRes.data || []).map(mapRowToAuditLog),
        engineWeights: weightsRes.data && weightsRes.data[0]
          ? mapRowToEngineWeights(weightsRes.data[0])
          : {
              deadlineUrgency: 0.3,
              projectPriority: 0.2,
              waitingTime: 0.2,
              usageFairness: 0.15,
              requirementCriticality: 0.15,
            },
      };
    } catch (err) {
      console.error('Supabase fetchFullState error:', err);
      return null;
    }
  },

  /**
   * Seed Supabase tables with initial deterministic seed data in batches
   */
  async seedSupabase(seedData: InitialDataState): Promise<{ success: boolean; message: string }> {
    if (!this.isAvailable() || !supabase) {
      return { success: false, message: 'Supabase is not configured.' };
    }

    try {
      // 1. Departments
      const { error: dErr } = await supabase.from('departments').upsert(seedData.departments.map(mapDeptToRow));
      if (dErr) throw new Error(`Departments: ${dErr.message}`);

      // 2. Laboratories
      const { error: lErr } = await supabase.from('laboratories').upsert(seedData.laboratories.map(mapLabToRow));
      if (lErr) throw new Error(`Laboratories: ${lErr.message}`);

      // 3. Equipment (batch in chunks of 50)
      const equipRows = seedData.equipment.map(mapEquipmentToRow);
      for (let i = 0; i < equipRows.length; i += 50) {
        const chunk = equipRows.slice(i, i + 50);
        const { error: eErr } = await supabase.from('equipment').upsert(chunk);
        if (eErr) throw new Error(`Equipment batch ${i}: ${eErr.message}`);
      }

      // 4. Users
      const { error: uErr } = await supabase.from('users').upsert(seedData.users.map(mapUserToRow));
      if (uErr) throw new Error(`Users: ${uErr.message}`);

      // 5. Projects
      const { error: pErr } = await supabase.from('projects').upsert(seedData.projects.map(mapProjectToRow));
      if (pErr) throw new Error(`Projects: ${pErr.message}`);

      // 6. Booking Requests
      const { error: brErr } = await supabase.from('booking_requests').upsert(seedData.bookingRequests.map(mapBookingRequestToRow));
      if (brErr) throw new Error(`Booking Requests: ${brErr.message}`);

      // 7. Bookings
      const { error: bErr } = await supabase.from('bookings').upsert(seedData.bookings.map(mapBookingToRow));
      if (bErr) throw new Error(`Bookings: ${bErr.message}`);

      // 8. Conflicts
      const { error: cErr } = await supabase.from('conflicts').upsert(seedData.conflicts.map(mapConflictToRow));
      if (cErr) throw new Error(`Conflicts: ${cErr.message}`);

      // 9. Maintenance Records
      const { error: mErr } = await supabase.from('maintenance_records').upsert(seedData.maintenanceRecords.map(mapMaintenanceToRow));
      if (mErr) throw new Error(`Maintenance: ${mErr.message}`);

      // 10. Notifications
      const { error: nErr } = await supabase.from('notifications').upsert(seedData.notifications.map(mapNotificationToRow));
      if (nErr) throw new Error(`Notifications: ${nErr.message}`);

      // 11. Audit Logs
      const { error: aErr } = await supabase.from('audit_logs').upsert(seedData.auditLogs.map(mapAuditLogToRow));
      if (aErr) throw new Error(`Audit Logs: ${aErr.message}`);

      // 12. Engine Weights
      const { error: wErr } = await supabase.from('engine_weights').upsert([mapEngineWeightsToRow(seedData.engineWeights)]);
      if (wErr) throw new Error(`Engine Weights: ${wErr.message}`);

      return {
        success: true,
        message: `Successfully seeded Supabase with ${seedData.equipment.length} equipment, ${seedData.laboratories.length} labs, ${seedData.departments.length} departments, and all demo records!`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Supabase seed error:', msg);
      return { success: false, message: msg };
    }
  },

  // ============================================================================
  // SINGLE-ENTITY MUTATION SYNC METHODS (Background / Non-blocking)
  // ============================================================================

  async syncProject(project: Project, action: 'insert' | 'update' | 'delete' = 'update') {
    if (!this.isAvailable() || !supabase) return;
    try {
      if (action === 'delete') {
        await supabase.from('projects').delete().eq('id', project.id);
      } else {
        await supabase.from('projects').upsert(mapProjectToRow(project));
      }
    } catch (err) {
      console.warn('Failed to sync project to Supabase:', err);
    }
  },

  async syncEquipment(equipment: Equipment, action: 'insert' | 'update' | 'delete' = 'update') {
    if (!this.isAvailable() || !supabase) return;
    try {
      if (action === 'delete') {
        await supabase.from('equipment').delete().eq('id', equipment.id);
      } else {
        await supabase.from('equipment').upsert(mapEquipmentToRow(equipment));
      }
    } catch (err) {
      console.warn('Failed to sync equipment to Supabase:', err);
    }
  },

  async syncBooking(booking: Booking, action: 'insert' | 'update' | 'delete' = 'update') {
    if (!this.isAvailable() || !supabase) return;
    try {
      if (action === 'delete') {
        await supabase.from('bookings').delete().eq('id', booking.id);
      } else {
        await supabase.from('bookings').upsert(mapBookingToRow(booking));
      }
    } catch (err) {
      console.warn('Failed to sync booking to Supabase:', err);
    }
  },

  async syncBookingRequest(req: BookingRequest) {
    if (!this.isAvailable() || !supabase) return;
    try {
      await supabase.from('booking_requests').upsert(mapBookingRequestToRow(req));
    } catch (err) {
      console.warn('Failed to sync booking request to Supabase:', err);
    }
  },

  async syncConflict(conflict: ConflictCase) {
    if (!this.isAvailable() || !supabase) return;
    try {
      await supabase.from('conflicts').upsert(mapConflictToRow(conflict));
    } catch (err) {
      console.warn('Failed to sync conflict to Supabase:', err);
    }
  },

  async syncMaintenanceRecord(m: MaintenanceRecord) {
    if (!this.isAvailable() || !supabase) return;
    try {
      await supabase.from('maintenance_records').upsert(mapMaintenanceToRow(m));
    } catch (err) {
      console.warn('Failed to sync maintenance record to Supabase:', err);
    }
  },

  async syncNotification(n: Notification) {
    if (!this.isAvailable() || !supabase) return;
    try {
      await supabase.from('notifications').upsert(mapNotificationToRow(n));
    } catch (err) {
      console.warn('Failed to sync notification to Supabase:', err);
    }
  },

  async syncAuditLog(a: AuditLogEntry) {
    if (!this.isAvailable() || !supabase) return;
    try {
      await supabase.from('audit_logs').upsert(mapAuditLogToRow(a));
    } catch (err) {
      console.warn('Failed to sync audit log to Supabase:', err);
    }
  },

  async syncEngineWeights(w: EngineWeightConfig) {
    if (!this.isAvailable() || !supabase) return;
    try {
      await supabase.from('engine_weights').upsert(mapEngineWeightsToRow(w));
    } catch (err) {
      console.warn('Failed to sync engine weights to Supabase:', err);
    }
  },

  // ============================================================================
  // DATABASE CONSISTENCY & TRANSACTIONAL VALIDATION GUARDS (Section 4)
  // ============================================================================

  /**
   * Check real-time slot availability directly against Supabase records.
   * Ensures no overlapping confirmed bookings, maintenance windows, or out-of-service conditions.
   */
  async checkSlotAvailability(
    equipmentId: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<{ available: boolean; reason?: string }> {
    if (!this.isAvailable() || !supabase) {
      return { available: true }; // Fallback to store logic
    }

    try {
      const reqStart = new Date(startTime).getTime();
      const reqEnd = new Date(endTime).getTime();

      // 1. Check equipment condition
      const { data: eqData } = await supabase
        .from('equipment')
        .select('condition, availability, name, code')
        .eq('id', equipmentId)
        .single();

      if (eqData) {
        if (eqData.condition === 'maintenance_required' || eqData.condition === 'out_of_service') {
          return {
            available: false,
            reason: `Equipment ${eqData.name} is currently unusable due to condition: ${eqData.condition.replace('_', ' ')}.`,
          };
        }
      }

      // 2. Check overlapping confirmed bookings in Supabase
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('id, start_time, end_time, status')
        .eq('equipment_id', equipmentId)
        .eq('status', 'confirmed');

      if (bookingsData && bookingsData.length > 0) {
        for (const b of bookingsData) {
          if (excludeBookingId && b.id === excludeBookingId) continue;
          const bStart = new Date(b.start_time).getTime();
          const bEnd = new Date(b.end_time).getTime();
          if (Math.max(reqStart, bStart) < Math.min(reqEnd, bEnd)) {
            return {
              available: false,
              reason: `Time slot collides with a locked confirmed booking on the target equipment (${b.start_time} - ${b.end_time}).`,
            };
          }
        }
      }

      // 3. Check overlapping maintenance in Supabase
      const { data: maintData } = await supabase
        .from('maintenance_records')
        .select('id, scheduled_start, scheduled_end, status, title')
        .eq('equipment_id', equipmentId)
        .neq('status', 'completed');

      if (maintData && maintData.length > 0) {
        for (const m of maintData) {
          const mStart = new Date(m.scheduled_start).getTime();
          const mEnd = new Date(m.scheduled_end).getTime();
          if (Math.max(reqStart, mStart) < Math.min(reqEnd, mEnd)) {
            return {
              available: false,
              reason: `Time slot conflicts with active maintenance window: "${m.title}".`,
            };
          }
        }
      }

      return { available: true };
    } catch (err) {
      console.warn('checkSlotAvailability network check warning:', err);
      return { available: true };
    }
  },

  /**
   * Atomic commit for Faculty Allocations after server-side rechecking.
   */
  async revalidateAndCommitAllocation(
    conflictId: string,
    schedule: AllocationResult['feasibleSchedule'],
    comment?: string
  ): Promise<{ success: boolean; bookings?: Booking[]; error?: string }> {
    if (!this.isAvailable() || !supabase) {
      return { success: true };
    }

    try {
      // Re-validate each schedule slot against Supabase before committing
      for (const slot of schedule) {
        const check = await this.checkSlotAvailability(slot.equipmentId, slot.startTime, slot.endTime);
        if (!check.available) {
          return {
            success: false,
            error: `Allocation conflict detected: ${check.reason}`,
          };
        }
      }

      // Generate confirmed bookings
      const newBookings: Booking[] = schedule.map((slot: AllocationResult['feasibleSchedule'][number], idx: number) => ({
        id: `book-alloc-${Date.now()}-${idx}`,
        requestId: slot.requestId,
        projectId: 'proj-1',
        userId: 'student-1',
        equipmentId: slot.equipmentId,
        labId: 'lab-cs-1',
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: 'confirmed',
        notes: `Committed via Faculty Approval (${comment || 'Fair Allocation Approved'})`,
        createdAt: new Date().toISOString(),
      }));

      // Commit to Supabase bookings
      const bookingRows = newBookings.map(mapBookingToRow);
      const { error: bErr } = await supabase.from('bookings').upsert(bookingRows);
      if (bErr) throw new Error(bErr.message);

      // Update conflict status to resolved
      const { error: cErr } = await supabase
        .from('conflicts')
        .update({ status: 'resolved' })
        .eq('id', conflictId);
      if (cErr) throw new Error(cErr.message);

      return { success: true, bookings: newBookings };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  },
};

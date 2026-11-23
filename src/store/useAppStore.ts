import { create } from 'zustand';
import {
  Role,
  User,
  Department,
  Laboratory,
  Equipment,
  Project,
  Booking,
  BookingRequest,
  ConflictCase,
  MaintenanceRecord,
  Notification,
  AuditLogEntry,
  EngineWeightConfig,
  AllocationResult,
  WaitlistEntry,
} from '../types';
import { StorageService } from './storage';
import { DEFAULT_ENGINE_WEIGHTS, InitialDataState } from '../data/seedData';
import { SupabaseService } from '../services/supabaseService';
import { RealtimeService } from '../services/realtimeService';

export interface AppState {
  // Role & Demo Identity
  currentRole: Role;
  currentUser: User;
  isDemoMode: boolean;

  // Backend & Persistence State
  backendStatus: 'local' | 'connecting' | 'connected' | 'error';
  backendMessage: string;
  realtimeStatus: 'CONNECTING' | 'SUBSCRIBED' | 'DISCONNECTED';

  // Domain Data
  departments: Department[];
  laboratories: Laboratory[];
  equipment: Equipment[];
  users: User[];
  projects: Project[];
  bookings: Booking[];
  bookingRequests: BookingRequest[];
  conflicts: ConflictCase[];
  maintenanceRecords: MaintenanceRecord[];
  notifications: Notification[];
  auditLogs: AuditLogEntry[];
  waitlist: WaitlistEntry[];
  engineWeights: EngineWeightConfig;

  // Indexed Lookups for O(1) reads
  equipmentMap: Record<string, Equipment>;
  labMap: Record<string, Laboratory>;
  deptMap: Record<string, Department>;
  userMap: Record<string, User>;
  projectMap: Record<string, Project>;

  // Guided Demo Tour State
  guidedTourOpen: boolean;
  guidedTourStep: number;

  // System & Backend Actions
  setRole: (role: Role) => void;
  resetDemoData: () => void;
  setEngineWeights: (weights: EngineWeightConfig) => void;
  initBackendSync: () => Promise<void>;
  seedSupabaseFromLocal: () => Promise<{ success: boolean; message: string }>;
  syncFromSupabase: () => Promise<{ success: boolean; message: string }>;

  // Project Actions
  createProject: (project: Omit<Project, 'id' | 'createdAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Equipment Actions (Lab Manager / Admin guard)
  addEquipment: (eq: Omit<Equipment, 'id'>) => boolean;
  updateEquipment: (id: string, updates: Partial<Equipment>) => boolean;
  deleteEquipment: (id: string) => boolean;

  // Booking Actions
  createBookingRequest: (req: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>) => BookingRequest;
  cancelBooking: (bookingId: string) => boolean;
  rescheduleBooking: (bookingId: string, newStart: string, newEnd: string) => boolean;

  // Faculty Actions (Faculty guard)
  approveAllocation: (conflictId: string, comment?: string) => boolean;
  rejectAllocation: (conflictId: string, reason: string) => boolean;
  modifyAllocation: (conflictId: string, updatedSchedule: AllocationResult['feasibleSchedule'], comment?: string) => boolean;
  setConflictResolution: (conflictId: string, resolution: AllocationResult) => void;

  // Maintenance Actions (Lab Manager / Admin guard)
  createMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id'>) => boolean;
  updateMaintenanceStatus: (recordId: string, status: MaintenanceRecord['status']) => boolean;

  // Notifications & Audit
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addAuditLog: (action: string, entityType: AuditLogEntry['entityType'], entityId: string, details: string) => void;

  // Guided Tour
  openGuidedTour: () => void;
  closeGuidedTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
}

function buildLookups(state: Pick<AppState, 'equipment' | 'laboratories' | 'departments' | 'users' | 'projects'>) {
  const equipmentMap: Record<string, Equipment> = {};
  state.equipment.forEach((e) => (equipmentMap[e.id] = e));

  const labMap: Record<string, Laboratory> = {};
  state.laboratories.forEach((l) => (labMap[l.id] = l));

  const deptMap: Record<string, Department> = {};
  state.departments.forEach((d) => (deptMap[d.id] = d));

  const userMap: Record<string, User> = {};
  state.users.forEach((u) => (userMap[u.id] = u));

  const projectMap: Record<string, Project> = {};
  state.projects.forEach((p) => (projectMap[p.id] = p));

  return { equipmentMap, labMap, deptMap, userMap, projectMap };
}

function selectDefaultUserForRole(role: Role, users: User[]): User {
  switch (role) {
    case 'student':
      return users.find((u) => u.id === 'student-1') || users.find((u) => u.role === 'student')!;
    case 'faculty':
      return users.find((u) => u.id === 'faculty-2') || users.find((u) => u.role === 'faculty')!;
    case 'lab_manager':
      return users.find((u) => u.id === 'mgr-1') || users.find((u) => u.role === 'lab_manager')!;
    case 'admin':
      return users.find((u) => u.id === 'admin-1') || users.find((u) => u.role === 'admin')!;
  }
}

function persistLocal(state: AppState) {
  StorageService.save({
    departments: state.departments,
    laboratories: state.laboratories,
    equipment: state.equipment,
    users: state.users,
    projects: state.projects,
    bookings: state.bookings,
    bookingRequests: state.bookingRequests,
    conflicts: state.conflicts,
    maintenanceRecords: state.maintenanceRecords,
    notifications: state.notifications,
    auditLogs: state.auditLogs,
    engineWeights: state.engineWeights,
  });
}

function attachRealtimeListeners(set: any, get: any) {
  RealtimeService.subscribe({
    onBookingChange: (eventType, booking) => {
      set((s: AppState) => {
        let updated = s.bookings;
        if (eventType === 'INSERT') {
          if (!s.bookings.some((b) => b.id === booking.id)) {
            updated = [booking, ...s.bookings];
          }
        } else if (eventType === 'UPDATE') {
          updated = s.bookings.map((b) => (b.id === booking.id ? booking : b));
        } else if (eventType === 'DELETE') {
          updated = s.bookings.filter((b) => b.id !== booking.id);
        }
        return { bookings: updated };
      });
      persistLocal(get());
    },
    onBookingRequestChange: (eventType, req) => {
      set((s: AppState) => {
        let updated = s.bookingRequests;
        if (eventType === 'INSERT') {
          if (!s.bookingRequests.some((r) => r.id === req.id)) {
            updated = [req, ...s.bookingRequests];
          }
        } else if (eventType === 'UPDATE') {
          updated = s.bookingRequests.map((r) => (r.id === req.id ? req : r));
        } else if (eventType === 'DELETE') {
          updated = s.bookingRequests.filter((r) => r.id !== req.id);
        }
        return { bookingRequests: updated };
      });
      persistLocal(get());
    },
    onEquipmentChange: (eventType, eq) => {
      set((s: AppState) => {
        let updated = s.equipment;
        const newMap = { ...s.equipmentMap };
        if (eventType === 'INSERT') {
          if (!s.equipment.some((e) => e.id === eq.id)) {
            updated = [eq, ...s.equipment];
            newMap[eq.id] = eq;
          }
        } else if (eventType === 'UPDATE') {
          updated = s.equipment.map((e) => (e.id === eq.id ? eq : e));
          newMap[eq.id] = eq;
        } else if (eventType === 'DELETE') {
          updated = s.equipment.filter((e) => e.id !== eq.id);
          delete newMap[eq.id];
        }
        return { equipment: updated, equipmentMap: newMap };
      });
      persistLocal(get());
    },
    onMaintenanceChange: (eventType, maint) => {
      set((s: AppState) => {
        let updated = s.maintenanceRecords;
        if (eventType === 'INSERT') {
          if (!s.maintenanceRecords.some((m) => m.id === maint.id)) {
            updated = [maint, ...s.maintenanceRecords];
          }
        } else if (eventType === 'UPDATE') {
          updated = s.maintenanceRecords.map((m) => (m.id === maint.id ? maint : m));
        } else if (eventType === 'DELETE') {
          updated = s.maintenanceRecords.filter((m) => m.id !== maint.id);
        }
        return { maintenanceRecords: updated };
      });
      persistLocal(get());
    },
    onConflictChange: (eventType, conflict) => {
      set((s: AppState) => {
        let updated = s.conflicts;
        if (eventType === 'INSERT') {
          if (!s.conflicts.some((c) => c.id === conflict.id)) {
            updated = [conflict, ...s.conflicts];
          }
        } else if (eventType === 'UPDATE') {
          updated = s.conflicts.map((c) => (c.id === conflict.id ? conflict : c));
        } else if (eventType === 'DELETE') {
          updated = s.conflicts.filter((c) => c.id !== conflict.id);
        }
        return { conflicts: updated };
      });
      persistLocal(get());
    },
    onNotificationChange: (eventType, notif) => {
      set((s: AppState) => {
        let updated = s.notifications;
        if (eventType === 'INSERT') {
          if (!s.notifications.some((n) => n.id === notif.id)) {
            updated = [notif, ...s.notifications];
          }
        } else if (eventType === 'UPDATE') {
          updated = s.notifications.map((n) => (n.id === notif.id ? notif : n));
        } else if (eventType === 'DELETE') {
          updated = s.notifications.filter((n) => n.id !== notif.id);
        }
        return { notifications: updated };
      });
      persistLocal(get());
    },
    onStatusChange: (status) => {
      set({ realtimeStatus: status });
    },
  });
}

export const useAppStore = create<AppState>((set, get) => {
  const initial = StorageService.load();
  const lookups = buildLookups({
    equipment: initial.equipment,
    laboratories: initial.laboratories,
    departments: initial.departments,
    users: initial.users,
    projects: initial.projects,
  });

  const defaultUser = selectDefaultUserForRole('student', initial.users);

  return {
    currentRole: 'student',
    currentUser: defaultUser,
    isDemoMode: true,

    backendStatus: 'local',
    backendMessage: SupabaseService.isAvailable()
      ? 'Connecting to Supabase PostgreSQL database...'
      : 'Running in LocalStorage mode (deterministic PRNG seed)',
    realtimeStatus: 'DISCONNECTED',

    departments: initial.departments,
    laboratories: initial.laboratories,
    equipment: initial.equipment,
    users: initial.users,
    projects: initial.projects,
    bookings: initial.bookings,
    bookingRequests: initial.bookingRequests,
    conflicts: initial.conflicts,
    maintenanceRecords: initial.maintenanceRecords,
    notifications: initial.notifications,
    auditLogs: initial.auditLogs,
    waitlist: [],
    engineWeights: initial.engineWeights || DEFAULT_ENGINE_WEIGHTS,

    ...lookups,

    guidedTourOpen: false,
    guidedTourStep: 0,

    initBackendSync: async () => {
      if (!SupabaseService.isAvailable()) {
        set({
          backendStatus: 'local',
          backendMessage: 'Supabase URL/Key not configured in env. Operating in offline LocalStorage mode.',
        });
        return;
      }

      set({ backendStatus: 'connecting', backendMessage: 'Connecting to Supabase...' });

      try {
        const remoteState = await SupabaseService.fetchFullState();

        if (remoteState && remoteState.equipment.length > 0) {
          const remoteLookups = buildLookups({
            equipment: remoteState.equipment,
            laboratories: remoteState.laboratories,
            departments: remoteState.departments,
            users: remoteState.users,
            projects: remoteState.projects,
          });

          const currentRole = get().currentRole;
          const userForRole = selectDefaultUserForRole(currentRole, remoteState.users);

          set({
            ...remoteState,
            currentUser: userForRole,
            ...remoteLookups,
            backendStatus: 'connected',
            backendMessage: `Connected to Supabase PostgreSQL (${remoteState.equipment.length} equipment, ${remoteState.laboratories.length} labs)`,
          });

          persistLocal(get());
          attachRealtimeListeners(set, get);
        } else {
          // If remote database exists but has no data, seed it from local seed data
          set({ backendMessage: 'Supabase connected. Database is empty, seeding initial records...' });
          const currentState: InitialDataState = {
            departments: get().departments,
            laboratories: get().laboratories,
            equipment: get().equipment,
            users: get().users,
            projects: get().projects,
            bookings: get().bookings,
            bookingRequests: get().bookingRequests,
            conflicts: get().conflicts,
            maintenanceRecords: get().maintenanceRecords,
            notifications: get().notifications,
            auditLogs: get().auditLogs,
            engineWeights: get().engineWeights,
          };

          const seedResult = await SupabaseService.seedSupabase(currentState);
          if (seedResult.success) {
            set({
              backendStatus: 'connected',
              backendMessage: 'Connected to Supabase (Initial seed data written to cloud database)',
            });
            attachRealtimeListeners(set, get);
          } else {
            set({
              backendStatus: 'connected',
              backendMessage: `Connected to Supabase, but seeding returned: ${seedResult.message}`,
            });
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('initBackendSync failed:', err);
        set({
          backendStatus: 'error',
          backendMessage: `Failed to sync with Supabase: ${msg}. Fallback to LocalStorage active.`,
        });
      }
    },

    seedSupabaseFromLocal: async () => {
      const state = get();
      const payload: InitialDataState = {
        departments: state.departments,
        laboratories: state.laboratories,
        equipment: state.equipment,
        users: state.users,
        projects: state.projects,
        bookings: state.bookings,
        bookingRequests: state.bookingRequests,
        conflicts: state.conflicts,
        maintenanceRecords: state.maintenanceRecords,
        notifications: state.notifications,
        auditLogs: state.auditLogs,
        engineWeights: state.engineWeights,
      };

      set({ backendStatus: 'connecting', backendMessage: 'Writing records to Supabase...' });
      const res = await SupabaseService.seedSupabase(payload);
      if (res.success) {
        set({ backendStatus: 'connected', backendMessage: res.message });
      } else {
        set({ backendStatus: 'error', backendMessage: res.message });
      }
      return res;
    },

    syncFromSupabase: async () => {
      set({ backendStatus: 'connecting', backendMessage: 'Pulling fresh records from Supabase...' });
      const remoteState = await SupabaseService.fetchFullState();
      if (remoteState && remoteState.equipment.length > 0) {
        const remoteLookups = buildLookups({
          equipment: remoteState.equipment,
          laboratories: remoteState.laboratories,
          departments: remoteState.departments,
          users: remoteState.users,
          projects: remoteState.projects,
        });

        const currentRole = get().currentRole;
        const userForRole = selectDefaultUserForRole(currentRole, remoteState.users);

        set({
          ...remoteState,
          currentUser: userForRole,
          ...remoteLookups,
          backendStatus: 'connected',
          backendMessage: `Successfully synchronized from Supabase (${remoteState.equipment.length} equipment, ${remoteState.bookings.length} bookings)`,
        });

        persistLocal(get());
        return { success: true, message: 'Successfully synchronized from Supabase cloud database.' };
      }
      set({ backendStatus: 'error', backendMessage: 'Failed to retrieve records from Supabase or tables are empty.' });
      return { success: false, message: 'Could not fetch data from Supabase. Ensure tables are created and seeded.' };
    },

    setRole: (role: Role) => {
      const state = get();
      const newUser = selectDefaultUserForRole(role, state.users);
      set({ currentRole: role, currentUser: newUser });
    },

    resetDemoData: () => {
      const fresh = StorageService.reset();
      const freshLookups = buildLookups({
        equipment: fresh.equipment,
        laboratories: fresh.laboratories,
        departments: fresh.departments,
        users: fresh.users,
        projects: fresh.projects,
      });
      const freshUser = selectDefaultUserForRole('student', fresh.users);
      set({
        ...fresh,
        currentRole: 'student',
        currentUser: freshUser,
        waitlist: [],
        ...freshLookups,
        guidedTourOpen: false,
        guidedTourStep: 0,
      });

      // Background re-seed Supabase if connected
      if (SupabaseService.isAvailable()) {
        SupabaseService.seedSupabase(fresh).catch(console.error);
      }
    },

    setEngineWeights: (weights: EngineWeightConfig) => {
      set({ engineWeights: weights });
      persistLocal(get());
      SupabaseService.syncEngineWeights(weights).catch(console.error);
    },

    createProject: (projData) => {
      const state = get();
      const newId = `proj-${Date.now()}`;
      const newProj: Project = {
        ...projData,
        id: newId,
        createdAt: new Date().toISOString(),
      };
      const updatedProjects = [newProj, ...state.projects];
      set({
        projects: updatedProjects,
        projectMap: { ...state.projectMap, [newId]: newProj },
      });
      persistLocal(get());
      SupabaseService.syncProject(newProj, 'insert').catch(console.error);
      get().addAuditLog('PROJECT_CREATED', 'project', newId, `Created project "${newProj.title}"`);
      return newProj;
    },

    updateProject: (id, updates) => {
      const state = get();
      const updated = state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
      const updatedObj = updated.find((p) => p.id === id);
      if (!updatedObj) return;
      set({
        projects: updated,
        projectMap: { ...state.projectMap, [id]: updatedObj },
      });
      persistLocal(get());
      SupabaseService.syncProject(updatedObj, 'update').catch(console.error);
      get().addAuditLog('PROJECT_UPDATED', 'project', id, `Updated project "${updatedObj.title}"`);
    },

    deleteProject: (id) => {
      const state = get();
      const target = state.projects.find((p) => p.id === id);
      const updated = state.projects.filter((p) => p.id !== id);
      const newMap = { ...state.projectMap };
      delete newMap[id];
      set({ projects: updated, projectMap: newMap });
      persistLocal(get());
      if (target) {
        SupabaseService.syncProject(target, 'delete').catch(console.error);
      }
      get().addAuditLog('PROJECT_DELETED', 'project', id, `Deleted project id ${id}`);
    },

    addEquipment: (eqData) => {
      const state = get();
      if (state.currentRole !== 'lab_manager' && state.currentRole !== 'admin') {
        console.warn('Unauthorized: Only Lab Managers or Admins can add equipment.');
        return false;
      }
      const newId = `eq-${Date.now()}`;
      const newEq: Equipment = {
        ...eqData,
        id: newId,
      };
      const updatedList = [newEq, ...state.equipment];
      set({
        equipment: updatedList,
        equipmentMap: { ...state.equipmentMap, [newId]: newEq },
      });
      persistLocal(get());
      SupabaseService.syncEquipment(newEq, 'insert').catch(console.error);
      get().addAuditLog('EQUIPMENT_CREATED', 'equipment', newId, `Added equipment unit "${newEq.name}"`);
      return true;
    },

    updateEquipment: (id, updates) => {
      const state = get();
      if (state.currentRole !== 'lab_manager' && state.currentRole !== 'admin') {
        console.warn('Unauthorized: Only Lab Managers or Admins can modify equipment.');
        return false;
      }
      const updated = state.equipment.map((e) => (e.id === id ? { ...e, ...updates } : e));
      const target = updated.find((e) => e.id === id);
      if (!target) return false;
      set({
        equipment: updated,
        equipmentMap: { ...state.equipmentMap, [id]: target },
      });
      persistLocal(get());
      SupabaseService.syncEquipment(target, 'update').catch(console.error);
      get().addAuditLog('EQUIPMENT_UPDATED', 'equipment', id, `Updated equipment ${target.name} (${target.code})`);
      return true;
    },

    deleteEquipment: (id) => {
      const state = get();
      if (state.currentRole !== 'admin') {
        console.warn('Unauthorized: Only Admins can delete equipment.');
        return false;
      }
      const target = state.equipment.find((e) => e.id === id);
      const updated = state.equipment.filter((e) => e.id !== id);
      const newMap = { ...state.equipmentMap };
      delete newMap[id];
      set({ equipment: updated, equipmentMap: newMap });
      persistLocal(get());
      if (target) {
        SupabaseService.syncEquipment(target, 'delete').catch(console.error);
      }
      get().addAuditLog('EQUIPMENT_DELETED', 'equipment', id, `Deleted equipment ${id}`);
      return true;
    },

    createBookingRequest: (reqData) => {
      const state = get();
      const newId = `req-${Date.now()}`;
      const newReq: BookingRequest = {
        ...reqData,
        id: newId,
        createdAt: new Date().toISOString(),
        status: 'pending_approval',
      };
      const updatedRequests = [newReq, ...state.bookingRequests];
      set({ bookingRequests: updatedRequests });
      persistLocal(get());
      SupabaseService.syncBookingRequest(newReq).catch(console.error);
      get().addAuditLog('BOOKING_REQUEST_CREATED', 'booking', newId, `Requested slot for ${reqData.equipmentId}`);
      return newReq;
    },

    cancelBooking: (bookingId) => {
      const state = get();
      const target = state.bookings.find((b) => b.id === bookingId);
      if (!target) return false;

      // Update booking status
      const updatedBookings = state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
      );

      // Check if there is an active waitlist entry for this equipment
      const matchingWaitlist = state.waitlist.filter(
        (w) => w.equipmentId === target.equipmentId && w.status === 'active'
      ).sort((a, b) => b.priorityScore - a.priorityScore);

      let updatedWaitlist = state.waitlist;
      let promotedNotif: Notification | null = null;
      let promotedBooking: Booking | null = null;

      if (matchingWaitlist.length > 0) {
        const topCandidate = matchingWaitlist[0];
        updatedWaitlist = state.waitlist.map((w) =>
          w.id === topCandidate.id ? { ...w, status: 'promoted' as const } : w
        );

        // Create new confirmed booking from waitlist promotion
        const newBookingId = `book-promoted-${Date.now()}`;
        promotedBooking = {
          id: newBookingId,
          requestId: topCandidate.bookingRequestId,
          projectId: 'proj-1',
          userId: 'student-2',
          equipmentId: topCandidate.equipmentId,
          labId: target.labId,
          startTime: topCandidate.preferredStartTime,
          endTime: topCandidate.preferredEndTime,
          status: 'confirmed',
          notes: 'Promoted automatically from waitlist after cancellation.',
          createdAt: new Date().toISOString(),
        };
        updatedBookings.push(promotedBooking);

        promotedNotif = {
          id: `notif-${Date.now()}`,
          userId: 'student-2',
          title: 'Slot Available! Waitlist Promotion Successful',
          message: `Your waitlisted slot for ${target.equipmentId} has been confirmed due to a cancellation.`,
          type: 'booking',
          read: false,
          createdAt: new Date().toISOString(),
        };
      }

      set({
        bookings: updatedBookings,
        waitlist: updatedWaitlist,
        notifications: promotedNotif
          ? [promotedNotif, ...state.notifications]
          : state.notifications,
      });

      persistLocal(get());

      // Sync cancellation to Supabase
      SupabaseService.syncBooking({ ...target, status: 'cancelled' }, 'update').catch(console.error);
      if (promotedBooking) {
        SupabaseService.syncBooking(promotedBooking, 'insert').catch(console.error);
      }
      if (promotedNotif) {
        SupabaseService.syncNotification(promotedNotif).catch(console.error);
      }

      get().addAuditLog('BOOKING_CANCELLED', 'booking', bookingId, `Cancelled booking ${bookingId}`);
      return true;
    },

    rescheduleBooking: (bookingId, newStart, newEnd) => {
      const state = get();
      const updated = state.bookings.map((b) =>
        b.id === bookingId ? { ...b, startTime: newStart, endTime: newEnd } : b
      );
      const target = updated.find((b) => b.id === bookingId);
      set({ bookings: updated });
      persistLocal(get());
      if (target) {
        SupabaseService.syncBooking(target, 'update').catch(console.error);
      }
      get().addAuditLog('BOOKING_RESCHEDULED', 'booking', bookingId, `Shifted to ${newStart} - ${newEnd}`);
      return true;
    },

    approveAllocation: (conflictId, comment) => {
      const state = get();
      if (state.currentRole !== 'faculty') {
        console.warn('Unauthorized: Only Faculty can approve allocations.');
        return false;
      }
      const conflict = state.conflicts.find((c) => c.id === conflictId);
      if (!conflict || !conflict.resolution) return false;

      // Commit feasible schedule atomically
      const newBookings: Booking[] = conflict.resolution.feasibleSchedule.map((slot, idx) => ({
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

      // Update conflict status
      const updatedConflicts = state.conflicts.map((c) =>
        c.id === conflictId ? { ...c, status: 'resolved' as const } : c
      );

      // Mark contending requests as confirmed or waitlisted
      const updatedRequests = state.bookingRequests.map((req) => {
        if (conflict.contendingRequestIds.includes(req.id)) {
          const wasScheduled = conflict.resolution?.feasibleSchedule.some(
            (s) => s.requestId === req.id
          );
          return {
            ...req,
            status: wasScheduled ? ('confirmed' as const) : ('waitlisted' as const),
            facultyComment: comment,
          };
        }
        return req;
      });

      // Notify students
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        userId: 'student-1',
        title: 'Allocation Approved by Faculty',
        message: `Your allocation schedule for ${conflict.equipmentName} was approved and committed.`,
        type: 'approval',
        read: false,
        createdAt: new Date().toISOString(),
      };

      set({
        bookings: [...state.bookings, ...newBookings],
        conflicts: updatedConflicts,
        bookingRequests: updatedRequests,
        notifications: [newNotif, ...state.notifications],
      });

      persistLocal(get());

      // Sync committed records to Supabase with revalidation guard
      const resolvedConflict = updatedConflicts.find((c) => c.id === conflictId);
      if (resolvedConflict) {
        SupabaseService.syncConflict(resolvedConflict).catch(console.error);
      }
      SupabaseService.revalidateAndCommitAllocation(
        conflictId,
        conflict.resolution.feasibleSchedule,
        comment
      ).catch(console.error);
      newBookings.forEach((b) => SupabaseService.syncBooking(b, 'insert').catch(console.error));
      SupabaseService.syncNotification(newNotif).catch(console.error);

      get().addAuditLog(
        'ALLOCATION_APPROVED',
        'conflict_resolution',
        conflictId,
        `Faculty ${state.currentUser.name} approved allocation. ${newBookings.length} bookings committed.`
      );
      return true;
    },

    rejectAllocation: (conflictId, reason) => {
      const state = get();
      if (state.currentRole !== 'faculty') return false;
      const updatedConflicts = state.conflicts.map((c) =>
        c.id === conflictId ? { ...c, status: 'detected' as const } : c
      );
      set({ conflicts: updatedConflicts });
      persistLocal(get());
      const updated = updatedConflicts.find((c) => c.id === conflictId);
      if (updated) {
        SupabaseService.syncConflict(updated).catch(console.error);
      }
      get().addAuditLog('ALLOCATION_REJECTED', 'conflict_resolution', conflictId, `Rejected: ${reason}`);
      return true;
    },

    modifyAllocation: (conflictId, updatedSchedule, comment) => {
      const state = get();
      if (state.currentRole !== 'faculty') return false;
      const updatedConflicts = state.conflicts.map((c) => {
        if (c.id === conflictId && c.resolution) {
          return {
            ...c,
            resolution: {
              ...c.resolution,
              feasibleSchedule: updatedSchedule,
            },
          };
        }
        return c;
      });
      set({ conflicts: updatedConflicts });
      persistLocal(get());
      const updated = updatedConflicts.find((c) => c.id === conflictId);
      if (updated) {
        SupabaseService.syncConflict(updated).catch(console.error);
      }
      get().addAuditLog('ALLOCATION_MODIFIED', 'conflict_resolution', conflictId, `Modified schedule slots: ${comment || 'Manual override'}`);
      return true;
    },

    setConflictResolution: (conflictId, resolution) => {
      const state = get();
      const updatedConflicts = state.conflicts.map((c) =>
        c.id === conflictId ? { ...c, resolution, status: 'analyzed' as const } : c
      );
      set({ conflicts: updatedConflicts });
      persistLocal(get());
      const updated = updatedConflicts.find((c) => c.id === conflictId);
      if (updated) {
        SupabaseService.syncConflict(updated).catch(console.error);
      }
      get().addAuditLog('ALLOCATION_ANALYZED', 'conflict_resolution', conflictId, `Generated fair allocation with Jain index ${resolution.fairnessIndexAfter.toFixed(2)}`);
    },

    createMaintenanceRecord: (recData) => {
      const state = get();
      if (state.currentRole !== 'lab_manager' && state.currentRole !== 'admin') return false;
      const newRec: MaintenanceRecord = {
        ...recData,
        id: `maint-${Date.now()}`,
      };
      set({ maintenanceRecords: [newRec, ...state.maintenanceRecords] });
      persistLocal(get());
      SupabaseService.syncMaintenanceRecord(newRec).catch(console.error);
      get().addAuditLog('MAINTENANCE_SCHEDULED', 'equipment', recData.equipmentId, `Scheduled maintenance: ${recData.title}`);
      return true;
    },

    updateMaintenanceStatus: (recordId, status) => {
      const state = get();
      if (state.currentRole !== 'lab_manager' && state.currentRole !== 'admin') return false;
      const updated = state.maintenanceRecords.map((m) =>
        m.id === recordId ? { ...m, status } : m
      );
      const target = updated.find((m) => m.id === recordId);
      set({ maintenanceRecords: updated });
      persistLocal(get());
      if (target) {
        SupabaseService.syncMaintenanceRecord(target).catch(console.error);
      }
      return true;
    },

    markNotificationRead: (id) => {
      const state = get();
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      const target = updated.find((n) => n.id === id);
      set({ notifications: updated });
      persistLocal(get());
      if (target) {
        SupabaseService.syncNotification(target).catch(console.error);
      }
    },

    markAllNotificationsRead: () => {
      set((state) => {
        const updated = state.notifications.map((n) => ({ ...n, read: true }));
        return { notifications: updated };
      });
      persistLocal(get());
    },

    addAuditLog: (action, entityType, entityId, details) => {
      const state = get();
      const newEntry: AuditLogEntry = {
        id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        actorId: state.currentUser.id,
        actorName: state.currentUser.name,
        actorRole: state.currentRole,
        action,
        entityType,
        entityId,
        details,
      };
      set({ auditLogs: [newEntry, ...state.auditLogs] });
      persistLocal(get());
      SupabaseService.syncAuditLog(newEntry).catch(console.error);
    },

    openGuidedTour: () => set({ guidedTourOpen: true, guidedTourStep: 0 }),
    closeGuidedTour: () => set({ guidedTourOpen: false }),
    nextTourStep: () => set((state) => ({ guidedTourStep: state.guidedTourStep + 1 })),
    prevTourStep: () => set((state) => ({ guidedTourStep: Math.max(0, state.guidedTourStep - 1) })),
  };
});

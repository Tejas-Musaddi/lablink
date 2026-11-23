import {
  BookingRequest,
  Equipment,
  Laboratory,
  User,
  Project,
  Booking,
  MaintenanceRecord,
  EngineWeightConfig,
  ScoreBreakdown,
  ExplanationItem,
  AllocationResult,
} from '../types';

export interface EngineInputContext {
  equipmentId: string;
  contendingRequests: BookingRequest[];
  allEquipment: Equipment[];
  laboratories: Laboratory[];
  users: User[];
  projects: Project[];
  existingBookings: Booking[];
  maintenanceRecords: MaintenanceRecord[];
  weights?: EngineWeightConfig;
  referenceTime?: string; // ISO string for evaluation timestamp
}

export interface FeasibilityAssessment {
  requestId: string;
  isFeasible: boolean;
  rejectionReasons: string[];
}

export interface ScoredRequest {
  request: BookingRequest;
  project: Project;
  user: User;
  breakdown: ScoreBreakdown;
}

export interface CandidateSlot {
  startTime: string;
  endTime: string;
  equipmentId: string;
}

export interface ScheduledAssignment {
  requestId: string;
  equipmentId: string;
  slot: CandidateSlot;
  status: 'allocated' | 'alternative_slot' | 'alternative_equipment' | 'waitlisted';
  reason?: string;
}

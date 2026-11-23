import {
  Department,
  Laboratory,
  Equipment,
  User,
  Project,
  Booking,
  BookingRequest,
  MaintenanceRecord,
  ConflictCase,
  Notification,
  AuditLogEntry,
  EngineWeightConfig,
} from '../types';
import { generateAllEquipment } from './equipmentData';
import { generateUsers, generateProjects } from './mockUsersAndProjects';
import { generateBookingsAndConflicts } from './mockBookingsAndConflicts';

export * from './mockUsersAndProjects';
export * from './equipmentData';
export * from './mockBookingsAndConflicts';

export const DEPARTMENTS: Department[] = [
  {
    id: 'dept-cs',
    name: 'Computer Science & AI',
    code: 'CS-AI',
    description: 'Specializes in deep learning, artificial intelligence, distributed systems, and computer vision.',
    building: 'Turing Hall, North Campus',
    headOfDepartment: 'Dr. Evelyn Vasquez',
    totalLabs: 2,
    color: '#2563EB',
  },
  {
    id: 'dept-rob',
    name: 'Robotics & Autonomous Systems',
    code: 'ROB-AUTO',
    description: 'Dedicated to industrial robotics, autonomous aerial vehicles, mobile rovers, and mechatronic design.',
    building: 'Von Neumann Pavilion, West Wing',
    headOfDepartment: 'Prof. Marcus Chen',
    totalLabs: 2,
    color: '#7C3AED',
  },
  {
    id: 'dept-ece',
    name: 'Electrical & Embedded Systems',
    code: 'ECE-EMB',
    description: 'Leading research in RF communications, VLSI design, signal processing, and low-power IoT circuits.',
    building: 'Tesla Complex, Engineering Quad',
    headOfDepartment: 'Dr. Aris Thorne',
    totalLabs: 2,
    color: '#059669',
  },
  {
    id: 'dept-chem',
    name: 'Chemical & Materials Science',
    code: 'CHEM-MAT',
    description: 'Pioneering molecular spectrometry, synthetic polymers, nanostructures, and catalytic reactors.',
    building: 'Curie Science Center',
    headOfDepartment: 'Dr. Rosalind Vance',
    totalLabs: 2,
    color: '#D97706',
  },
  {
    id: 'dept-bio',
    name: 'Biomedical & Biotechnology',
    code: 'BIO-MED',
    description: 'Advanced genomics, cellular confocal microscopy, bio-MEMS devices, and biocompatible tissue scaffolds.',
    building: 'Franklin Biological Wing',
    headOfDepartment: 'Prof. Sanjay Patel',
    totalLabs: 2,
    color: '#DC2626',
  },
  {
    id: 'dept-mech',
    name: 'Mechanical & Aerospace Engineering',
    code: 'MECH-AERO',
    description: 'Precision aerodynamic wind tunnels, structural stress testing, advanced composites, and metal additive manufacturing.',
    building: 'Wright Hall, South Campus',
    headOfDepartment: 'Dr. Katherine Wright',
    totalLabs: 2,
    color: '#0891B2',
  },
];

export const LABORATORIES: Laboratory[] = [
  {
    id: 'lab-cs-1',
    name: 'High-Performance AI & GPU Cluster Lab',
    code: 'HPC-302',
    departmentId: 'dept-cs',
    roomNumber: 'Turing 302',
    building: 'Turing Hall',
    managerId: 'mgr-1',
    capacity: 24,
    operatingHours: { open: '08:00', close: '22:00', daysOfWeek: [1, 2, 3, 4, 5, 6] },
    safetyTier: 1,
    contactEmail: 'hpc-lab@campus.edu',
  },
  {
    id: 'lab-cs-2',
    name: 'HCI & Extended Reality Studio',
    code: 'XR-108',
    departmentId: 'dept-cs',
    roomNumber: 'Turing 108',
    building: 'Turing Hall',
    managerId: 'mgr-1',
    capacity: 16,
    operatingHours: { open: '09:00', close: '20:00', daysOfWeek: [1, 2, 3, 4, 5] },
    safetyTier: 1,
    contactEmail: 'xr-studio@campus.edu',
  },
  {
    id: 'lab-rob-1',
    name: 'Autonomous Systems & Drone Flight Arena',
    code: 'AERO-ARENA',
    departmentId: 'dept-rob',
    roomNumber: 'Von Neumann Arena A',
    building: 'Von Neumann Pavilion',
    managerId: 'mgr-2',
    capacity: 20,
    operatingHours: { open: '08:30', close: '21:00', daysOfWeek: [1, 2, 3, 4, 5, 6] },
    safetyTier: 2,
    contactEmail: 'arena@campus.edu',
  },
  {
    id: 'lab-rob-2',
    name: 'Precision Bionics & Actuator Workshop',
    code: 'BIONIC-214',
    departmentId: 'dept-rob',
    roomNumber: 'Von Neumann 214',
    building: 'Von Neumann Pavilion',
    managerId: 'mgr-2',
    capacity: 18,
    operatingHours: { open: '08:00', close: '19:00', daysOfWeek: [1, 2, 3, 4, 5] },
    safetyTier: 2,
    contactEmail: 'bionics@campus.edu',
  },
  {
    id: 'lab-ece-1',
    name: 'VLSI & Microelectronics Fabrication Testbench',
    code: 'VLSI-401',
    departmentId: 'dept-ece',
    roomNumber: 'Tesla 401',
    building: 'Tesla Complex',
    managerId: 'mgr-3',
    capacity: 15,
    operatingHours: { open: '08:00', close: '20:00', daysOfWeek: [1, 2, 3, 4, 5] },
    safetyTier: 2,
    contactEmail: 'vlsi-lab@campus.edu',
  },
  {
    id: 'lab-ece-2',
    name: 'RF Microwave & Telemetry Facility',
    code: 'RF-505',
    departmentId: 'dept-ece',
    roomNumber: 'Tesla 505',
    building: 'Tesla Complex',
    managerId: 'mgr-3',
    capacity: 12,
    operatingHours: { open: '08:30', close: '20:30', daysOfWeek: [1, 2, 3, 4, 5] },
    safetyTier: 2,
    contactEmail: 'rf-telemetry@campus.edu',
  },
  {
    id: 'lab-chem-1',
    name: 'Nanomaterial Spectrometry & Chromatography Lab',
    code: 'SPEC-102',
    departmentId: 'dept-chem',
    roomNumber: 'Curie 102',
    building: 'Curie Science Center',
    managerId: 'mgr-4',
    capacity: 14,
    operatingHours: { open: '08:00', close: '18:30', daysOfWeek: [1, 2, 3, 4, 5] },
    safetyTier: 3,
    contactEmail: 'spectrometry@campus.edu',
  },
  {
    id: 'lab-chem-2',
    name: 'Polymer Synthesis & Materials Chemistry Core',
    code: 'POLY-204',
    departmentId: 'dept-chem',
    roomNumber: 'Curie 204',
    building: 'Curie Science Center',
    managerId: 'mgr-4',
    capacity: 15,
    operatingHours: { open: '08:30', close: '18:00', daysOfWeek: [1, 2, 3, 4, 5] },
    safetyTier: 3,
    contactEmail: 'poly-core@campus.edu',
  },
  {
    id: 'lab-bio-1',
    name: 'Cellular Confocal Microscopy & Imaging Suite',
    code: 'CONF-310',
    departmentId: 'dept-bio',
    roomNumber: 'Franklin 310',
    building: 'Franklin Biological Wing',
    managerId: 'mgr-4',
    capacity: 10,
    operatingHours: { open: '08:00', close: '20:00', daysOfWeek: [1, 2, 3, 4, 5, 6] },
    safetyTier: 2,
    contactEmail: 'confocal-suite@campus.edu',
  },
  {
    id: 'lab-bio-2',
    name: 'Genomic Sequencing & Bio-MEMS Cleanroom',
    code: 'GEN-220',
    departmentId: 'dept-bio',
    roomNumber: 'Franklin 220',
    building: 'Franklin Biological Wing',
    managerId: 'mgr-4',
    capacity: 8,
    operatingHours: { open: '08:00', close: '19:00', daysOfWeek: [1, 2, 3, 4, 5] },
    safetyTier: 3,
    contactEmail: 'genomics@campus.edu',
  },
  {
    id: 'lab-mech-1',
    name: 'Aerodynamic Wind Tunnel & Fluid Dynamics Facility',
    code: 'WIND-100',
    departmentId: 'dept-mech',
    roomNumber: 'Wright Ground 100',
    building: 'Wright Hall',
    managerId: 'mgr-2',
    capacity: 25,
    operatingHours: { open: '08:00', close: '21:00', daysOfWeek: [1, 2, 3, 4, 5] },
    safetyTier: 2,
    contactEmail: 'windtunnel@campus.edu',
  },
  {
    id: 'lab-mech-2',
    name: 'Additive Metal Manufacturing & Stress Testing Lab',
    code: 'STRESS-205',
    departmentId: 'dept-mech',
    roomNumber: 'Wright 205',
    building: 'Wright Hall',
    managerId: 'mgr-2',
    capacity: 16,
    operatingHours: { open: '08:30', close: '19:30', daysOfWeek: [1, 2, 3, 4, 5] },
    safetyTier: 2,
    contactEmail: 'metal-stress@campus.edu',
  },
];

export const DEFAULT_ENGINE_WEIGHTS: EngineWeightConfig = {
  deadlineUrgency: 0.30,
  projectPriority: 0.20,
  waitingTime: 0.20,
  usageFairness: 0.15,
  requirementCriticality: 0.15,
};

export interface InitialDataState {
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
  engineWeights: EngineWeightConfig;
}

export function getInitialSeedData(): InitialDataState {
  const equipment = generateAllEquipment();
  const users = generateUsers();
  const projects = generateProjects();
  const {
    bookings,
    bookingRequests,
    conflicts,
    maintenanceRecords,
    notifications,
    auditLogs,
  } = generateBookingsAndConflicts();

  return {
    departments: DEPARTMENTS,
    laboratories: LABORATORIES,
    equipment,
    users,
    projects,
    bookings,
    bookingRequests,
    conflicts,
    maintenanceRecords,
    notifications,
    auditLogs,
    engineWeights: DEFAULT_ENGINE_WEIGHTS,
  };
}

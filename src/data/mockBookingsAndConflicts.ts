import {
  Booking,
  BookingRequest,
  MaintenanceRecord,
  ConflictCase,
  Notification,
  AuditLogEntry,
} from '../types';

export function generateBookingsAndConflicts(): {
  bookings: Booking[];
  bookingRequests: BookingRequest[];
  conflicts: ConflictCase[];
  maintenanceRecords: MaintenanceRecord[];
  notifications: Notification[];
  auditLogs: AuditLogEntry[];
} {
  const heroEqId = 'eq-gpu---ai-workstations-001';
  const droneEqId = 'eq-robotics---autonomous-systems-001';
  const confocalEqId = 'eq-biotechnology---microscopy-001';

  // Hero Requests (3 contending for DGX Station on Nov 25, 2026)
  const reqHero1: BookingRequest = {
    id: 'req-hero-1',
    projectId: 'proj-1',
    userId: 'student-1', // Aarav Sharma (Robotics)
    equipmentId: heroEqId,
    startTime: '2026-11-25T14:00:00Z',
    endTime: '2026-11-25T18:00:00Z',
    purpose: 'Urgent final model training: multi-agent reinforcement learning policy for IEEE Student Research Showcase.',
    createdAt: '2026-11-23T08:15:00Z',
    status: 'pending_approval',
    urgencyScore: 92,
  };

  const reqHero2: BookingRequest = {
    id: 'req-hero-2',
    projectId: 'proj-2',
    userId: 'student-2', // Elena Rostova (CS / AI)
    equipmentId: heroEqId,
    startTime: '2026-11-25T15:00:00Z',
    endTime: '2026-11-25T19:00:00Z',
    purpose: 'Fine-tuning 70B vision-language histology foundation model; requires 80GB SXM4 tensor cores for batch size 16.',
    createdAt: '2026-11-23T09:30:00Z',
    status: 'pending_approval',
    urgencyScore: 84,
  };

  const reqHero3: BookingRequest = {
    id: 'req-hero-3',
    projectId: 'proj-3',
    userId: 'student-4', // Mateo Morales (Robotics Bionics)
    equipmentId: heroEqId,
    startTime: '2026-11-25T13:00:00Z',
    endTime: '2026-11-25T17:00:00Z',
    purpose: 'Temporal neural decoder training for EMG myoelectric sensor streaming.',
    createdAt: '2026-11-23T10:00:00Z',
    status: 'pending_approval',
    urgencyScore: 78,
  };

  // Conflict 2 Requests: Drone Kit
  const reqDrone1: BookingRequest = {
    id: 'req-drone-1',
    projectId: 'proj-1',
    userId: 'student-3',
    equipmentId: droneEqId,
    startTime: '2026-11-26T09:00:00Z',
    endTime: '2026-11-26T12:00:00Z',
    purpose: 'Subterranean lidar flight trials in flight arena.',
    createdAt: '2026-11-22T14:00:00Z',
    status: 'pending_approval',
    urgencyScore: 80,
  };

  const reqDrone2: BookingRequest = {
    id: 'req-drone-2',
    projectId: 'proj-4',
    userId: 'student-6',
    equipmentId: droneEqId,
    startTime: '2026-11-26T10:30:00Z',
    endTime: '2026-11-26T13:30:00Z',
    purpose: 'Multispectral farm calibration test flight.',
    createdAt: '2026-11-22T16:20:00Z',
    status: 'pending_approval',
    urgencyScore: 68,
  };

  // Conflict 3 Requests: Confocal Microscope
  const reqConfocal1: BookingRequest = {
    id: 'req-confocal-1',
    projectId: 'proj-6',
    userId: 'student-11',
    equipmentId: confocalEqId,
    startTime: '2026-11-27T10:00:00Z',
    endTime: '2026-11-27T14:00:00Z',
    purpose: 'Live-cell CTC fluorescent imaging before cell viability decay.',
    createdAt: '2026-11-23T07:00:00Z',
    status: 'pending_approval',
    urgencyScore: 88,
  };

  const reqConfocal2: BookingRequest = {
    id: 'req-confocal-2',
    projectId: 'proj-8',
    userId: 'student-16',
    equipmentId: confocalEqId,
    startTime: '2026-11-27T12:00:00Z',
    endTime: '2026-11-27T15:00:00Z',
    purpose: 'Hydrogel polymer porous structure visualization.',
    createdAt: '2026-11-23T11:45:00Z',
    status: 'pending_approval',
    urgencyScore: 65,
  };

  // Other standard booking requests
  const additionalRequests: BookingRequest[] = [
    {
      id: 'req-extra-1',
      projectId: 'proj-5',
      userId: 'student-9',
      equipmentId: 'eq-electronics---embedded-testing-003', // Vector Network Analyzer
      startTime: '2026-11-24T14:00:00Z',
      endTime: '2026-11-24T17:00:00Z',
      purpose: 'S-parameter characterization of 8x8 antenna array.',
      createdAt: '2026-11-22T11:00:00Z',
      status: 'confirmed',
    },
    {
      id: 'req-extra-2',
      projectId: 'proj-9',
      userId: 'student-17',
      equipmentId: 'eq-mechanical---materials-testing-001', // Instron 5969
      startTime: '2026-11-25T09:00:00Z',
      endTime: '2026-11-25T12:00:00Z',
      purpose: 'Static tensile pull to break for Inconel 625 dogbone specimens.',
      createdAt: '2026-11-21T15:00:00Z',
      status: 'confirmed',
    },
  ];

  const bookingRequests: BookingRequest[] = [
    reqHero1,
    reqHero2,
    reqHero3,
    reqDrone1,
    reqDrone2,
    reqConfocal1,
    reqConfocal2,
    ...additionalRequests,
  ];

  // 40 Bookings: historical and upcoming
  const bookings: Booking[] = [
    // Pre-allocated active booking on hero unit earlier in the day
    {
      id: 'book-001',
      requestId: 'req-prev-1',
      projectId: 'proj-2',
      userId: 'student-5',
      equipmentId: heroEqId,
      labId: 'lab-cs-1',
      startTime: '2026-11-25T08:30:00Z',
      endTime: '2026-11-25T12:30:00Z',
      status: 'confirmed',
      notes: 'Transformer quantization validation run.',
      createdAt: '2026-11-20T10:00:00Z',
    },
    {
      id: 'book-002',
      requestId: 'req-extra-1',
      projectId: 'proj-5',
      userId: 'student-9',
      equipmentId: 'eq-electronics---embedded-testing-003',
      labId: 'lab-ece-1',
      startTime: '2026-11-24T14:00:00Z',
      endTime: '2026-11-24T17:00:00Z',
      status: 'confirmed',
      notes: 'Approved by Dr. Aris Thorne',
      createdAt: '2026-11-22T11:00:00Z',
    },
    {
      id: 'book-003',
      requestId: 'req-extra-2',
      projectId: 'proj-9',
      userId: 'student-17',
      equipmentId: 'eq-mechanical---materials-testing-001',
      labId: 'lab-mech-2',
      startTime: '2026-11-25T09:00:00Z',
      endTime: '2026-11-25T12:00:00Z',
      status: 'confirmed',
      notes: 'Approved by Dr. Katherine Wright',
      createdAt: '2026-11-21T15:00:00Z',
    },
  ];

  // Populate remaining historical and scheduled bookings up to 40
  const sampleEquipmentIds = [
    'eq-gpu---ai-workstations-004',
    'eq-gpu---ai-workstations-006',
    'eq-rapid-prototyping---3d-001',
    'eq-rapid-prototyping---3d-004',
    'eq-robotics---autonomous-systems-005',
    'eq-robotics---autonomous-systems-007',
    'eq-electronics---embedded-testing-001',
    'eq-electronics---embedded-testing-005',
    'eq-chemical---spectrometry-001',
    'eq-chemical---spectrometry-002',
    'eq-biotechnology---microscopy-004',
    'eq-biotechnology---microscopy-006',
    'eq-mechanical---materials-testing-002',
    'eq-mechanical---materials-testing-005',
    'eq-optics---photonics-001',
    'eq-optics---photonics-003',
  ];

  for (let i = 4; i <= 40; i++) {
    const eq = sampleEquipmentIds[(i - 4) % sampleEquipmentIds.length];
    const isPast = i <= 24;
    const dayOffset = isPast ? -Math.floor((25 - i) / 2) : Math.floor((i - 24) / 3) + 1;
    const startHour = 9 + ((i * 2) % 8);
    const duration = 2 + (i % 3);
    const dateStr = `2026-11-${String(Math.max(1, 23 + dayOffset)).padStart(2, '0')}`;

    bookings.push({
      id: `book-${String(i).padStart(3, '0')}`,
      requestId: `req-gen-${i}`,
      projectId: `proj-${((i % 15) + 1)}`,
      userId: `student-${((i % 30) + 1)}`,
      equipmentId: eq,
      labId: 'lab-cs-1',
      startTime: `${dateStr}T${String(startHour).padStart(2, '0')}:00:00Z`,
      endTime: `${dateStr}T${String(startHour + duration).padStart(2, '0')}:00:00Z`,
      status: isPast ? 'completed' : 'confirmed',
      checkedInAt: isPast ? `${dateStr}T${String(startHour).padStart(2, '0')}:05:00Z` : undefined,
      checkedOutAt: isPast ? `${dateStr}T${String(startHour + duration).padStart(2, '0')}:00:00Z` : undefined,
      notes: `Standard research slot session #${i}`,
      createdAt: '2026-11-15T12:00:00Z',
    });
  }

  // 3 Realistic Conflict Cases
  const conflicts: ConflictCase[] = [
    {
      id: 'conflict-hero',
      title: 'High-Contention NVIDIA DGX Station A100 Slot Contention',
      equipmentId: heroEqId,
      equipmentName: 'NVIDIA DGX Station A100 (4x 80GB SXM4)',
      contendingRequestIds: ['req-hero-1', 'req-hero-2', 'req-hero-3'],
      detectedAt: '2026-11-23T10:05:00Z',
      status: 'detected',
      targetWindow: {
        startTime: '2026-11-25T13:00:00Z',
        endTime: '2026-11-25T19:00:00Z',
      },
      isHeroScenario: true,
    },
    {
      id: 'conflict-drone',
      title: 'Overlapping Aerial Arena Slot: Drone Swarm vs Agricultural Surveying',
      equipmentId: droneEqId,
      equipmentName: 'DJI Matrice 350 RTK Industrial Drone Kit',
      contendingRequestIds: ['req-drone-1', 'req-drone-2'],
      detectedAt: '2026-11-22T16:30:00Z',
      status: 'detected',
      targetWindow: {
        startTime: '2026-11-26T09:00:00Z',
        endTime: '2026-11-26T13:30:00Z',
      },
      isHeroScenario: false,
    },
    {
      id: 'conflict-confocal',
      title: 'Live Cell Microscopy Laser Chamber Overlap',
      equipmentId: confocalEqId,
      equipmentName: 'Leica TCS SP8 / Stellaris Confocal Laser Scanning Microscope',
      contendingRequestIds: ['req-confocal-1', 'req-confocal-2'],
      detectedAt: '2026-11-23T12:00:00Z',
      status: 'detected',
      targetWindow: {
        startTime: '2026-11-27T10:00:00Z',
        endTime: '2026-11-27T15:00:00Z',
      },
      isHeroScenario: false,
    },
  ];

  // Maintenance Records
  const maintenanceRecords: MaintenanceRecord[] = [
    {
      id: 'maint-001',
      equipmentId: 'eq-gpu---ai-workstations-003',
      labId: 'lab-cs-1',
      title: 'Scheduled Liquid Cooling Flush & Thermal Paste Reapplication',
      description: 'Quarterly preventative service on closed-loop coolant manifolds and firmware microcode updates.',
      scheduledStart: '2026-11-24T08:00:00Z',
      scheduledEnd: '2026-11-24T14:00:00Z',
      performedBy: 'NVIDIA Field Engineer / Dr. Victor Stone',
      type: 'routine',
      status: 'scheduled',
      cost: 450,
    },
    {
      id: 'maint-002',
      equipmentId: 'eq-rapid-prototyping---3d-001',
      labId: 'lab-mech-2',
      title: 'Markforged Metal Sinter Furnace Chamber Calibration',
      description: 'High-temperature pyrometer verification and argon atmosphere purge seal inspection.',
      scheduledStart: '2026-11-26T09:00:00Z',
      scheduledEnd: '2026-11-26T17:00:00Z',
      performedBy: 'Markforged Certified Technician',
      type: 'calibration',
      status: 'scheduled',
      cost: 1200,
    },
    {
      id: 'maint-003',
      equipmentId: 'eq-optics---photonics-003',
      labId: 'lab-ece-2',
      title: 'Ti:Sapphire Laser Cavity Mirror Re-alignment',
      description: 'Femtosecond pulse stability test and beam waist collimation.',
      scheduledStart: '2026-11-21T10:00:00Z',
      scheduledEnd: '2026-11-21T16:00:00Z',
      performedBy: 'Spectra-Physics Laser Specialist',
      type: 'routine',
      status: 'completed',
      cost: 850,
    },
  ];

  // Notifications
  const notifications: Notification[] = [
    {
      id: 'notif-001',
      userId: 'student-1',
      title: 'Scheduling Conflict Detected on NVIDIA DGX Station A100',
      message: 'Your booking request for Nov 25 overlaps with 2 other teams. LabLink Fair Allocation Engine is analyzing priorities.',
      type: 'conflict',
      read: false,
      actionUrl: '/conflicts/conflict-hero',
      createdAt: '2026-11-23T10:06:00Z',
    },
    {
      id: 'notif-002',
      userId: 'faculty-2', // Prof. Marcus Chen
      title: 'Urgent Allocation Recommendation Awaiting Approval',
      message: 'Fair Allocation Engine has scored the DGX Station contention. Review and commit allocation.',
      type: 'approval',
      read: false,
      actionUrl: '/faculty',
      createdAt: '2026-11-23T10:10:00Z',
    },
    {
      id: 'notif-003',
      userId: 'student-1',
      title: 'AI Equipment Match Available',
      message: 'AI analyzed your project "Autonomous Drone Swarm Navigation" and identified 4 recommended pieces of cross-department hardware.',
      type: 'system',
      read: true,
      actionUrl: '/projects/proj-1',
      createdAt: '2026-11-20T14:30:00Z',
    },
    {
      id: 'notif-004',
      userId: 'mgr-1',
      title: 'Maintenance Reminder: Cooling Flush Nov 24',
      message: 'Preventative cooling maintenance on SuperServer Node 02 scheduled for tomorrow at 08:00.',
      type: 'maintenance',
      read: false,
      actionUrl: '/manager',
      createdAt: '2026-11-23T08:00:00Z',
    },
  ];

  // Audit Logs
  const auditLogs: AuditLogEntry[] = [
    {
      id: 'audit-001',
      timestamp: '2026-11-23T10:05:00Z',
      actorId: 'system-engine',
      actorName: 'LabLink Allocation Engine',
      actorRole: 'admin',
      action: 'CONFLICT_DETECTED',
      entityType: 'conflict_resolution',
      entityId: 'conflict-hero',
      details: 'Detected 3 overlapping booking requests on NVIDIA DGX Station A100 between 13:00 and 19:00 UTC.',
    },
    {
      id: 'audit-002',
      timestamp: '2026-11-23T08:15:00Z',
      actorId: 'student-1',
      actorName: 'Aarav Sharma',
      actorRole: 'student',
      action: 'BOOKING_REQUEST_CREATED',
      entityType: 'booking',
      entityId: 'req-hero-1',
      details: 'Requested 4 hours on DGX Station A100 for Project "Autonomous Drone Swarm Navigation".',
    },
    {
      id: 'audit-003',
      timestamp: '2026-11-22T17:00:00Z',
      actorId: 'mgr-1',
      actorName: 'Dr. Victor Stone',
      actorRole: 'lab_manager',
      action: 'EQUIPMENT_CONDITION_UPDATED',
      entityType: 'equipment',
      entityId: heroEqId,
      details: 'Calibrated benchmark verified; condition maintained at "optimal".',
    },
  ];

  return {
    bookings,
    bookingRequests,
    conflicts,
    maintenanceRecords,
    notifications,
    auditLogs,
  };
}

export const APP_NAME = 'LabLink';
export const APP_TAGLINE = 'GenAI-Powered Campus Laboratory Resource-Sharing Platform';

export const ROLE_LABELS = {
  student: 'Student Researcher',
  faculty: 'Faculty Advisor',
  lab_manager: 'Lab Manager',
  admin: 'Campus Administrator',
} as const;

export const ROLE_DESCRIPTIONS = {
  student: 'Browse cross-department apparatus, request slots, get AI matching and transparent allocation.',
  faculty: 'Review priority-weighted student requests, inspect score rationales, and approve schedules.',
  lab_manager: 'Manage physical inventory, calibrate instruments, schedule maintenance & check in/out via QR.',
  admin: 'Configure fairness engine weights, monitor cross-department utilization & inspect audit trails.',
} as const;

export const EQUIPMENT_CATEGORIES = [
  'GPU & AI Workstations',
  'Robotics & Autonomous Systems',
  'Rapid Prototyping & 3D',
  'Electronics & Embedded Testing',
  'Chemical & Spectrometry',
  'Biotechnology & Microscopy',
  'Mechanical & Materials Testing',
  'Optics & Photonics',
] as const;

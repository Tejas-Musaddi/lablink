import { User, Project, ProjectPriority } from '../types';
import { SeededPRNG } from './prng';

export function generateUsers(): User[] {
  const prng = new SeededPRNG(2026);

  const departments = ['dept-cs', 'dept-rob', 'dept-ece', 'dept-chem', 'dept-bio', 'dept-mech'];
  
  const studentNames = [
    'Aarav Sharma', 'Elena Rostova', 'Kavita Patel', 'Mateo Morales', 'Zoe Chen',
    'Liam O\'Connor', 'Fatima Al-Sayed', 'Devon Vance', 'Priya Raman', 'Lucas Silva',
    'Yuki Takahashi', 'Chioma Adebayo', 'Benjamin Hayes', 'Sofia Rossi', 'Rohan Gupta',
    'Chloe Bennett', 'Hassan Mansoor', 'Ingrid Lindholm', 'Alex Rivera', 'Mei-Ling Zhou',
    'Kiran Nair', 'Julian Dubois', 'Tariq Al-Mansoor', 'Ananya Deshmukh', 'Oliver Wright',
    'Siddharth Roy', 'Freja Nielsen', 'Dante Castillo', 'Nisha Sen', 'Gabriel Meyer'
  ];

  const facultyNames = [
    { name: 'Dr. Evelyn Vasquez', dept: 'dept-cs', email: 'e.vasquez@campus.edu' },
    { name: 'Prof. Marcus Chen', dept: 'dept-rob', email: 'm.chen@campus.edu' },
    { name: 'Dr. Aris Thorne', dept: 'dept-ece', email: 'a.thorne@campus.edu' },
    { name: 'Dr. Rosalind Vance', dept: 'dept-chem', email: 'r.vance@campus.edu' },
    { name: 'Prof. Sanjay Patel', dept: 'dept-bio', email: 's.patel@campus.edu' },
    { name: 'Dr. Katherine Wright', dept: 'dept-mech', email: 'k.wright@campus.edu' },
    { name: 'Dr. Henrik Lindberg', dept: 'dept-cs', email: 'h.lindberg@campus.edu' },
    { name: 'Prof. Sarah Jenkins', dept: 'dept-rob', email: 's.jenkins@campus.edu' },
    { name: 'Dr. Kenneth Okafor', dept: 'dept-ece', email: 'k.okafor@campus.edu' },
    { name: 'Dr. Claire Delacroix', dept: 'dept-bio', email: 'c.delacroix@campus.edu' }
  ];

  const labManagerNames = [
    { id: 'mgr-1', name: 'Dr. Victor Stone', dept: 'dept-cs', email: 'v.stone@campus.edu' },
    { id: 'mgr-2', name: 'Eng. Rachel Adams', dept: 'dept-rob', email: 'r.adams@campus.edu' },
    { id: 'mgr-3', name: 'Frank Kowalski', dept: 'dept-ece', email: 'f.kowalski@campus.edu' },
    { id: 'mgr-4', name: 'Dr. Miriam Al-Hassan', dept: 'dept-chem', email: 'm.alhassan@campus.edu' }
  ];

  const adminNames = [
    { id: 'admin-1', name: 'Dean Arthur Pendelton', dept: 'dept-cs', email: 'dean.pendelton@campus.edu' },
    { id: 'admin-2', name: 'Audrey Sinclair (Campus Lab Director)', dept: 'dept-mech', email: 'a.sinclair@campus.edu' }
  ];

  const trainingsPool = [
    'GPU Cluster Access & Fair Use Protocol',
    'CUDA & Linux Environment Training',
    'Aerial Flight Arena Safety Clearance',
    'Collaborative Arm Emergency E-Stop Certified',
    'Class 4 Laser Operation License',
    'Metal Sintering & Furnace Protocols',
    'High-Frequency RF Instrumentation Safety',
    'ESD Safe Workstation Certification',
    'Hazardous Chemicals & Fume Hood Protocol',
    'Gas Chromatography Pressurized Cylinder Handling',
    'BSL-2 Biohazard Containment Training',
    'Confocal Laser & Fluorophore Safety',
    'High-Tension Tensile & Hydraulic Safety',
    'Rotating Machinery & PPE Compliance',
    'Class 3B/4 Laser Eye Protection & Interlock Training',
  ];

  const users: User[] = [];

  // Students (30)
  studentNames.forEach((name, idx) => {
    const id = `student-${idx + 1}`;
    const dept = departments[idx % departments.length];
    // Give hero student (idx 0 Aarav Sharma) realistic prior usage and trainings
    const priorUsage = idx === 0 ? 14 : prng.nextInt(4, 68);
    const trainingsCount = idx === 0 ? 4 : prng.nextInt(2, 5);
    const shuffledTrainings = prng.shuffle(trainingsPool);
    const completedTrainings = [
      'GPU Cluster Access & Fair Use Protocol',
      'CUDA & Linux Environment Training',
      ...shuffledTrainings.slice(0, trainingsCount - 2)
    ];

    users.push({
      id,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}@student.campus.edu`,
      role: 'student',
      departmentId: dept,
      priorUsageHours: priorUsage,
      completedTrainings,
      activeProjectIds: [`proj-${(idx % 15) + 1}`],
    });
  });

  // Faculty (10)
  facultyNames.forEach((f, idx) => {
    users.push({
      id: `faculty-${idx + 1}`,
      name: f.name,
      email: f.email,
      role: 'faculty',
      departmentId: f.dept,
      priorUsageHours: 120,
      completedTrainings: [...trainingsPool],
      activeProjectIds: [`proj-${idx + 1}`, `proj-${((idx + 3) % 15) + 1}`],
    });
  });

  // Lab Managers (4)
  labManagerNames.forEach((mgr) => {
    users.push({
      id: mgr.id,
      name: mgr.name,
      email: mgr.email,
      role: 'lab_manager',
      departmentId: mgr.dept,
      priorUsageHours: 250,
      completedTrainings: [...trainingsPool],
      activeProjectIds: [],
    });
  });

  // Admins (2)
  adminNames.forEach((adm) => {
    users.push({
      id: adm.id,
      name: adm.name,
      email: adm.email,
      role: 'admin',
      departmentId: adm.dept,
      priorUsageHours: 320,
      completedTrainings: [...trainingsPool],
      activeProjectIds: [],
    });
  });

  return users;
}

export function generateProjects(): Project[] {
  return [
    {
      id: 'proj-1',
      title: 'Autonomous Drone Swarm Cooperative Navigation in GPS-Denied Tunnels',
      description: 'Developing decentralized reinforcement learning algorithms for micro-aerial quadcopters navigating subterranean pipelines with onboard LiDAR and visual SLAM.',
      category: 'Robotics & Autonomous Systems',
      departmentId: 'dept-rob',
      leadStudentId: 'student-1', // Aarav Sharma
      teamMembers: ['student-1', 'student-3', 'student-7'],
      facultySupervisorId: 'faculty-2', // Prof. Marcus Chen
      deadline: '2026-11-28T18:00:00Z',
      priority: 'critical',
      status: 'active',
      requiredEquipmentCategories: ['Robotics & Autonomous Systems', 'GPU & AI Workstations'],
      attachedRequirements: ['NVIDIA DGX Station A100 or RTX 4090 Workstation for multi-agent RL simulation', 'LiDAR calibration target'],
      createdAt: '2026-10-01T10:00:00Z',
    },
    {
      id: 'proj-2',
      title: 'Multimodal Vision-Language LLM for Real-Time Pathology Diagnostics',
      description: 'Fine-tuning a 70B parameter open-weight multimodal foundation model on digitized histology gigapixel slides to detect early micro-metastatic tissue patterns.',
      category: 'Artificial Intelligence & Deep Learning',
      departmentId: 'dept-cs',
      leadStudentId: 'student-2', // Elena Rostova
      teamMembers: ['student-2', 'student-5', 'student-12'],
      facultySupervisorId: 'faculty-1', // Dr. Evelyn Vasquez
      deadline: '2026-11-28T14:00:00Z',
      priority: 'high',
      status: 'active',
      requiredEquipmentCategories: ['GPU & AI Workstations', 'Biotechnology & Microscopy'],
      attachedRequirements: ['High-memory GPU workstation (A100/H100) with >= 80GB VRAM for large batch FP8 inference'],
      createdAt: '2026-10-05T09:30:00Z',
    },
    {
      id: 'proj-3',
      title: 'Bionic Myoelectric Upper-Limb Prosthesis with Neural Feedback',
      description: 'Designing an active 6-DOF prosthetic hand with low-latency EMG decoding, sensory haptic vibration array, and continuous carbon-fiber reinforced structure.',
      category: 'Robotics & Autonomous Systems',
      departmentId: 'dept-rob',
      leadStudentId: 'student-4', // Mateo Morales
      teamMembers: ['student-4', 'student-8'],
      facultySupervisorId: 'faculty-2', // Prof. Marcus Chen
      deadline: '2026-11-29T17:00:00Z',
      priority: 'high',
      status: 'active',
      requiredEquipmentCategories: ['GPU & AI Workstations', 'Rapid Prototyping & 3D', 'Electronics & Embedded Testing'],
      attachedRequirements: ['GPU compute cluster for continuous temporal EMG decoding neural network training', 'SLA 3D printer'],
      createdAt: '2026-10-12T11:00:00Z',
    },
    {
      id: 'proj-4',
      title: 'Precision Agricultural Aerial Multispectral Drone Surveying',
      description: 'Autonomous crop vigor and soil moisture mapping using drone-mounted multispectral sensors and automated orthomosaic photogrammetry.',
      category: 'Robotics & Autonomous Systems',
      departmentId: 'dept-rob',
      leadStudentId: 'student-6',
      teamMembers: ['student-6', 'student-10'],
      facultySupervisorId: 'faculty-2',
      deadline: '2026-12-05T12:00:00Z',
      priority: 'normal',
      status: 'active',
      requiredEquipmentCategories: ['Robotics & Autonomous Systems'],
      attachedRequirements: ['DJI Matrice 350 RTK Industrial Drone Kit', 'Von Neumann flight arena'],
      createdAt: '2026-10-18T14:00:00Z',
    },
    {
      id: 'proj-5',
      title: 'Sub-6GHz 5G Beamforming Antenna Array with Phased Microstrips',
      description: 'Fabrication and vector network analyzer validation of an 8x8 patch phased-array antenna for high-density campus wireless transmission.',
      category: 'Electronics & Embedded Testing',
      departmentId: 'dept-ece',
      leadStudentId: 'student-9',
      teamMembers: ['student-9', 'student-13'],
      facultySupervisorId: 'faculty-3',
      deadline: '2026-12-10T16:00:00Z',
      priority: 'normal',
      status: 'active',
      requiredEquipmentCategories: ['Electronics & Embedded Testing', 'Optics & Photonics'],
      attachedRequirements: ['Rohde & Schwarz Vector Network Analyzer (up to 20 GHz)', 'RF Anechoic chamber'],
      createdAt: '2026-10-20T10:00:00Z',
    },
    {
      id: 'proj-6',
      title: 'Microfluidic Droplet Generator for Single-Cell RNA Encapsulation',
      description: 'Soft-lithography fabrication of PDMS microfluidic chips designed to isolate rare circulating tumor cells in peripheral blood samples.',
      category: 'Biotechnology & Microscopy',
      departmentId: 'dept-bio',
      leadStudentId: 'student-11',
      teamMembers: ['student-11', 'student-14'],
      facultySupervisorId: 'faculty-5',
      deadline: '2026-12-02T15:00:00Z',
      priority: 'high',
      status: 'active',
      requiredEquipmentCategories: ['Biotechnology & Microscopy', 'Chemical & Spectrometry'],
      attachedRequirements: ['Leica Stellaris Confocal Laser Scanning Microscope', 'Cleanroom BSL-2 bench'],
      createdAt: '2026-10-22T08:00:00Z',
    },
    {
      id: 'proj-7',
      title: 'Supersonic Boundary Layer Flow Separation Analysis',
      description: 'Experimental schlieren imaging and surface dynamic pressure transducer measurements of transonic airfoil shockwave buffet.',
      category: 'Mechanical & Materials Testing',
      departmentId: 'dept-mech',
      leadStudentId: 'student-15',
      teamMembers: ['student-15', 'student-18'],
      facultySupervisorId: 'faculty-6',
      deadline: '2026-12-15T18:00:00Z',
      priority: 'normal',
      status: 'active',
      requiredEquipmentCategories: ['Mechanical & Materials Testing', 'Optics & Photonics'],
      attachedRequirements: ['Aerodynamic Wind Tunnel & Fluid Dynamics Facility', 'Pulsed laser illumination'],
      createdAt: '2026-10-25T13:00:00Z',
    },
    {
      id: 'proj-8',
      title: 'Biocompatible Hydrogel Scaffolds for Cartilage Regeneration',
      description: 'Synthesis of photo-crosslinkable gelatin methacryloyl (GelMA) hydrogels with tailored stiffness and degradation kinetics.',
      category: 'Chemical & Spectrometry',
      departmentId: 'dept-chem',
      leadStudentId: 'student-16',
      teamMembers: ['student-16', 'student-19'],
      facultySupervisorId: 'faculty-4',
      deadline: '2026-12-08T17:00:00Z',
      priority: 'normal',
      status: 'active',
      requiredEquipmentCategories: ['Chemical & Spectrometry', 'Biotechnology & Microscopy'],
      attachedRequirements: ['Agilent GC/MS or HPLC Liquid Chromatography', 'UV Spectrophotometer'],
      createdAt: '2026-10-28T11:30:00Z',
    },
    {
      id: 'proj-9',
      title: 'Extreme-Temperature Fatigue Life of 3D-Printed Inconel 625',
      description: 'High-cycle tensile and rotational fatigue profiling of laser powder bed fusion superalloy specimens under 650 deg C thermal loads.',
      category: 'Mechanical & Materials Testing',
      departmentId: 'dept-mech',
      leadStudentId: 'student-17',
      teamMembers: ['student-17', 'student-20'],
      facultySupervisorId: 'faculty-6',
      deadline: '2026-12-12T19:00:00Z',
      priority: 'high',
      status: 'active',
      requiredEquipmentCategories: ['Mechanical & Materials Testing', 'Rapid Prototyping & 3D'],
      attachedRequirements: ['Instron 5969 or MTS Landmark Servohydraulic dynamic fatigue station', 'Vickers microhardness tester'],
      createdAt: '2026-11-01T09:00:00Z',
    },
    {
      id: 'proj-10',
      title: 'Quantum Dot Photoluminescence & Femtosecond Transient Absorption',
      description: 'Probing ultrafast charge transfer mechanisms in lead halide perovskite nanocrystals for next-generation tandem solar cells.',
      category: 'Optics & Photonics',
      departmentId: 'dept-ece',
      leadStudentId: 'student-21',
      teamMembers: ['student-21', 'student-24'],
      facultySupervisorId: 'faculty-3',
      deadline: '2026-12-18T16:00:00Z',
      priority: 'normal',
      status: 'active',
      requiredEquipmentCategories: ['Optics & Photonics', 'Chemical & Spectrometry'],
      attachedRequirements: ['Spectra-Physics Mai Tai Femtosecond Laser', 'Thorlabs Optical Table'],
      createdAt: '2026-11-02T14:15:00Z',
    },
    {
      id: 'proj-11',
      title: 'Wearable Biosensors for Continuous Lactate and Glucose Monitoring',
      description: 'Laser-scribed graphene electrochemical electrodes integrated with flexible microfluidic sweat collection channels.',
      category: 'Biotechnology & Microscopy',
      departmentId: 'dept-bio',
      leadStudentId: 'student-22',
      teamMembers: ['student-22', 'student-25'],
      facultySupervisorId: 'faculty-5',
      deadline: '2026-12-20T12:00:00Z',
      priority: 'low',
      status: 'active',
      requiredEquipmentCategories: ['Biotechnology & Microscopy', 'Electronics & Embedded Testing'],
      attachedRequirements: ['Keithley 2450 SourceMeter', 'Biotek Synergy Microplate Reader'],
      createdAt: '2026-11-04T10:45:00Z',
    },
    {
      id: 'proj-12',
      title: 'Reinforcement Learning Locomotion Controller for Quadruped on Ice',
      description: 'Sim-to-real transfer of agile slip-recovery policies deployed on a Boston Dynamics Spot robot in synthetic low-friction conditions.',
      category: 'Robotics & Autonomous Systems',
      departmentId: 'dept-rob',
      leadStudentId: 'student-23',
      teamMembers: ['student-23', 'student-26'],
      facultySupervisorId: 'faculty-2',
      deadline: '2026-12-22T17:30:00Z',
      priority: 'normal',
      status: 'active',
      requiredEquipmentCategories: ['Robotics & Autonomous Systems', 'GPU & AI Workstations'],
      attachedRequirements: ['Boston Dynamics Spot Explorer Quadruped', 'HPC cluster GPU compute'],
      createdAt: '2026-11-06T15:20:00Z',
    },
    {
      id: 'proj-13',
      title: 'Ultra-Low Power Edge TinyML Gesture Recognition Watch',
      description: 'Synthesizing 8-bit quantized temporal convolutional neural nets onto RISC-V microcontrollers with 1mW power budget.',
      category: 'Electronics & Embedded Testing',
      departmentId: 'dept-ece',
      leadStudentId: 'student-27',
      teamMembers: ['student-27', 'student-28'],
      facultySupervisorId: 'faculty-3',
      deadline: '2026-12-24T14:00:00Z',
      priority: 'low',
      status: 'active',
      requiredEquipmentCategories: ['Electronics & Embedded Testing', 'GPU & AI Workstations'],
      attachedRequirements: ['Keysight Infiniium Oscilloscope', 'JBC Soldering Bench'],
      createdAt: '2026-11-08T09:10:00Z',
    },
    {
      id: 'proj-14',
      title: 'Recycled Carbon Fiber Reinforced Thermoplastic Matrix Composites',
      description: 'Mechanical performance benchmarking of reclaimed aerospace carbon fiber prepreg remolded into structural chassis brackets.',
      category: 'Mechanical & Materials Testing',
      departmentId: 'dept-mech',
      leadStudentId: 'student-29',
      teamMembers: ['student-29', 'student-30'],
      facultySupervisorId: 'faculty-6',
      deadline: '2026-12-28T16:00:00Z',
      priority: 'normal',
      status: 'active',
      requiredEquipmentCategories: ['Mechanical & Materials Testing', 'Rapid Prototyping & 3D'],
      attachedRequirements: ['Instron 5969 Universal Testing Machine', 'Markforged Sinter Furnace'],
      createdAt: '2026-11-10T11:00:00Z',
    },
    {
      id: 'proj-15',
      title: 'Photocatalytic Degradation of PFAS Micro-Pollutants in Wastewater',
      description: 'Evaluating bismuth oxyhalide heterojunction photocatalysts under simulated solar irradiation for perfluorinated compound breakdown.',
      category: 'Chemical & Spectrometry',
      departmentId: 'dept-chem',
      leadStudentId: 'student-10',
      teamMembers: ['student-10', 'student-14'],
      facultySupervisorId: 'faculty-4',
      deadline: '2026-12-30T18:00:00Z',
      priority: 'low',
      status: 'active',
      requiredEquipmentCategories: ['Chemical & Spectrometry', 'Optics & Photonics'],
      attachedRequirements: ['Shimadzu UV-Vis Spectrophotometer', 'Newport Solar Simulator Workstation'],
      createdAt: '2026-11-12T13:40:00Z',
    }
  ];
}

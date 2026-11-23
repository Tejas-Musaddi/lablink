import { Equipment, EquipmentCategory } from '../types';

export interface ExtractedRequirement {
  category: EquipmentCategory;
  confidence: number; // 0 to 1
  rationale: string;
  suggestedSpecs: Record<string, string>;
  safetyWarnings: string[];
}

export interface EquipmentMatchResult {
  equipment: Equipment;
  matchScore: number; // 0 to 100
  matchedReasons: string[];
  prerequisiteWarning?: string;
  isAvailable: boolean;
}

/**
 * Domain ontology dictionary mapping keywords and scientific phrases to equipment categories and specs.
 */
const ONTOLOGY_RULES: {
  category: EquipmentCategory;
  keywords: string[];
  specs: Record<string, string>;
  trainings: string[];
}[] = [
  {
    category: 'GPU & AI Workstations',
    keywords: [
      'deep learning', 'transformer', 'llm', 'neural network', 'pytorch', 'cuda',
      'gpu', 'tensor', 'reinforcement learning', 'computer vision', 'vram', 'fp8',
      'foundation model', 'multimodal', 'diffusion', 'slam', 'autonomous drone'
    ],
    specs: { 'VRAM Required': '>= 24GB', 'Compute Arch': 'NVIDIA Ampere / Hopper' },
    trainings: ['GPU Cluster Access & Fair Use Protocol', 'CUDA & Linux Environment Training'],
  },
  {
    category: 'Robotics & Autonomous Systems',
    keywords: [
      'robot', 'quadruped', 'drone', 'uav', 'lidar', 'actuator', 'bionic', 'prosthesis',
      'ros', 'ros 2', 'manipulator', 'flight arena', 'motion capture', 'telemetry',
      'collaborative arm', 'slam', 'obstacle avoidance'
    ],
    specs: { 'Degrees of Freedom': '>= 6-DOF', 'LiDAR Channels': '64 - 128' },
    trainings: ['Aerial Flight Arena Safety Clearance', 'Collaborative Arm Emergency E-Stop Certified'],
  },
  {
    category: 'Rapid Prototyping & 3D',
    keywords: [
      '3d print', 'additive', 'sla', 'fdm', 'laser cutter', 'sintering', 'furnace',
      'inconel', 'carbon fiber', 'resin', 'markforged', 'prototyping', 'chassis'
    ],
    specs: { 'Build Volume': '>= 200mm', 'Material': 'Engineering Polymers or Metal' },
    trainings: ['Class 4 Laser Operation License', 'Metal Sintering & Furnace Protocols'],
  },
  {
    category: 'Electronics & Embedded Testing',
    keywords: [
      'oscilloscope', 'vna', 'vector network', 'rf', 'spectrum', 'antenna', 'sourcemeter',
      'keithley', 'multimeter', 'pcb', 'logic analyzer', 'signal generator', '5g', 'beamforming'
    ],
    specs: { 'Bandwidth': '>= 1 GHz', 'Dynamic Range': '>= 100 dB' },
    trainings: ['High-Frequency RF Instrumentation Safety', 'ESD Safe Workstation Certification'],
  },
  {
    category: 'Chemical & Spectrometry',
    keywords: [
      'spectrometry', 'chromatography', 'gc/ms', 'ftir', 'uv-vis', 'hplc', 'rotary evaporator',
      'nanomaterial', 'synthesis', 'catalysis', 'pfas', 'photocatalytic', 'particle size'
    ],
    specs: { 'Mass Range': '1.2 - 1050 u', 'Spectral Range': 'UV to IR' },
    trainings: ['Hazardous Chemicals & Fume Hood Protocol', 'Gas Chromatography Pressurized Cylinder Handling'],
  },
  {
    category: 'Biotechnology & Microscopy',
    keywords: [
      'confocal', 'microscopy', 'pcr', 'fluorescence', 'cell culture', 'rna', 'sequencing',
      'pathology', 'histology', 'flow cytometer', 'centrifuge', 'biosafety', 'hydrogel', 'tissue'
    ],
    specs: { 'Resolution': 'Sub-150nm optical', 'Laser Channels': 'Multi-line 405-790nm' },
    trainings: ['BSL-2 Biohazard Containment Training', 'Confocal Laser & Fluorophore Safety'],
  },
  {
    category: 'Mechanical & Materials Testing',
    keywords: [
      'tensile', 'fatigue', 'instron', 'mts', 'hardness', 'vickers', 'charpy', 'wind tunnel',
      'aerodynamic', 'shockwave', 'yield strength', 'stress-strain', 'composite'
    ],
    specs: { 'Force Capacity': '>= 50 kN', 'Dynamic Frequency': 'Up to 50 Hz' },
    trainings: ['High-Tension Tensile & Hydraulic Safety', 'Rotating Machinery & PPE Compliance'],
  },
  {
    category: 'Optics & Photonics',
    keywords: [
      'femtosecond', 'pulsed laser', 'optical table', 'interferometer', 'solar simulator',
      'reflectometer', 'polarimeter', 'wavefront', 'fiber alignment', 'spectroradiometer'
    ],
    specs: { 'Pulse Duration': '< 100 fs', 'Vibration Isolation': 'Pneumatic 98%' },
    trainings: ['Class 3B/4 Laser Eye Protection & Interlock Training', 'Optical Table Precision Alignment Protocol'],
  },
];

/**
 * Offline-first TF-IDF and Rule-based Requirement Extraction.
 * Parses project title, description, and attached requirements to identify needed hardware.
 */
export function extractProjectRequirements(
  title: string,
  description: string,
  attachedRequirements: string[]
): ExtractedRequirement[] {
  const fullText = `${title} ${description} ${attachedRequirements.join(' ')}`.toLowerCase();
  const extracted: ExtractedRequirement[] = [];

  ONTOLOGY_RULES.forEach((rule) => {
    let matchCount = 0;
    const hitKeywords: string[] = [];

    rule.keywords.forEach((kw) => {
      if (fullText.includes(kw)) {
        matchCount++;
        hitKeywords.push(kw);
      }
    });

    if (matchCount > 0) {
      // Calculate normalized confidence score
      const confidence = Math.min(0.99, Math.max(0.45, (matchCount / 4) * 0.95));
      extracted.push({
        category: rule.category,
        confidence: Math.round(confidence * 100) / 100,
        rationale: `Detected research intents: "${hitKeywords.slice(0, 3).join('", "')}". Matches ${rule.category} domain.`,
        suggestedSpecs: rule.specs,
        safetyWarnings: rule.trainings,
      });
    }
  });

  return extracted.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Matches extracted requirements against all equipment units in inventory.
 */
export function matchEquipmentForProject(
  requirements: ExtractedRequirement[],
  allEquipment: Equipment[],
  userCompletedTrainings: string[]
): EquipmentMatchResult[] {
  const matches: EquipmentMatchResult[] = [];
  const reqCatMap = new Map(requirements.map((r) => [r.category, r]));

  allEquipment.forEach((eq) => {
    const matchedReq = reqCatMap.get(eq.categoryId);
    if (!matchedReq) return;

    let score = Math.round(matchedReq.confidence * 85);
    const reasons: string[] = [matchedReq.rationale];

    // Check condition bonus
    if (eq.condition === 'optimal') {
      score += 10;
      reasons.push('Hardware in optimal factory calibration.');
    } else if (eq.condition === 'good') {
      score += 5;
    }

    // Check availability bonus
    if (eq.availability === 'available') {
      score += 5;
      reasons.push('Available for immediate booking.');
    }

    // Safety checks
    const missing = (eq.prerequisites || []).filter(
      (p) => !userCompletedTrainings.includes(p)
    );
    let prereqWarning: string | undefined = undefined;
    if (missing.length > 0) {
      prereqWarning = `Requires: ${missing.join(', ')}`;
    }

    matches.push({
      equipment: eq,
      matchScore: Math.min(100, score),
      matchedReasons: reasons,
      prerequisiteWarning: prereqWarning,
      isAvailable: eq.availability === 'available',
    });
  });

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

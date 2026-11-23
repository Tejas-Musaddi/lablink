import { Equipment, EquipmentCategory, EquipmentCondition, EquipmentAvailability } from '../types';
import { SeededPRNG } from './prng';

interface CategoryTemplate {
  category: EquipmentCategory;
  deptId: string;
  labId: string;
  names: string[];
  baseSpecs: Record<string, string>[];
  prereqs: string[];
  costRange: [number, number];
}

const CATEGORY_TEMPLATES: CategoryTemplate[] = [
  {
    category: 'GPU & AI Workstations',
    deptId: 'dept-cs',
    labId: 'lab-cs-1',
    names: [
      'NVIDIA DGX Station A100 (4x 80GB SXM4)',
      'NVIDIA H100 PCIe SuperServer Node 01',
      'NVIDIA H100 PCIe SuperServer Node 02',
      'NVIDIA RTX 6000 Ada Generation Rig A',
      'NVIDIA RTX 6000 Ada Generation Rig B',
      'NVIDIA RTX 4090 Deep Learning Rig 01',
      'NVIDIA RTX 4090 Deep Learning Rig 02',
      'NVIDIA RTX 4090 Deep Learning Rig 03',
      'NVIDIA RTX 4090 Deep Learning Rig 04',
      'Tesla V100 32GB Parallel Cluster 01',
      'Tesla V100 32GB Parallel Cluster 02',
      'AMD Instinct MI250X Accelerator Rack',
      'Apple Silicon M3 Max Neural Compute Box',
      'Intel Gaudi 2 Deep Learning Host 01',
      'NVIDIA Jetson AGX Orin Dev Cluster 01',
      'NVIDIA Jetson AGX Orin Dev Cluster 02'
    ],
    baseSpecs: [
      { 'GPU Memory': '320 GB HBM2e', 'Cores': '27,392 CUDA Cores', 'Tensor Cores': '856', 'Interconnect': 'NVLink 600 GB/s' },
      { 'GPU Memory': '80 GB HBM3', 'Architecture': 'Hopper FP8', 'TDP': '350W', 'PCIe': 'Gen 5.0' },
      { 'GPU Memory': '48 GB GDDR6', 'Ray Tracing Cores': '142', 'Tensor Cores': '568', 'Memory Bandwidth': '960 GB/s' },
      { 'VRAM': '24 GB GDDR6X', 'Clock Speed': '2.52 GHz', 'Power Supply': '1200W Titanium', 'Cooling': 'Custom Liquid Loop' },
    ],
    prereqs: ['GPU Cluster Access & Fair Use Protocol', 'CUDA & Linux Environment Training'],
    costRange: [25, 60],
  },
  {
    category: 'Robotics & Autonomous Systems',
    deptId: 'dept-rob',
    labId: 'lab-rob-1',
    names: [
      'DJI Matrice 350 RTK Industrial Drone Kit',
      'DJI Inspire 3 Cinematography / Aerial Sensor Drone',
      'Holybro S500 Autonomous PX4 Drone Research Rig',
      'Skydio X2 Autonomous AI Navigation Quadcopter',
      'Boston Dynamics Spot Explorer Quadruped Robot',
      'Unitree Go2 Pro Autonomous Quadruped',
      'Universal Robots UR5e 6-Axis Collaborative Arm',
      'Franka Emika Panda 7-DOF Research Robotic Arm',
      'Clearpath Husky A200 UGV Unmanned Ground Vehicle',
      'Clearpath Jackal J100 Outdoor Autonomous Rover',
      'TurtleBot 4 Pro Mobile Robot (ROS 2 Humble)',
      'TurtleBot 4 Standard Research Rover',
      'Kinova Gen3 Ultra-lightweight Robotic Arm',
      'Vicon Vantage V5 Motion Capture 12-Camera System',
      'Velodyne Alpha Prime 128-Beam LiDAR Scanner',
      'Ouster OS1-64 High-Res Digital LiDAR Rig'
    ],
    baseSpecs: [
      { 'Flight Time': '55 mins', 'Payload': '2.7 kg', 'Positioning': 'RTK Dual Antenna 1cm accuracy', 'Range': '20 km' },
      { 'Degrees of Freedom': '6-Axis', 'Payload': '5 kg', 'Reach': '850 mm', 'Repeatability': '+/- 0.03 mm' },
      { 'Sensor Array': '360 RGB-D + Depth', 'Max Speed': '1.6 m/s', 'Battery': '90 mins continuous', 'OS': 'ROS 2' },
      { 'Resolution': '128 Channels', 'Range': '245 m', 'Field of View': '40 deg Vertical, 360 deg Horiz', 'Points': '2.4M pts/sec' }
    ],
    prereqs: ['Aerial Flight Arena Safety Clearance', 'Collaborative Arm Emergency E-Stop Certified'],
    costRange: [20, 50],
  },
  {
    category: 'Rapid Prototyping & 3D',
    deptId: 'dept-mech',
    labId: 'lab-mech-2',
    names: [
      'Markforged Metal X Atomic Diffusion 3D Printer',
      'Markforged X7 Continuous Carbon Fiber 3D Printer',
      'Stratasys Fortus 450mc Production FDM System',
      'Formlabs Form 4 SLA High-Precision Resin Printer',
      'Formlabs Fuse 1+ 30W SLS Powder 3D Printer',
      'Bambu Lab X1-Carbon Combo High-Speed 3D Unit A',
      'Bambu Lab X1-Carbon Combo High-Speed 3D Unit B',
      'Bambu Lab X1-Carbon Combo High-Speed 3D Unit C',
      'UltiMaker S7 Dual-Extrusion Engineering Printer',
      'Raise3D Pro3 Plus Large Format Industrial Printer',
      'Creality K1 Max High-Speed FDM Printer 01',
      'Creality K1 Max High-Speed FDM Printer 02',
      'Epilog Fusion Pro 48 CO2 Laser Cutter & Engraver',
      'Trotec Speedy 400 Flexx Laser Cutting Workstation',
      'Formlabs Wash & Cure L Automation Station',
      'Markforged Sinter-2 Automated Tube Furnace'
    ],
    baseSpecs: [
      { 'Build Volume': '300 x 220 x 180 mm', 'Materials': '17-4 PH Stainless, Inconel 625, Copper', 'Layer Height': '50 um' },
      { 'Laser Power': '120W CO2', 'Working Area': '1219 x 914 mm', 'Max Speed': '4.2 m/s', 'Air Assist': 'Automated' },
      { 'Print Technology': 'LFS Stereolithography', 'XY Resolution': '50 um', 'Laser Spot Size': '85 um', 'Volume': '200 x 125 x 210 mm' },
      { 'Extrusion Temp': '300 C', 'Bed Temp': '120 C', 'Max Acceleration': '20,000 mm/s2', 'Chamber Heat': '60 C' }
    ],
    prereqs: ['Class 4 Laser Operation License', 'Metal Sintering & Furnace Protocols'],
    costRange: [15, 40],
  },
  {
    category: 'Electronics & Embedded Testing',
    deptId: 'dept-ece',
    labId: 'lab-ece-1',
    names: [
      'Keysight Infiniium MXR-Series 6GHz 8-Ch Oscilloscope',
      'Tektronix 6 Series B MSO 8GHz Mixed Signal Scope',
      'Rohde & Schwarz ZNB20 20GHz Vector Network Analyzer',
      'Keysight N9020B MXA 26.5GHz Signal Spectrum Analyzer',
      'Keithley 2450 Interactive Touchscreen SourceMeter 01',
      'Keithley 2450 Interactive Touchscreen SourceMeter 02',
      'Rigol DS7054 500MHz 4-Ch Digital Storage Scope',
      'Siglent SDS2104X Plus 100MHz 4-Channel Scope',
      'FLIR A700 Advanced Smart Thermal Imaging Camera',
      'Keysight 34465A 6.5 Digit Truevolt Digital Multimeter',
      'Chroma 62012P-80-60 Programmable DC Power Supply',
      'JBC Modular CD-2BQF Soldering & Desoldering Bench',
      'Bantam Tools Desktop CNC PCB Milling Machine',
      'Saleae Logic Pro 16 High-Speed USB Logic Analyzer',
      'Anritsu MT8821C Radio Communication Analyzer',
      'Instek GDS-3504 500MHz Visual Persistence Scope'
    ],
    baseSpecs: [
      { 'Bandwidth': '6 GHz', 'Channels': '8 Analog + 16 Digital', 'Sample Rate': '16 GSa/s', 'Memory Depth': '500 Mpts' },
      { 'Frequency Range': '100 kHz to 20 GHz', 'Dynamic Range': '140 dB', 'Measurement Speed': '< 3.5 ms', 'Ports': '4 Ports' },
      { 'Voltage Range': '20 mV to 200 V', 'Current Range': '10 nA to 1 A', 'Basic Accuracy': '0.012%', 'Touchscreen': '5 inch capacitive' },
      { 'Thermal Resolution': '640 x 480', 'Temp Range': '-20 to 1500 C', 'Accuracy': '+/- 2%', 'Frame Rate': '30 Hz' }
    ],
    prereqs: ['High-Frequency RF Instrumentation Safety', 'ESD Safe Workstation Certification'],
    costRange: [15, 35],
  },
  {
    category: 'Chemical & Spectrometry',
    deptId: 'dept-chem',
    labId: 'lab-chem-1',
    names: [
      'Agilent 8890 GC / 5977B Single Quadrupole GC/MS System',
      'Bruker Alpha II Compact FTIR Spectrometer',
      'Thermo Scientific Nicolet iS50 Advanced FTIR Spectrometer',
      'Shimadzu UV-2600i Research-Grade UV-Vis Spectrophotometer',
      'PerkinElmer PinAAcle 900T Atomic Absorption Spectrometer',
      'Waters ACQUITY Arc HPLC Liquid Chromatography System',
      'Buchi Rotavapor R-300 Automated Rotary Evaporator 01',
      'Buchi Rotavapor R-300 Automated Rotary Evaporator 02',
      'Malvern Zetasizer Nano ZS Particle Size & Zeta Potential',
      'TA Instruments Discovery DSC 25 Differential Scanning Calorimeter',
      'TA Instruments TGA 550 Thermogravimetric Analyzer',
      'Anton Paar Anton DMA 4500 M High-Precision Density Meter',
      'Mettler Toledo SevenExcellence Multiparameter pH/Cond Meter',
      'Labconco FreeZone 4.5L Benchtop Freeze Dryer Lyophilizer',
      'CEM Discover 2.0 Microwave Chemical Synthesis Reactor',
      'Horiba FluoroMax-4 Compact Spectrofluorometer'
    ],
    baseSpecs: [
      { 'Mass Range': '1.2 to 1050 u', 'Ion Source': 'Inert Extractor EI', 'Oven Temp': 'Up to 450 C', 'Carrier Gas': 'Helium / Hydrogen' },
      { 'Spectral Range': '8,000 to 350 cm-1', 'Resolution': 'Better than 0.7 cm-1', 'Detector': 'DLaTGS temperature stabilized' },
      { 'Wavelength Range': '185 to 900 nm', 'Photometric Accuracy': '+/- 0.002 Abs', 'Stray Light': '0.005% at 220 nm' },
      { 'Particle Size Range': '0.3 nm to 10.0 um', 'Zeta Potential': '+/- 500 mV', 'Molecular Weight': '9800 Da to 20M Da' }
    ],
    prereqs: ['Hazardous Chemicals & Fume Hood Protocol', 'Gas Chromatography Pressurized Cylinder Handling'],
    costRange: [20, 55],
  },
  {
    category: 'Biotechnology & Microscopy',
    deptId: 'dept-bio',
    labId: 'lab-bio-1',
    names: [
      'Leica TCS SP8 / Stellaris Confocal Laser Scanning Microscope',
      'Olympus IX83 Inverted Motorized Fluorescence Microscope',
      'Zeiss Axio Observer 7 Live-Cell Imaging System',
      'Thermo Fisher QuantStudio 7 Flex Real-Time PCR System',
      'Bio-Rad QX200 Droplet Digital PCR (ddPCR) System',
      'BD FACSCelesta Cell Flow Cytometer (3-Laser 12-Color)',
      'Beckman Coulter Optima XPN-100 Ultracentrifuge (100k RPM)',
      'Eppendorf 5810 R High-Speed Refrigerated Benchtop Centrifuge',
      'Thermo Fisher Nanodrop One Microvolume UV Spectrophotometer',
      'Illumina NextSeq 550 Next-Gen DNA Sequencer Station',
      'Miltenyi Biotec autoMACS Pro Automated Cell Separator',
      'PHCbi CO2 Cell Incubator with Dual IR Sensor',
      'Labconco Purifier Logic+ Class II Type A2 Biosafety Cabinet',
      'EVOS M7000 Automated Cell Imaging Core System',
      'Biotek Synergy H1 Hybrid Multi-Mode Microplate Reader',
      'Sartorius Cubis II Ultra-Micro Analytical Balance'
    ],
    baseSpecs: [
      { 'Lasers': 'White Light Laser 440-790nm + 405nm Diode', 'Detectors': 'Power HyD X and HyD R detectors', 'Resolution': 'Sub-120nm optical' },
      { 'Fluorescence Channels': '12 Optical Channels across 3 Lasers (Blue, Violet, Red)', 'Flow Rate': 'Up to 25,000 events/sec' },
      { 'Max Speed': '100,000 RPM', 'Max g-Force': '802,400 x g', 'Volume Capacity': 'Up to 1.5 Liters' },
      { 'Throughput': '120 Gb / 400M reads per run', 'Read Length': 'Up to 2 x 150 bp', 'Run Time': '12 to 30 hours' }
    ],
    prereqs: ['BSL-2 Biohazard Containment Training', 'Confocal Laser & Fluorophore Safety'],
    costRange: [30, 70],
  },
  {
    category: 'Mechanical & Materials Testing',
    deptId: 'dept-mech',
    labId: 'lab-mech-2',
    names: [
      'Instron 5969 Dual-Column 50kN Universal Testing Machine',
      'MTS Landmark 100kN Servohydraulic Dynamic Fatigue System',
      'Tinius Olsen FH-14 Vickers Microhardness Testing Station',
      'ZwickRoell HIT50P Pendulum Charpy Impact Tester',
      'GOM ATOS Q High-Resolution 3D Optical Strain Gauge Scanner',
      'Mitutoyo Crysta-Apex V 9106 CNC Coordinate Measuring Machine',
      'Keyence VHX-7000 Digital 4K Ultra-Depth Microscope',
      'Buehler EcoMet 300 Grinder-Polisher Metallurgical Prep',
      'Struers LaboPress-3 Hydraulic Hot Mounting Press',
      'FLIR E86 Thermal Non-Destructive Testing Imager',
      'Ametek Chatillon CS225 Digital Force Tester 1kN',
      'Anton Paar TRB3 High-Temperature Pin-on-Disk Tribometer',
      'Elcometer 456 Electronic Coating Thickness Gauge',
      'Nikon iNEXIV VMA-2520 Video Measuring System',
      'Wilson VH1150 Macro-Vickers Hardness Tester',
      'Kistler 9257B 3-Component Piezoelectric Cutting Force Dynamometer'
    ],
    baseSpecs: [
      { 'Load Capacity': '50 kN (11,250 lbf)', 'Speed Range': '0.001 to 1000 mm/min', 'Data Acquisition': '5 kHz synchronous', 'Extension': 'Video Extensometer' },
      { 'Fatigue Frequency': 'Up to 50 Hz', 'Dynamic Force': '+/- 100 kN', 'Actuator Stroke': '150 mm' },
      { 'Magnification': '20x to 6000x', 'Sensor': '4K CMOS', 'Lighting': 'Multi-directional ring + polarized' },
      { 'Accuracy': '1.7 + 3L/1000 um', 'Measuring Volume': '900 x 1000 x 600 mm', 'Probing System': 'SP25M Scanning Probe' }
    ],
    prereqs: ['High-Tension Tensile & Hydraulic Safety', 'Rotating Machinery & PPE Compliance'],
    costRange: [20, 45],
  },
  {
    category: 'Optics & Photonics',
    deptId: 'dept-ece',
    labId: 'lab-ece-2',
    names: [
      'Thorlabs Nexus Active Vibration-Isolated Optical Table 01',
      'Thorlabs Nexus Active Vibration-Isolated Optical Table 02',
      'Spectra-Physics Mai Tai Ti:Sapphire Femtosecond Pulsed Laser',
      'Coherent Verdi High-Power 532nm DPSS Continuous Laser',
      'Newport Oriel Sol3A Class AAA Solar Simulator Workstation',
      'Yokogawa AQ6370D High-Performance Optical Spectrum Analyzer',
      'Luna OBR 4600 High-Precision Optical Backscatter Reflectometer',
      'Thorlabs Polarimeter & Stokes Parameter Analyzer Bench',
      'Newport AutoAlign Automated Multi-Axis Fiber Alignment Rig',
      'Edmund Optics Ultra-Broadband Interferometric Wavefront Sensor',
      'Ocean Insight Ocean-HDX High-Definition Miniature Spectrometer',
      'Gentec-EO Maestro Multi-Channel Laser Power / Energy Meter',
      'Hamamatsu Orca-Flash 4.0 V3 Scientific CMOS Camera',
      'Horiba iHR320 Imaging Spectrometer with Synapse CCD',
      'Thorlabs Scanning Fabry-Perot Interferometer Station',
      'Keysight 8164B Lightwave Measurement System Mainframe'
    ],
    baseSpecs: [
      { 'Vibration Isolation': 'Pneumatic 98% isolation at 10Hz', 'Surface': '304 Magnetic Stainless Steel', 'Dimensions': '1.5m x 3.0m x 310mm' },
      { 'Tuning Range': '690 to 1040 nm', 'Pulse Width': '< 100 fs', 'Repetition Rate': '80 MHz', 'Average Power': '> 2.5 W' },
      { 'Wavelength Range': '600 to 1700 nm', 'Resolution': '0.02 nm', 'Dynamic Range': '70 dB' },
      { 'Beam Uniformity': '< 2%', 'Spectral Match': 'Class A AM1.5G', 'Temporal Instability': '< 0.5%' }
    ],
    prereqs: ['Class 3B/4 Laser Eye Protection & Interlock Training', 'Optical Table Precision Alignment Protocol'],
    costRange: [25, 65],
  }
];

export function generateAllEquipment(): Equipment[] {
  const prng = new SeededPRNG(1337);
  const equipmentList: Equipment[] = [];

  CATEGORY_TEMPLATES.forEach((catTpl) => {
    catTpl.names.forEach((name, idx) => {
      const codeNum = String(idx + 1).padStart(3, '0');
      const catCode = catTpl.category.substring(0, 3).toUpperCase();
      const code = `EQ-${catCode}-${codeNum}`;
      const id = `eq-${catTpl.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${codeNum}`;
      
      const conditionWeights: EquipmentCondition[] = ['optimal', 'optimal', 'good', 'good', 'good', 'fair'];
      // The hero DGX station is optimal
      const condition: EquipmentCondition = (idx === 0 && catTpl.category === 'GPU & AI Workstations')
        ? 'optimal'
        : prng.pick(conditionWeights);

      const availabilityWeights: EquipmentAvailability[] = ['available', 'available', 'in_use', 'reserved'];
      const availability: EquipmentAvailability = (idx === 0 && catTpl.category === 'GPU & AI Workstations')
        ? 'in_use' // hero unit has active bookings & contending requests
        : prng.pick(availabilityWeights);

      const specs = catTpl.baseSpecs[idx % catTpl.baseSpecs.length];
      const hoursLogged = prng.nextInt(40, 1200);

      // Equivalent equipment mapping: if it's GPU, link other GPUs; if drones, link other drones
      const equivalentEquipmentIds: string[] = [];
      if (idx === 0 && catTpl.category === 'GPU & AI Workstations') {
        // Hero DGX station has RTX 6000 Ada and H100 as alternatives
        equivalentEquipmentIds.push(
          `eq-gpu---ai-workstations-002`,
          `eq-gpu---ai-workstations-004`
        );
      } else if (idx === 0 && catTpl.category === 'Robotics & Autonomous Systems') {
        equivalentEquipmentIds.push(`eq-robotics---autonomous-systems-002`);
      }

      equipmentList.push({
        id,
        name,
        code,
        categoryId: catTpl.category,
        departmentId: catTpl.deptId,
        labId: catTpl.labId,
        description: `High-grade ${catTpl.category.toLowerCase()} apparatus calibrated for academic research, thesis projects, and inter-departmental collaborative prototyping.`,
        specs,
        condition,
        availability,
        prerequisites: catTpl.prereqs,
        qrCodeId: `QR-LABLINK-${code}`,
        hourlyOperatingCost: prng.nextInt(catTpl.costRange[0], catTpl.costRange[1]),
        replacementCost: prng.nextInt(5000, 120000),
        maxBookingHoursPerSlot: catTpl.category.includes('GPU') ? 6 : 4,
        locationDetails: `Station Bench #${(idx % 8) + 1}, East Bay`,
        serialNumber: `SN-${prng.nextInt(100000, 999999)}-${codeNum}`,
        totalHoursLogged: hoursLogged,
        lastMaintenanceDate: '2026-10-15T09:00:00Z',
        nextMaintenanceDate: '2026-12-15T09:00:00Z',
        equivalentEquipmentIds,
        svgIconType: catTpl.category.toLowerCase().split(' ')[0],
      });
    });
  });

  return equipmentList;
}

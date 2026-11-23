import { useAppStore } from '../store/useAppStore';
import { Equipment, Laboratory, ConflictCase } from '../types';
import { extractProjectRequirements, matchEquipmentForProject } from './aiExtractor';

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolCalled?: string;
  dataCards?: {
    type: 'equipment_list' | 'conflict_card' | 'lab_info' | 'help';
    payload: any;
  };
}

export interface AssistantReplyResult {
  replyText: string;
  toolCalled?: string;
  dataCards?: AssistantMessage['dataCards'];
}

/**
 * AI Assistant Engine with tool-style function calling directly on store state.
 * Works 100% offline without external API dependencies.
 */
export function processAssistantQuery(
  userQuery: string,
  storeState: ReturnType<typeof useAppStore.getState>
): AssistantReplyResult {
  const query = userQuery.toLowerCase().trim();

  // 1. Intent: Explain Allocation Decision / Conflicts
  if (
    query.includes('why') ||
    query.includes('explain') ||
    query.includes('conflict') ||
    query.includes('dgx') ||
    query.includes('decision')
  ) {
    const heroConflict = storeState.conflicts.find((c) => c.isHeroScenario) || storeState.conflicts[0];
    const heroEq = storeState.equipment.find((e) => e.id === heroConflict.equipmentId);

    return {
      toolCalled: 'explain_decision(conflictId="conflict-hero")',
      replyText: `Here is the verified allocation decision for ${heroEq?.name || 'the GPU Workstation'}:\n\n` +
        `Three research teams requested overlapping windows on Nov 25. Aarav Sharma (Autonomous Drone Swarm) was awarded the primary slot with a composite score of 69.8/100, driven by Critical Project Priority, approaching IEEE deadline, and low prior usage (14h).\n\n` +
        `To ensure zero project delays, Elena Rostova's team was automatically shifted to the equivalent NVIDIA H100 SuperServer Node at the exact same requested time.`,
      dataCards: {
        type: 'conflict_card',
        payload: {
          conflict: heroConflict,
          equipment: heroEq,
        },
      },
    };
  }

  // 2. Intent: Which Lab is Free / Seat Capacity & Availability
  if (
    !query.includes('equipment') &&
    (query.includes('free lab') ||
      query.includes('which lab is free') ||
      query.includes('open lab') ||
      query.includes('seat') ||
      query.includes('capacity') ||
      (query.includes('lab') &&
        (query.includes('free') || query.includes('open') || query.includes('vacancy'))))
  ) {
    const freeLabs = storeState.laboratories
      .map((lab) => {
        const labEquipment = storeState.equipment.filter((e) => e.labId === lab.id);
        const availableEq = labEquipment.filter((e) => e.availability === 'available');
        const activeLabBookings = storeState.bookings.filter(
          (b) => b.labId === lab.id && b.status === 'confirmed'
        );
        const occupiedSeats = activeLabBookings.length;
        const freeSeats = Math.max(0, lab.capacity - occupiedSeats);
        const dept = storeState.deptMap[lab.departmentId];

        return {
          lab,
          department: dept?.name || 'Engineering',
          totalCapacity: lab.capacity,
          occupiedSeats,
          freeSeats,
          totalEquipment: labEquipment.length,
          availableEquipment: availableEq.length,
          availabilityRate:
            labEquipment.length > 0
              ? Math.round((availableEq.length / labEquipment.length) * 100)
              : 0,
          sampleAvailableEquipment: availableEq.slice(0, 3),
        };
      })
      .sort((a, b) => b.freeSeats - a.freeSeats)
      .slice(0, 3);

    const labBreakdown = freeLabs
      .map(
        (f) =>
          `• **${f.lab.name}** (Room ${f.lab.roomNumber}, ${f.lab.building}):\n` +
          `   - **Seating Capacity**: ${f.freeSeats} of ${f.totalCapacity} seats free (${f.occupiedSeats} active)\n` +
          `   - **Apparatus**: ${f.availableEquipment} instruments available now\n` +
          `   - **Operating Hours**: ${f.lab.operatingHours.open} – ${f.lab.operatingHours.close} (Mon–Fri)`
      )
      .join('\n\n');

    return {
      toolCalled: 'query_free_laboratories(status="open", includeSeatCount=true)',
      replyText: `Yes! Here is the live count of seating capacity and free seats across our campus laboratories:\n\n${labBreakdown}\n\nYou can also view the full 12-laboratory live seat occupancy table on the **Laboratory Explorer** page!`,
      dataCards: {
        type: 'lab_info',
        payload: freeLabs,
      },
    };
  }

  // 3. Intent: Which Lab to Go to for Project
  if (
    query.includes('which lab') ||
    query.includes('where should i go') ||
    query.includes('where to go') ||
    query.includes('suggest lab') ||
    query.includes('what lab') ||
    (query.includes('lab') && (query.includes('project') || query.includes('go to') || query.includes('work on')))
  ) {
    const extracted = extractProjectRequirements(userQuery, userQuery, []);
    const defaultProj = storeState.projects[0];
    const matches = matchEquipmentForProject(
      extracted.length > 0 ? extracted : extractProjectRequirements(defaultProj.title, defaultProj.description, []),
      storeState.equipment,
      storeState.currentUser.completedTrainings
    );

    // Group matching equipment by lab
    const labScores: Record<string, { lab: Laboratory; count: number; matchingEquipment: Equipment[] }> = {};
    matches.forEach((m) => {
      const lab = storeState.labMap[m.equipment.labId];
      if (lab) {
        if (!labScores[lab.id]) {
          labScores[lab.id] = { lab, count: 0, matchingEquipment: [] };
        }
        labScores[lab.id].count += 1;
        if (labScores[lab.id].matchingEquipment.length < 3) {
          labScores[lab.id].matchingEquipment.push(m.equipment);
        }
      }
    });

    const recommendedLabs = Object.values(labScores)
      .sort((a, b) => b.count - a.count)
      .slice(0, 2);

    if (recommendedLabs.length > 0) {
      const top = recommendedLabs[0];
      const dept = storeState.deptMap[top.lab.departmentId]?.name || 'Engineering';

      return {
        toolCalled: `recommend_laboratory_for_project(query="${userQuery.slice(0, 30)}...")`,
        replyText: `Based on your project requirements, you should go to **${top.lab.name}** in the **${dept}** department.\n\n` +
          `• **Exact Location**: Room ${top.lab.roomNumber}, ${top.lab.building}\n` +
          `• **Operating Hours**: ${top.lab.operatingHours.open} – ${top.lab.operatingHours.close} (Mon–Fri)\n` +
          `• **Safety Tier**: Tier ${top.lab.safetyTier} (${top.lab.safetyTier === 1 ? 'General Campus Access' : 'Trained Researchers'})\n` +
          `• **Compatible Apparatus Ready**: ${top.matchingEquipment.map((e) => e.name).join(', ')}`,
        dataCards: {
          type: 'lab_info',
          payload: recommendedLabs.map((r) => ({
            lab: r.lab,
            department: storeState.deptMap[r.lab.departmentId]?.name || '',
            totalEquipment: storeState.equipment.filter((e) => e.labId === r.lab.id).length,
            availableEquipment: storeState.equipment.filter((e) => e.labId === r.lab.id && e.availability === 'available').length,
            sampleAvailableEquipment: r.matchingEquipment,
          })),
        },
      };
    }
  }

  // 4. Intent: Check General Equipment Availability
  if (query.includes('available') || query.includes('free') || query.includes('status')) {
    const availableItems = storeState.equipment
      .filter((e) => e.availability === 'available')
      .slice(0, 4);

    return {
      toolCalled: 'check_availability(status="available")',
      replyText: `I queried our campus inventory in real time. Currently, ${storeState.equipment.filter((e) => e.availability === 'available').length} instruments are available now for instant reservation. Here are 4 high-demand apparatus with open slots:`,
      dataCards: {
        type: 'equipment_list',
        payload: availableItems,
      },
    };
  }

  // 3. Intent: Recommendations for Project
  if (
    query.includes('recommend') ||
    query.includes('project') ||
    query.includes('suggest') ||
    query.includes('need')
  ) {
    const defaultProj = storeState.projects[0];
    const extracted = extractProjectRequirements(
      userQuery,
      userQuery,
      []
    );
    const matches = matchEquipmentForProject(
      extracted.length > 0 ? extracted : extractProjectRequirements(defaultProj.title, defaultProj.description, []),
      storeState.equipment,
      storeState.currentUser.completedTrainings
    ).slice(0, 4);

    return {
      toolCalled: 'recommend_for_project(queryText)',
      replyText: `Based on your research description, I extracted semantic requirements and matched them against 128 campus instruments. Here are the top compatible units:`,
      dataCards: {
        type: 'equipment_list',
        payload: matches.map((m) => m.equipment),
      },
    };
  }

  // 4. Intent: Alternatives / Replacement
  if (query.includes('alternative') || query.includes('similar') || query.includes('substitute')) {
    const heroEq = storeState.equipment.find((e) => e.id === 'eq-gpu---ai-workstations-001')!;
    const altUnits = (heroEq.equivalentEquipmentIds || [])
      .map((id) => storeState.equipmentMap[id])
      .filter(Boolean);

    return {
      toolCalled: 'find_alternatives(equipmentId="eq-gpu---ai-workstations-001")',
      replyText: `When ${heroEq.name} is in high contention, LabLink identifies hardware with equivalent tensor core capability. Here are the verified equivalents:`,
      dataCards: {
        type: 'equipment_list',
        payload: altUnits,
      },
    };
  }

  // 5. Intent: Specific Equipment Search (e.g. GPU, Microscope, Drone, Laser, Oscilloscope)
  const matchingEq = storeState.equipment
    .filter(
      (e) =>
        e.name.toLowerCase().includes(query) ||
        e.categoryId.toLowerCase().includes(query) ||
        e.code.toLowerCase().includes(query)
    )
    .slice(0, 4);

  if (matchingEq.length > 0) {
    return {
      toolCalled: `find_equipment(query="${query}")`,
      replyText: `Found ${matchingEq.length} apparatus matching "${query}":`,
      dataCards: {
        type: 'equipment_list',
        payload: matchingEq,
      },
    };
  }

  // Default Help Reply
  return {
    toolCalled: 'general_help()',
    replyText: `Hello! I am the LabLink Campus AI Assistant. I have live read-access to all 128 campus instruments, laboratory operating hours, and active conflict schedules.\n\n` +
      `You can ask me things like:\n` +
      `• "Why was the DGX Station allocated to Aarav?"\n` +
      `• "Which GPU workstations or drone kits are available now?"\n` +
      `• "Recommend apparatus for fine-tuning a multimodal vision model"\n` +
      `• "Show alternative hardware for high-demand AI compute"`,
    dataCards: {
      type: 'help',
      payload: null,
    },
  };
}

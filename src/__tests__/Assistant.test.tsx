import { describe, it, expect } from 'vitest';
import { processAssistantQuery } from '../engine/assistantService';
import { useAppStore } from '../store/useAppStore';

describe('AI Lab Assistant Engine (Store Grounding)', () => {
  it('retrieves live available equipment directly from state without hallucination', () => {
    const state = useAppStore.getState();
    const result = processAssistantQuery('Which equipment is available now?', state);

    expect(result.toolCalled).toContain('check_availability');
    expect(result.dataCards?.type).toBe('equipment_list');
    const availableCount = state.equipment.filter((e) => e.availability === 'available').length;
    expect(result.replyText).toContain(`${availableCount} instruments are available now`);
  });

  it('explains the hero DGX station allocation decision using real conflict facts', () => {
    const state = useAppStore.getState();
    const result = processAssistantQuery('Why was the DGX Station allocated to Aarav?', state);

    expect(result.toolCalled).toContain('explain_decision');
    expect(result.replyText).toContain('Aarav Sharma');
    expect(result.replyText).toContain('Elena Rostova');
    expect(result.replyText).toContain('NVIDIA H100');
    expect(result.dataCards?.type).toBe('conflict_card');
  });

  it('recommends compatible apparatus matching extracted keywords', () => {
    const state = useAppStore.getState();
    const result = processAssistantQuery('Recommend hardware for training multimodal transformer models', state);

    expect(result.toolCalled).toContain('recommend_for_project');
    expect(result.dataCards?.type).toBe('equipment_list');
    expect(result.dataCards?.payload.length).toBeGreaterThan(0);
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BookingRequestModal } from '../features/discovery/BookingRequestModal';
import { getInitialSeedData } from '../data/seedData';

describe('BookingRequestModal Component', () => {
  const seed = getInitialSeedData();
  const eq = seed.equipment.find((e) => e.id === 'eq-gpu---ai-workstations-001')!;

  it('renders booking modal with equipment name and asset tag', () => {
    render(
      <BookingRequestModal
        equipment={eq}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(`Request Slot: ${eq.name}`)).toBeInTheDocument();
    expect(screen.getByText(/Asset Tag: EQ-GPU-001/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Associate with Research Project/i)).toBeInTheDocument();
  });

  it('shows required validation warning if submitted without purpose', () => {
    render(
      <BookingRequestModal
        equipment={eq}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Submit Request/i });
    fireEvent.click(submitBtn);

    // Form prevents empty submission
    expect(screen.getByPlaceholderText(/Explain how your model, experiment, or simulation depends/i)).toBeRequired();
  });
});

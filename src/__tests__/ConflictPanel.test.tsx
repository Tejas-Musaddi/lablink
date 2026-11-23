import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ConflictResolutionPage } from '../features/conflicts/ConflictResolutionPage';

describe('ConflictResolutionPage Component', () => {
  it('renders the Fair Allocation Engine and Hero Scenario selector', () => {
    render(
      <BrowserRouter>
        <ConflictResolutionPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/AI Fair Allocation & Conflict Resolution Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/★ Hero Scenario/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Live Allocation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /What-If Simulator/i })).toBeInTheDocument();
  });
});

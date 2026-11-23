# Testing Strategy & Test Matrix — LabLink

## 1. Test Architecture Overview

LabLink employs a multi-tiered automated and manual testing pyramid:

| Test Tier | Technology | Target Scope | Pass Criteria |
| :--- | :--- | :--- | :--- |
| **Unit Tests** | Vitest | Allocation engine, scoring, feasibility, tie-breakers, Jain's index, PRNG determinism | 100% pass, $\ge 90\%$ engine branch coverage |
| **Component Tests** | React Testing Library + Vitest | Booking form validation, Assistant store grounding, Conflict panel | Render reliability, store state accuracy, zero errors |
| **End-to-End (E2E)** | Playwright | Hero conflict workflow, role switcher, reset demo, waitlist promotion | Full headless browser workflow execution |
| **Accessibility (a11y)** | axe-core & manual keyboard audits | Semantic landmarks, contrast ratios, focus traps, aria labels | WCAG 2.2 AA compliant |
| **Database & Realtime** | Supabase JS + Vitest Node | Relational schema integrity, RLS policies, pre-flight race condition guards, WebSocket broadcast | Zero 401/42501 errors, zero double-booking |

---

## 2. Detailed Test Matrix

### 2.1 Engine Unit Tests (`src/engine/__tests__/engine.test.ts`)
- `checkHardConstraints`:
  - Passes fully valid requests within operating hours, safety certifications, and deadlines.
  - Rejects requests missing prerequisite safety credentials.
  - Rejects requests exceeding maximum allowable slot duration (`maxBookingHoursPerSlot`).
  - Rejects out-of-hours or closed-day requests.
  - Rejects requests overlapping with scheduled maintenance windows.
  - Rejects requests conflicting with existing locked confirmed bookings (zero double-booking).
- `Scoring & Normalization`:
  - Proves Deadline Urgency increases as submission deadline approaches.
  - Verifies hierarchical Project Priority weighting (`critical`=100, `high`=80, `normal`=50, `low`=25).
  - Rewards lower prior usage hours to maximize equity.
  - Rewards waiting time in queue.
  - Validates requirement criticality bonus when equipment is directly named in project abstract.
- `Determinism & Hero Resolution`:
  - Resolves Hero DGX Station contention: Aarav Sharma allocated primary slot; Elena Rostova shifted to equivalent NVIDIA H100 Node.
  - Guarantees 100% deterministic identical outputs across repeated runs with identical seeds.
  - Verifies multi-stage tie-breakers (creation timestamp $\rightarrow$ prior usage $\rightarrow$ request ID).
- `Fairness Metric`:
  - Proves Jain's Index yields $1.0$ for equal allocations and $1/n$ for single-user monopoly.
- `What-If Simulator`:
  - Simulates allocation outcome shifts when parameter weights are dynamically adjusted.

### 2.2 Component Tests (`src/__tests__/`)
- `BookingForm.test.tsx`:
  - Verifies form rendering with pre-populated equipment asset code and project selector.
  - Verifies HTML5 and Zod validation preventing empty purpose submissions.
- `Assistant.test.tsx`:
  - Verifies assistant executes tool-style function calls directly on store state (`check_availability`, `explain_decision`, `recommend_for_project`, `query_free_laboratories`).
  - Confirms availability responses match exact inventory counts without hallucination.
  - Confirms "Which lab is free?" queries calculate seat availability accurately and return structured lab cards.
- `ConflictPanel.test.tsx`:
  - Verifies conflict case switching, live allocation mode, and What-If simulator tab rendering.

### 2.3 Live Seat Capacity & Occupancy Tests
- Verifies total seat capacity aggregation across all 12 facilities in `LaboratoryExplorerPage.tsx`.
- Verifies dynamic calculation of `occupiedSeats` and `freeSeats = capacity - occupiedSeats`.
- Verifies status badge tiers:
  - $\ge 50\%$ free: High Availability (Emerald)
  - $15\% - 49\%$ free: Moderate (Amber)
  - $1\% - 14\%$ free: Near Capacity (Orange)
  - $0$ free: Full (Rose)

### 2.4 Supabase & Realtime Synchronization Testing
- **Connection Diagnostics**:
  - `testSupabaseConnection()` verifies REST round-trip ping to the Supabase endpoint.
- **Pre-Flight Concurrency Guard (`checkSlotAvailability`)**:
  - Validates that concurrent booking attempts for the same instrument slot are detected and rejected before writing.
- **Cross-Tab Realtime Broadcast**:
  - Test procedure:
    1. Open Tab A in Student persona, and Tab B in Faculty persona.
    2. Submit booking request in Tab A.
    3. Observe instant appearance of request in Tab B Faculty Portal without page reload.
    4. Click "Approve Recommendation" in Tab B.
    5. Observe status change to "Approved" and calendar slot populating in Tab A within $< 500\text{ms}$.

### 2.5 Playwright E2E Suite (`e2e/hero-workflow.spec.ts`)
- **Hero Demo Flow**:
  1. Student loads dashboard.
  2. Opens Project page $\rightarrow$ executes "Analyse with AI" on Drone Swarm project.
  3. Verifies recommended hardware $\rightarrow$ navigates to Allocation Engine.
  4. Runs engine on Hero Scenario $\rightarrow$ verifies structured rationales.
  5. Switches role to Faculty Advisor in top bar.
  6. Navigates to Faculty Portal $\rightarrow$ executes atomic approval.
  7. Verifies committed schedule in Smart Calendar.
- **Role Switching**:
  - Validates persona switching among Student, Faculty, Lab Manager, and Campus Admin.
- **Reset Demo Simulation**:
  - Opens confirmation dialog, resets state, and verifies localStorage reload.
- **Waitlist Promotion**:
  - Tests cancelling a booked session and verifies automatic waitlist candidate promotion.

---

## 3. Running Automated Test Suites

```bash
# 1. Run all Vitest Unit & Component Tests
npm test

# 2. Run TypeScript strict typecheck
npm run typecheck

# 3. Test Supabase automated CLI seeder
npm run seed:supabase

# 4. Run production build
npm run build

# 5. Run Playwright E2E Tests (requires dev server or preview build)
npm run preview &
npx playwright test
```

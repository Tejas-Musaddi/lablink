# LabLink Supabase Backend Integration Guide

LabLink features an enterprise-grade hybrid storage and synchronization architecture:
1. **Offline & Deterministic Mode (Default)**: Uses client-side IndexedDB/LocalStorage with seeded PRNG (Mulberry32) for zero-downtime, credential-free demonstration.
2. **Cloud PostgreSQL Mode (Supabase)**: Connects to a live Supabase PostgreSQL backend with a full 12-table relational schema, Row Level Security (RLS), real-time WebSockets synchronization, and atomic pre-flight conflict validation.

---

## Architecture Overview

```
                      +-----------------------------+
                      |   Zustand App Store         |
                      |   (Indexed O(1) Maps)       |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v (Synchronous / Optimistic)                v (Asynchronous / Non-blocking)
   +-----------------------+                   +-----------------------+
   |  LocalStorage Layer   |                   |  SupabaseService      |
   |  (Zod validated)      |                   |  (PostgreSQL Client)  |
   +-----------------------+                   +-----------+-----------+
                                                           |
                                                           v
                                               +-----------------------+
                                               |  Supabase Cloud DB    |
                                               |  (Postgres + RLS)     |
                                               +-----------+-----------+
                                                           |
                                                           | (WebSockets Broadcast)
                                                           v
                                               +-----------------------+
                                               |  RealtimeService      |
                                               |  (Postgres Changes)   |
                                               +-----------------------+
```

---

## 1. Fast Setup Instructions

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a free project.
2. Note your **Project URL** and **anon public key** from `Project Settings` -> `API`.

### Step 2: Run the SQL Migration & Grant Permissions
1. In the Supabase Dashboard, open the **SQL Editor**.
2. Open `supabase/migrations/20261123_init.sql` from this repository.
3. Paste the entire SQL script and click **Run**.
   - This creates 12 relational tables: `departments`, `laboratories`, `equipment`, `users`, `projects`, `booking_requests`, `bookings`, `conflicts`, `maintenance_records`, `notifications`, `audit_logs`, and `engine_weights`.
   - It grants full table permissions to `anon`, `authenticated`, and `service_role` roles for zero-friction evaluator access:
     ```sql
     GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
     GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
     GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
     ```

### Step 3: Enable Supabase Realtime Replication
In the SQL Editor or under **Database** -> **Replication**, add the relevant tables to the `supabase_realtime` publication:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE booking_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE equipment;
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_records;
ALTER PUBLICATION supabase_realtime ADD TABLE conflicts;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

### Step 4: Configure Environment Variables
Create or edit your `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### Step 5: Seed Data into Supabase (Two Options)

#### Option A: Fast CLI Seeder (Recommended)
Run the automated seeding script directly in your terminal:
```bash
npm run seed:supabase
```
This script connects using your `.env` credentials and batch-populates all 128 equipment units, 12 labs, 6 departments, 46 users, and active booking conflict scenarios in seconds.

#### Option B: In-App Admin Seeder
1. Run the dev server: `npm run dev`.
2. Switch to the **Campus Admin** persona in the top navigation bar.
3. Navigate to **Admin Portal** -> **Database & Cloud Backend** tab.
4. Click **"Push Seed Data to Supabase"**.

---

## 2. Table Schema Reference

| Table | Primary Key | Description |
|---|---|---|
| `departments` | `id` (text) | Academic departments (CSE, Mech, Biotech, etc.) |
| `laboratories` | `id` (text) | Departmental facilities with operating hours, safety tiers, and total seat capacity |
| `equipment` | `id` (text) | Specialized instruments with specs, condition, and prerequisites |
| `users` | `id` (text) | Student, Faculty, Lab Manager, and Admin personas |
| `projects` | `id` (text) | Student research and capstone projects |
| `booking_requests` | `id` (text) | Raw allocation requests submitted by students |
| `bookings` | `id` (text) | Confirmed reservation slots scheduled on equipment |
| `conflicts` | `id` (text) | Detected contention cases (including Hero Robotics/AI scenario) |
| `maintenance_records` | `id` (text) | Calibration, repair, and routine maintenance logs |
| `notifications` | `id` (text) | User inbox alerts for approvals and cancellations |
| `audit_logs` | `id` (text) | Tamper-evident ledger of all administrative and engine operations |
| `engine_weights` | `id` (text) | Configurable multi-criteria fair allocation weights |

---

## 3. Realtime Synchronization Across Roles

When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured, LabLink establishes a persistent WebSocket connection via `RealtimeService` (`src/services/realtimeService.ts`):

- **Cross-Role Synchrony**:
  - When **Faculty** approves a booking &rarr; the **Student**'s dashboard updates to "Approved" and calendar populates in real time across browser tabs.
  - When a **Student** submits a new booking request &rarr; the **Faculty Portal** queue immediately reflects the new request.
  - When a **Lab Manager** schedules maintenance or marks equipment as *Maintenance* &rarr; equipment availability changes and student booking validation updates immediately.
  - When a booking is cancelled &rarr; slots are freed, waitlist candidates can be promoted, and calendar schedules clear automatically.
- **TopBar Visual Indicator**:
  - 🟢 **`Supabase (Realtime Live)`**: Connected to cloud PostgreSQL with active WebSocket subscriptions.
  - 🔵 **`LocalStorage DB`**: Operating safely in offline-first deterministic mode.
  - 🟡 **`Supabase (Polling Sync)`**: Connected via REST queries when WebSockets are reconnecting.

---

## 4. Booking Consistency & Pre-Flight Guards

To prevent race conditions, double-bookings, and state inconsistencies, `SupabaseService` executes multi-point pre-flight checks:

1. **`checkSlotAvailability(equipmentId, startTime, endTime)`**:
   - Queries both `bookings` and `maintenance_records` in Supabase.
   - Rejects any requested slot that overlaps with an already-confirmed booking.
   - Rejects any slot overlapping an active maintenance window.
   - Validates that the equipment condition is not currently `maintenance` or `decommissioned`.
2. **`revalidateAndCommitAllocation(decision)`**:
   - Executes an atomic pre-flight validation check against Supabase immediately before committing faculty approval.
   - If an unexpected concurrency collision occurred, transaction aborts cleanly with an error toast rather than creating inconsistent schedules.
3. **Frontend Optimism with Server Reversion**:
   - Optimistically updates UI for zero-latency response.
   - If Supabase rejects the write (e.g. concurrent claim), state automatically rolls back to the persistent remote truth.

---

## 5. Resilience & Graceful Fallback

- If `VITE_SUPABASE_URL` is omitted, LabLink functions seamlessly in local mode with zero console errors.
- If Supabase encounters network timeouts or rate limits, LabLink automatically falls back to local storage and alerts the user via the top bar badge: `[DB Offline (Fallback)]`.
- Evaluators can reset the demo state at any time via the **"Reset Demo"** button or re-seed using `npm run seed:supabase`.

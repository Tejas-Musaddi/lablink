import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { getInitialSeedData } from '../src/data/seedData';

// 1. Manually parse .env file
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const env: Record<string, string> = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
    }
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseAnonKey = env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

console.log(`🔌 Connecting to Supabase at: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('📦 Generating deterministic seed data...');
  const seedData = getInitialSeedData();

  console.log(`- Departments: ${seedData.departments.length}`);
  console.log(`- Laboratories: ${seedData.laboratories.length}`);
  console.log(`- Equipment Units: ${seedData.equipment.length}`);
  console.log(`- Simulated Users: ${seedData.users.length}`);
  console.log(`- Research Projects: ${seedData.projects.length}`);
  console.log(`- Bookings: ${seedData.bookings.length}`);
  console.log(`- Booking Requests: ${seedData.bookingRequests.length}`);
  console.log(`- Conflict Cases: ${seedData.conflicts.length}`);

  // Test connection
  console.log('\n🔍 Testing database connection...');
  const { error: testErr } = await supabase.from('departments').select('id').limit(1);
  if (testErr) {
    console.error(`❌ Database connection failed: ${testErr.message} (Code: ${testErr.code})`);
    console.error('👉 Make sure you ran the SQL migration script in supabase/migrations/20261123_init.sql in your Supabase SQL Editor first!');
    process.exit(1);
  }
  console.log('✅ Connection verified!\n');

  // 1. Departments
  console.log('⏳ Seeding Departments...');
  const deptRows = seedData.departments.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    description: d.description,
    building: d.building,
    head_of_department: d.headOfDepartment,
    total_labs: d.totalLabs,
    color: d.color,
  }));
  const { error: dErr } = await supabase.from('departments').upsert(deptRows);
  if (dErr) throw new Error(`Departments: ${dErr.message}`);
  console.log(`   ✓ ${deptRows.length} departments seeded.`);

  // 2. Laboratories
  console.log('⏳ Seeding Laboratories...');
  const labRows = seedData.laboratories.map((l) => ({
    id: l.id,
    name: l.name,
    code: l.code,
    department_id: l.departmentId,
    room_number: l.roomNumber,
    building: l.building || null,
    manager_id: l.managerId,
    capacity: l.capacity,
    operating_hours: l.operatingHours,
    safety_tier: l.safetyTier,
    contact_email: l.contactEmail,
    image_url: l.imageUrl || null,
  }));
  const { error: lErr } = await supabase.from('laboratories').upsert(labRows);
  if (lErr) throw new Error(`Laboratories: ${lErr.message}`);
  console.log(`   ✓ ${labRows.length} laboratories seeded.`);

  // 3. Equipment (batch chunks of 40)
  console.log('⏳ Seeding Equipment Units...');
  const equipRows = seedData.equipment.map((e) => ({
    id: e.id,
    name: e.name,
    code: e.code,
    category_id: e.categoryId,
    department_id: e.departmentId,
    lab_id: e.labId,
    description: e.description,
    specs: e.specs || {},
    condition: e.condition,
    availability: e.availability,
    prerequisites: e.prerequisites || [],
    qr_code_id: e.qrCodeId,
    hourly_operating_cost: e.hourlyOperatingCost || null,
    replacement_cost: e.replacementCost || null,
    max_booking_hours_per_slot: e.maxBookingHoursPerSlot,
    location_details: e.locationDetails,
    serial_number: e.serialNumber,
    total_hours_logged: e.totalHoursLogged,
    last_maintenance_date: e.lastMaintenanceDate,
    next_maintenance_date: e.nextMaintenanceDate,
    equivalent_equipment_ids: e.equivalentEquipmentIds || [],
    svg_icon_type: e.svgIconType || null,
  }));

  for (let i = 0; i < equipRows.length; i += 40) {
    const chunk = equipRows.slice(i, i + 40);
    const { error: eErr } = await supabase.from('equipment').upsert(chunk);
    if (eErr) throw new Error(`Equipment batch [${i}-${i + chunk.length}]: ${eErr.message}`);
    console.log(`   ✓ Seeded equipment ${i + 1} to ${Math.min(i + 40, equipRows.length)}...`);
  }

  // 4. Users
  console.log('⏳ Seeding Users...');
  const userRows = seedData.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    department_id: u.departmentId,
    avatar_url: u.avatarUrl || null,
    prior_usage_hours: u.priorUsageHours,
    completed_trainings: u.completedTrainings || [],
    active_project_ids: u.activeProjectIds || [],
  }));
  const { error: uErr } = await supabase.from('users').upsert(userRows);
  if (uErr) throw new Error(`Users: ${uErr.message}`);
  console.log(`   ✓ ${userRows.length} users seeded.`);

  // 5. Projects
  console.log('⏳ Seeding Projects...');
  const projectRows = seedData.projects.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    department_id: p.departmentId,
    lead_student_id: p.leadStudentId,
    team_members: p.teamMembers || [],
    faculty_supervisor_id: p.facultySupervisorId,
    deadline: p.deadline,
    priority: p.priority,
    status: p.status,
    required_equipment_categories: p.requiredEquipmentCategories || [],
    attached_requirements: p.attachedRequirements || [],
    created_at: p.createdAt,
  }));
  const { error: pErr } = await supabase.from('projects').upsert(projectRows);
  if (pErr) throw new Error(`Projects: ${pErr.message}`);
  console.log(`   ✓ ${projectRows.length} projects seeded.`);

  // 6. Booking Requests
  console.log('⏳ Seeding Booking Requests...');
  const reqRows = seedData.bookingRequests.map((br) => ({
    id: br.id,
    project_id: br.projectId,
    user_id: br.userId,
    equipment_id: br.equipmentId,
    start_time: br.startTime,
    end_time: br.endTime,
    purpose: br.purpose,
    created_at: br.createdAt,
    status: br.status,
    urgency_score: br.urgencyScore || null,
    allocated_slot: br.allocatedSlot || null,
    rejection_reason: br.rejectionReason || null,
    faculty_comment: br.facultyComment || null,
  }));
  const { error: brErr } = await supabase.from('booking_requests').upsert(reqRows);
  if (brErr) throw new Error(`Booking Requests: ${brErr.message}`);
  console.log(`   ✓ ${reqRows.length} booking requests seeded.`);

  // 7. Bookings
  console.log('⏳ Seeding Bookings...');
  const bookingRows = seedData.bookings.map((b) => ({
    id: b.id,
    request_id: b.requestId,
    project_id: b.projectId,
    user_id: b.userId,
    equipment_id: b.equipmentId,
    lab_id: b.labId,
    start_time: b.startTime,
    end_time: b.endTime,
    status: b.status,
    checked_in_at: b.checkedInAt || null,
    checked_out_at: b.checkedOutAt || null,
    notes: b.notes || null,
    created_at: b.createdAt,
  }));
  const { error: bErr } = await supabase.from('bookings').upsert(bookingRows);
  if (bErr) throw new Error(`Bookings: ${bErr.message}`);
  console.log(`   ✓ ${bookingRows.length} bookings seeded.`);

  // 8. Conflicts
  console.log('⏳ Seeding Conflict Cases...');
  const conflictRows = seedData.conflicts.map((c) => ({
    id: c.id,
    title: c.title,
    equipment_id: c.equipmentId,
    equipment_name: c.equipmentName,
    contending_request_ids: c.contendingRequestIds || [],
    detected_at: c.detectedAt,
    status: c.status,
    target_window: c.targetWindow,
    resolution: c.resolution || null,
    is_hero_scenario: Boolean(c.isHeroScenario),
  }));
  const { error: cErr } = await supabase.from('conflicts').upsert(conflictRows);
  if (cErr) throw new Error(`Conflicts: ${cErr.message}`);
  console.log(`   ✓ ${conflictRows.length} conflict cases seeded.`);

  // 9. Maintenance
  console.log('⏳ Seeding Maintenance Records...');
  const maintRows = seedData.maintenanceRecords.map((m) => ({
    id: m.id,
    equipment_id: m.equipmentId,
    lab_id: m.labId,
    title: m.title,
    description: m.description,
    scheduled_start: m.scheduledStart,
    scheduled_end: m.scheduledEnd,
    performed_by: m.performedBy,
    type: m.type,
    status: m.status,
    cost: m.cost || null,
  }));
  const { error: mErr } = await supabase.from('maintenance_records').upsert(maintRows);
  if (mErr) throw new Error(`Maintenance: ${mErr.message}`);
  console.log(`   ✓ ${maintRows.length} maintenance records seeded.`);

  // 10. Notifications
  console.log('⏳ Seeding Notifications...');
  const notifRows = seedData.notifications.map((n) => ({
    id: n.id,
    user_id: n.userId,
    title: n.title,
    message: n.message,
    type: n.type,
    read: n.read,
    action_url: n.actionUrl || null,
    created_at: n.createdAt,
  }));
  const { error: nErr } = await supabase.from('notifications').upsert(notifRows);
  if (nErr) throw new Error(`Notifications: ${nErr.message}`);
  console.log(`   ✓ ${notifRows.length} notifications seeded.`);

  // 11. Audit Logs
  console.log('⏳ Seeding Audit Logs...');
  const auditRows = seedData.auditLogs.map((a) => ({
    id: a.id,
    timestamp: a.timestamp,
    actor_id: a.actorId,
    actor_name: a.actorName,
    actor_role: a.actorRole,
    action: a.action,
    entity_type: a.entityType,
    entity_id: a.entityId,
    details: a.details,
  }));
  const { error: aErr } = await supabase.from('audit_logs').upsert(auditRows);
  if (aErr) throw new Error(`Audit Logs: ${aErr.message}`);
  console.log(`   ✓ ${auditRows.length} audit logs seeded.`);

  // 12. Engine Weights
  console.log('⏳ Seeding Engine Weights...');
  const { error: wErr } = await supabase.from('engine_weights').upsert([
    {
      id: 'default',
      deadline_urgency: seedData.engineWeights.deadlineUrgency,
      project_priority: seedData.engineWeights.projectPriority,
      waiting_time: seedData.engineWeights.waitingTime,
      usage_fairness: seedData.engineWeights.usageFairness,
      requirement_criticality: seedData.engineWeights.requirementCriticality,
      updated_at: new Date().toISOString(),
    },
  ]);
  if (wErr) throw new Error(`Engine Weights: ${wErr.message}`);
  console.log(`   ✓ Default engine weights configured.`);

  console.log('\n🎉 ALL SUPABASE TABLES SUCCESSFULLY POPULATED!');
}

main().catch((err) => {
  console.error('\n❌ Seeding failed:', err.message);
  process.exit(1);
});

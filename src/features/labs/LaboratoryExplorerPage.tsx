import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Department, Laboratory, Equipment } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import { EquipmentDetailDrawer } from '../discovery/EquipmentDetailDrawer';
import { BookingRequestModal } from '../discovery/BookingRequestModal';
import {
  Building2,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Cpu,
  Mail,
  Wrench,
  Search,
  Table,
  LayoutGrid,
  CheckCircle2,
} from 'lucide-react';

export const LaboratoryExplorerPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { departments, laboratories, equipment, deptMap, bookings } = useAppStore();

  const [explorerView, setExplorerView] = useState<'cards' | 'table'>('cards');
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(
    searchParams.get('lab') || null
  );

  // Drawer & Booking Modal
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [equipmentToBook, setEquipmentToBook] = useState<Equipment | null>(null);

  // If a lab is selected, retrieve it
  const activeLab = laboratories.find((l) => l.id === selectedLabId);
  const activeDept = activeLab ? deptMap[activeLab.departmentId] : departments.find((d) => d.id === selectedDeptId);

  // Equipment in active lab
  const labEquipment = equipment.filter((e) => e.labId === selectedLabId);
  const availableCount = labEquipment.filter((e) => e.availability === 'available').length;
  const inUseCount = labEquipment.filter((e) => e.availability === 'in_use').length;
  const maintenanceCount = labEquipment.filter((e) => e.availability === 'under_maintenance').length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
          <button
            type="button"
            onClick={() => {
              setSelectedDeptId(null);
              setSelectedLabId(null);
            }}
            className="hover:text-primary-600 transition-colors"
          >
            All Departments
          </button>
          {activeDept && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                type="button"
                onClick={() => {
                  setSelectedDeptId(activeDept.id);
                  setSelectedLabId(null);
                }}
                className={`hover:text-primary-600 transition-colors ${
                  !activeLab ? 'font-bold text-navy-900' : ''
                }`}
              >
                {activeDept.name}
              </button>
            </>
          )}
          {activeLab && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-navy-900">{activeLab.name}</span>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy-900">
              {activeLab ? activeLab.name : activeDept ? `${activeDept.name} Facilities` : 'Campus Laboratory Explorer'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {activeLab
                ? `Specialized research facility housing ${labEquipment.length} instruments in ${activeLab.building}`
                : activeDept
                ? activeDept.description
                : 'Drill down through academic departments, discover specialized labs, and view facility operating schedules.'}
            </p>
          </div>

          {(selectedLabId || selectedDeptId) && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={() => {
                if (selectedLabId) {
                  setSelectedLabId(null);
                } else {
                  setSelectedDeptId(null);
                }
              }}
            >
              Back
            </Button>
          )}
        </div>
      </div>

      {/* View Switcher: Department Cards vs Live Seat Capacity Table */}
      {!selectedDeptId && !selectedLabId && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Explorer View:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setExplorerView('cards')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  explorerView === 'cards'
                    ? 'bg-white text-navy-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Department Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setExplorerView('table')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  explorerView === 'table'
                    ? 'bg-white text-navy-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                <Table className="w-3.5 h-3.5 text-primary-600" />
                <span>Live Seat & Capacity Table ({laboratories.length} Labs)</span>
              </button>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">
            Real-time seat occupancy computed from active reservations
          </span>
        </div>
      )}

      {/* VIEW 1A: Live Laboratory Seat & Capacity Table */}
      {!selectedDeptId && !selectedLabId && explorerView === 'table' && (
        <Card className="overflow-hidden shadow-card">
          <CardHeader className="bg-slate-50/70 p-4 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-600" />
                Campus Laboratory Seat Occupancy & Real-Time Availability
              </CardTitle>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Live seating capacity, current active reservations, and free workstation counts across all university departments.
              </p>
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 border-b border-surface-border">
                <tr>
                  <th className="p-3">Laboratory Facility</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Room & Building</th>
                  <th className="p-3 text-center">Total Seats</th>
                  <th className="p-3 text-center">Occupied Now</th>
                  <th className="p-3 text-center">Free Seats Available</th>
                  <th className="p-3 text-center">Equipment Free</th>
                  <th className="p-3">Operating Hours</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {laboratories.map((lab) => {
                  const dept = deptMap[lab.departmentId];
                  const labEq = equipment.filter((e) => e.labId === lab.id);
                  const freeEq = labEq.filter((e) => e.availability === 'available').length;
                  
                  // Active confirmed reservations
                  const activeLabBookings = bookings.filter(
                    (b) => b.labId === lab.id && b.status === 'confirmed'
                  );
                  const occupiedSeats = activeLabBookings.length;
                  const freeSeats = Math.max(0, lab.capacity - occupiedSeats);

                  return (
                    <tr key={lab.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-navy-900">{lab.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-400">{lab.code}</span>
                          <span className="text-[10px] text-slate-300">•</span>
                          <span className="text-[10px] text-primary-600 font-medium">Safety Tier {lab.safetyTier}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 font-medium">{dept?.name || 'Engineering'}</td>
                      <td className="p-3 text-slate-600">
                        <div>Room {lab.roomNumber}</div>
                        <div className="text-[11px] text-slate-400">{lab.building}</div>
                      </td>
                      <td className="p-3 text-center font-bold text-navy-900">
                        {lab.capacity} seats
                      </td>
                      <td className="p-3 text-center text-slate-600">
                        <span className="font-semibold text-amber-700">{occupiedSeats} active</span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            freeSeats > 5
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : freeSeats > 0
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${freeSeats > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {freeSeats} Free {freeSeats === 1 ? 'Seat' : 'Seats'}
                        </span>
                      </td>
                      <td className="p-3 text-center font-medium text-slate-600">
                        {freeEq} / {labEq.length}
                      </td>
                      <td className="p-3 text-slate-600">
                        <div>{lab.operatingHours.open} - {lab.operatingHours.close}</div>
                        <div className="text-[10px] text-emerald-600 font-medium">Open Mon–Fri</div>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLabId(lab.id)}
                          className="text-[11px] h-7"
                          rightIcon={<ChevronRight className="w-3 h-3" />}
                        >
                          Explore Lab
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* VIEW 1B: All Departments Overview (Cards) */}
      {!selectedDeptId && !selectedLabId && explorerView === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => {
            const deptLabs = laboratories.filter((l) => l.departmentId === dept.id);
            const deptEquipmentCount = equipment.filter((e) => e.departmentId === dept.id).length;

            return (
              <Card
                key={dept.id}
                hoverable
                className="cursor-pointer overflow-hidden flex flex-col justify-between group"
                onClick={() => setSelectedDeptId(dept.id)}
              >
                <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded border border-primary-200">
                      {dept.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {deptLabs.length} Labs
                    </span>
                  </div>
                  <CardTitle className="mt-2 text-base group-hover:text-primary-600 transition-colors">
                    {dept.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 pt-3">
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {dept.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{dept.building}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">HOD: {dept.headOfDepartment}</span>
                    </div>
                  </div>

                  {/* Labs preview list */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Featured Facilities
                    </span>
                    <ul className="space-y-1">
                      {deptLabs.map((l) => (
                        <li key={l.id} className="text-xs text-navy-800 font-medium flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-primary-500" />
                          <span className="truncate">{l.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-primary-600 group-hover:text-primary-700">
                  <span>{deptEquipmentCount} equipment units</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Department Drill-Down (List Labs in Department) */}
      {selectedDeptId && !selectedLabId && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {laboratories
              .filter((l) => l.departmentId === selectedDeptId)
              .map((lab) => {
                const labEq = equipment.filter((e) => e.labId === lab.id);
                const avail = labEq.filter((e) => e.availability === 'available').length;

                return (
                  <Card
                    key={lab.id}
                    hoverable
                    className="cursor-pointer overflow-hidden group"
                    onClick={() => setSelectedLabId(lab.id)}
                  >
                    <CardHeader className="bg-slate-50 pb-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-navy-700">
                          {lab.code}
                        </span>
                        <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                          {avail} / {labEq.length} Available Now
                        </span>
                      </div>
                      <CardTitle className="text-base mt-1 group-hover:text-primary-600 transition-colors">
                        {lab.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-3">
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                            Room & Building
                          </span>
                          <span className="font-semibold text-navy-900">
                            {lab.roomNumber} ({lab.building})
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                            Capacity
                          </span>
                          <span className="font-semibold text-navy-900">
                            {lab.capacity} researchers
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                            Hours
                          </span>
                          <span>
                            {lab.operatingHours.open} - {lab.operatingHours.close}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                            Safety Tier
                          </span>
                          <span className="font-semibold text-navy-900">
                            Tier {lab.safetyTier}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs text-primary-600 font-semibold group-hover:underline">
                        <span>Explore {labEq.length} Instruments</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* VIEW 3: Specific Laboratory Equipment Drill-Down */}
      {activeLab && (
        <div className="space-y-6">
          {/* Facility Highlights Banner */}
          <div className="rounded-card border border-surface-border bg-white p-5 shadow-card grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="border-r border-slate-100 pr-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Apparatus
              </span>
              <span className="text-2xl font-black text-navy-900">{labEquipment.length}</span>
            </div>
            <div className="border-r border-slate-100 pr-3">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                Available Now
              </span>
              <span className="text-2xl font-black text-emerald-600">{availableCount}</span>
            </div>
            <div className="border-r border-slate-100 pr-3">
              <span className="text-[10px] uppercase font-bold text-blue-600 block">
                Active In-Use
              </span>
              <span className="text-2xl font-black text-blue-600">{inUseCount}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-600 block">
                Maintenance
              </span>
              <span className="text-2xl font-black text-amber-600">{maintenanceCount}</span>
            </div>
          </div>

          {/* Equipment Table in this Lab */}
          <div className="rounded-card border border-surface-border bg-white shadow-card overflow-hidden">
            <div className="p-4 border-b border-surface-border bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-900">
                Equipment Inventory in {activeLab.name}
              </h3>
              <span className="text-xs text-slate-500">
                Contact: <a href={`mailto:${activeLab.contactEmail}`} className="text-primary-600 underline">{activeLab.contactEmail}</a>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 border-b border-surface-border">
                  <tr>
                    <th className="p-3">Asset Code</th>
                    <th className="p-3">Equipment Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Availability</th>
                    <th className="p-3">Condition</th>
                    <th className="p-3">Bench Location</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {labEquipment.map((eq) => (
                    <tr key={eq.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 font-mono font-bold text-primary-700">
                        {eq.code}
                      </td>
                      <td className="p-3 font-semibold text-navy-900 max-w-xs truncate">
                        {eq.name}
                      </td>
                      <td className="p-3 text-slate-600">{eq.categoryId}</td>
                      <td className="p-3">
                        <StatusChip status={eq.availability} size="sm" />
                      </td>
                      <td className="p-3">
                        <StatusChip status={eq.condition} size="sm" />
                      </td>
                      <td className="p-3 text-slate-500">{eq.locationDetails}</td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEquipment(eq);
                            setDrawerOpen(true);
                          }}
                          className="text-[11px] h-7"
                        >
                          Specs
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setEquipmentToBook(eq);
                            setBookingModalOpen(true);
                          }}
                          className="text-[11px] h-7"
                        >
                          Book
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      <EquipmentDetailDrawer
        equipment={selectedEquipment}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onRequestBooking={(eq) => {
          setEquipmentToBook(eq);
          setBookingModalOpen(true);
        }}
      />

      {/* Booking Modal */}
      <BookingRequestModal
        equipment={equipmentToBook}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />
    </div>
  );
};

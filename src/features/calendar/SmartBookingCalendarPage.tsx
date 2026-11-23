import React, { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAppStore } from '../../store/useAppStore';
import { Booking, MaintenanceRecord, Equipment } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { StatusChip } from '../../components/ui/StatusChip';
import { BookingRequestModal } from '../discovery/BookingRequestModal';
import {
  CalendarDays,
  Clock,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  List,
  Calendar,
  XCircle,
  Filter,
} from 'lucide-react';
import { formatDateTime, formatDate, formatTimeOnly } from '../../lib/utils';

export const SmartBookingCalendarPage: React.FC = () => {
  const {
    bookings,
    bookingRequests,
    maintenanceRecords,
    equipment,
    laboratories,
    equipmentMap,
    projectMap,
    cancelBooking,
    rescheduleBooking,
  } = useAppStore();

  const [selectedEqId, setSelectedEqId] = useState<string>('ALL');
  const [selectedLabId, setSelectedLabId] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Selected Booking Details Modal
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // New Slot Booking Modal from calendar selection
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [preselectedEquipment, setPreselectedEquipment] = useState<Equipment | null>(null);
  const [preselectedStart, setPreselectedStart] = useState<string>('');
  const [preselectedEnd, setPreselectedEnd] = useState<string>('');

  // Build Calendar Events
  const events = useMemo(() => {
    const list: any[] = [];

    // Confirmed Bookings
    bookings.forEach((b) => {
      if (selectedEqId !== 'ALL' && b.equipmentId !== selectedEqId) return;
      if (selectedLabId !== 'ALL' && b.labId !== selectedLabId) return;
      if (b.status === 'cancelled') return;

      const eq = equipmentMap[b.equipmentId];
      const proj = projectMap[b.projectId];

      list.push({
        id: b.id,
        title: `${eq?.code || b.equipmentId}: ${proj?.title || 'Session'}`,
        start: b.startTime,
        end: b.endTime,
        backgroundColor: b.status === 'confirmed' ? '#2563EB' : '#10B981',
        borderColor: '#1D4ED8',
        textColor: '#FFFFFF',
        extendedProps: {
          type: 'booking',
          rawBooking: b,
        },
      });
    });

    // Maintenance Records
    maintenanceRecords.forEach((m) => {
      if (selectedEqId !== 'ALL' && m.equipmentId !== selectedEqId) return;
      if (selectedLabId !== 'ALL' && m.labId !== selectedLabId) return;

      const eq = equipmentMap[m.equipmentId];
      list.push({
        id: m.id,
        title: `[MAINTENANCE] ${eq?.code || m.equipmentId}: ${m.title}`,
        start: m.scheduledStart,
        end: m.scheduledEnd,
        backgroundColor: '#F59E0B',
        borderColor: '#D97706',
        textColor: '#FFFFFF',
        extendedProps: {
          type: 'maintenance',
          rawMaintenance: m,
        },
      });
    });

    return list;
  }, [bookings, maintenanceRecords, selectedEqId, selectedLabId, equipmentMap, projectMap]);

  // Handle Event Click
  const handleEventClick = (info: any) => {
    const { extendedProps } = info.event;
    if (extendedProps.type === 'booking') {
      setActiveBooking(extendedProps.rawBooking);
      setIsDetailModalOpen(true);
    }
  };

  // Handle Date / Slot Selection (drag select or click empty slot)
  const handleDateSelect = (selectInfo: any) => {
    const defaultEq =
      selectedEqId !== 'ALL'
        ? equipmentMap[selectedEqId]
        : equipment.find((e) => e.id === 'eq-gpu---ai-workstations-001') || equipment[0];

    setPreselectedEquipment(defaultEq || null);
    setPreselectedStart(selectInfo.startStr);
    setPreselectedEnd(selectInfo.endStr);
    setBookingModalOpen(true);
  };

  // Handle Drag & Drop Reschedule
  const handleEventDrop = (dropInfo: any) => {
    const { extendedProps } = dropInfo.event;
    if (extendedProps.type === 'booking') {
      const b = extendedProps.rawBooking as Booking;
      rescheduleBooking(b.id, dropInfo.event.startStr, dropInfo.event.endStr);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Smart Booking & Allocation Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time multi-lab scheduling matrix. Drag to select slots, inspect maintenance windows, and manage reservations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Calendar / Accessible List View Toggle */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Accessible List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="rounded-card border border-surface-border bg-white p-4 shadow-card grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Filter by Laboratory
          </label>
          <select
            value={selectedLabId}
            onChange={(e) => setSelectedLabId(e.target.value)}
            className="w-full text-xs rounded-lg border border-surface-border bg-white px-2.5 py-1.5 text-navy-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="ALL">All Laboratories</option>
            {laboratories.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Filter by Specific Equipment Unit
          </label>
          <select
            value={selectedEqId}
            onChange={(e) => setSelectedEqId(e.target.value)}
            className="w-full text-xs rounded-lg border border-surface-border bg-white px-2.5 py-1.5 text-navy-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="ALL">All Equipment Units</option>
            {equipment.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.code} - {eq.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex items-center gap-3 text-xs text-slate-600 pb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-600" />
              Confirmed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Maintenance
            </span>
          </div>
        </div>
      </div>

      {/* VIEW: FullCalendar View */}
      {viewMode === 'calendar' ? (
        <Card className="p-4 shadow-card bg-white overflow-hidden">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            initialDate="2026-11-23"
            events={events}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            slotMinTime="08:00:00"
            slotMaxTime="22:00:00"
            height="auto"
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            slotDuration="01:00:00"
          />
        </Card>
      ) : (
        /* VIEW: Accessible List View (WCAG 2.2 AA) */
        <Card className="overflow-hidden shadow-card">
          <CardHeader className="bg-slate-50 p-4 border-b border-surface-border">
            <CardTitle className="text-sm font-bold text-navy-900">
              Upcoming Schedule (Accessible List View)
            </CardTitle>
          </CardHeader>
          <div className="divide-y divide-slate-100">
            {events.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No scheduled sessions matching the active filter.
              </div>
            ) : (
              events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-navy-900 block">
                      {ev.title}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatDateTime(ev.start)} – {formatDateTime(ev.end)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white uppercase text-[10px]"
                      style={{ backgroundColor: ev.backgroundColor }}
                    >
                      {ev.extendedProps.type}
                    </span>
                    {ev.extendedProps.type === 'booking' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveBooking(ev.extendedProps.rawBooking);
                          setIsDetailModalOpen(true);
                        }}
                        className="text-xs h-7"
                      >
                        Inspect
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Booking Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Reservation Details"
        size="sm"
      >
        {activeBooking && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg space-y-1 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Equipment
              </span>
              <span className="font-bold text-navy-900 block">
                {equipmentMap[activeBooking.equipmentId]?.name || activeBooking.equipmentId}
              </span>
              <span className="text-slate-500 block font-mono">
                {equipmentMap[activeBooking.equipmentId]?.code}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Time Window
              </span>
              <span className="font-semibold text-navy-800">
                {formatDateTime(activeBooking.startTime)} – {formatDateTime(activeBooking.endTime)}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Status
              </span>
              <StatusChip status={activeBooking.status} size="sm" />
            </div>

            {activeBooking.notes && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Session Notes
                </span>
                <p className="text-slate-600 mt-0.5">{activeBooking.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-surface-border">
              <Button
                variant="danger"
                size="sm"
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
                onClick={() => {
                  cancelBooking(activeBooking.id);
                  setIsDetailModalOpen(false);
                }}
              >
                Cancel Session
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Pre-populated Booking Request Modal */}
      <BookingRequestModal
        equipment={preselectedEquipment}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />
    </div>
  );
};

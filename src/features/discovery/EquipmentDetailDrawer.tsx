import React from 'react';
import { Equipment } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { Drawer } from '../../components/ui/Drawer';
import { StatusChip } from '../../components/ui/StatusChip';
import { Button } from '../../components/ui/Button';
import {
  MapPin,
  Clock,
  QrCode,
  ShieldAlert,
  CheckCircle2,
  CalendarPlus,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface EquipmentDetailDrawerProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestBooking: (eq: Equipment) => void;
  onSelectAlternative?: (eq: Equipment) => void;
}

export const EquipmentDetailDrawer: React.FC<EquipmentDetailDrawerProps> = ({
  equipment,
  isOpen,
  onClose,
  onRequestBooking,
  onSelectAlternative,
}) => {
  const { labMap, deptMap, currentUser, equipmentMap } = useAppStore();

  if (!equipment) return null;

  const lab = labMap[equipment.labId];
  const dept = deptMap[equipment.departmentId];

  // User safety qualifications check
  const missingPrereqs = (equipment.prerequisites || []).filter(
    (p) => !currentUser.completedTrainings.includes(p)
  );

  const alternativeUnits = (equipment.equivalentEquipmentIds || [])
    .map((id) => equipmentMap[id])
    .filter(Boolean);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={equipment.name}
      description={`Asset Tag: ${equipment.code} • ${equipment.categoryId}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Status Chips and Basic Metadata */}
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-surface-border">
          <StatusChip status={equipment.availability} size="md" />
          <StatusChip status={equipment.condition} size="md" />
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium border border-slate-200">
            {dept?.name || 'Department'}
          </span>
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium border border-slate-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            Max {equipment.maxBookingHoursPerSlot}h / slot
          </span>
        </div>

        {/* Location & Facility Information */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-navy-800 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary-600" />
            Location & Facility Access
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 mt-2">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Laboratory
              </span>
              <span className="font-semibold text-navy-900">{lab?.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Room & Bay
              </span>
              <span className="font-semibold text-navy-900">
                {lab?.roomNumber} • {equipment.locationDetails}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Operating Hours
              </span>
              <span>
                {lab?.operatingHours.open} - {lab?.operatingHours.close} (Mon - Sat)
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Safety Tier
              </span>
              <span className="font-semibold text-navy-900">
                Tier {lab?.safetyTier} ({lab?.safetyTier === 1 ? 'General' : lab?.safetyTier === 2 ? 'Trained' : 'Hazardous'})
              </span>
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-navy-800 mb-2">
            Technical Specifications
          </h4>
          <div className="rounded-xl border border-surface-border overflow-hidden bg-white">
            <table className="w-full text-xs text-left">
              <tbody className="divide-y divide-slate-100">
                {Object.entries(equipment.specs).map(([specKey, specVal]) => (
                  <tr key={specKey} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-medium text-slate-500 w-1/3 bg-slate-50/60">
                      {specKey}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-navy-900">
                      {specVal}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-500 bg-slate-50/60">
                    Serial Number
                  </td>
                  <td className="px-4 py-2.5 font-mono text-navy-800">
                    {equipment.serialNumber}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-500 bg-slate-50/60">
                    Total Hours Logged
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-navy-800">
                    {equipment.totalHoursLogged} hours
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-500 bg-slate-50/60">
                    Next Maintenance Due
                  </td>
                  <td className="px-4 py-2.5 text-navy-800">
                    {formatDate(equipment.nextMaintenanceDate)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* User Qualification Verification */}
        <div className="rounded-xl p-4 border transition-colors bg-white border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-primary-600" />
              Safety Prerequisites & Eligibility
            </h4>
            <span className="text-[11px] text-slate-400">
              Evaluated for: <strong>{currentUser.name}</strong>
            </span>
          </div>

          {missingPrereqs.length === 0 ? (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>You meet all safety prerequisites and training protocols for this hardware.</span>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-amber-50 text-amber-800 text-xs border border-amber-200 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                Missing Required Safety Certifications:
              </div>
              <ul className="list-disc list-inside text-[11px] text-amber-700 pl-1 space-y-0.5">
                {missingPrereqs.map((prereq) => (
                  <li key={prereq}>{prereq}</li>
                ))}
              </ul>
              <p className="text-[10px] text-amber-600 pt-1">
                Notice: The allocation engine will flag this request as infeasible until certifications are verified by the Lab Manager.
              </p>
            </div>
          )}
        </div>

        {/* QR Code Identification Card */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Physical Check-In QR ID
            </span>
            <div className="font-mono text-xs font-bold text-navy-900 mt-0.5">
              {equipment.qrCodeId}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Used for instant session check-in / check-out at the physical bench terminal.
            </p>
          </div>
          <div className="h-16 w-16 bg-white p-2 rounded-lg border border-slate-300 shadow-2xs flex items-center justify-center">
            <QrCode className="w-12 h-12 text-navy-900" />
          </div>
        </div>

        {/* Equivalent Alternative Equipment */}
        {alternativeUnits.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-800 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Recommended Alternative Equipment
            </h4>
            <div className="space-y-2">
              {alternativeUnits.map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => onSelectAlternative && onSelectAlternative(alt)}
                  className="flex items-center justify-between p-3 rounded-xl border border-surface-border bg-white hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer group shadow-2xs"
                >
                  <div>
                    <h5 className="text-xs font-bold text-navy-900 group-hover:text-primary-600 transition-colors">
                      {alt.name}
                    </h5>
                    <span className="text-[11px] text-slate-500">
                      {alt.code} • {alt.availability}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary Booking Call-to-Action */}
        <div className="pt-4 border-t border-surface-border flex items-center justify-between">
          <Button variant="outline" size="md" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<CalendarPlus className="w-4 h-4" />}
            onClick={() => {
              onClose();
              onRequestBooking(equipment);
            }}
          >
            Request Booking Slot
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

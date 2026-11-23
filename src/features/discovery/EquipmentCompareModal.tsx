import React from 'react';
import { Equipment } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import { X, CalendarPlus, Check, AlertCircle } from 'lucide-react';

interface EquipmentCompareModalProps {
  equipmentList: Equipment[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem: (id: string) => void;
  onRequestBooking: (eq: Equipment) => void;
}

export const EquipmentCompareModal: React.FC<EquipmentCompareModalProps> = ({
  equipmentList,
  isOpen,
  onClose,
  onRemoveItem,
  onRequestBooking,
}) => {
  const { labMap, deptMap, currentUser } = useAppStore();

  if (!isOpen || equipmentList.length === 0) return null;

  // Aggregate all unique spec keys across compared items
  const allSpecKeys = Array.from(
    new Set(equipmentList.flatMap((e) => Object.keys(e.specs)))
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Compare Equipment (${equipmentList.length} items)`}
      description="Side-by-side specifications, facility operating policies, and safety requirements."
      size="full"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="p-3 text-left font-bold text-slate-400 w-48 uppercase tracking-wider bg-slate-50">
                Attribute
              </th>
              {equipmentList.map((eq) => (
                <th key={eq.id} className="p-3 text-left w-72 min-w-64 bg-white align-top">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-primary-600 font-bold block">
                        {eq.code}
                      </span>
                      <h4 className="text-sm font-bold text-navy-900 mt-0.5 line-clamp-2">
                        {eq.name}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(eq.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label="Remove item"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <StatusChip status={eq.availability} size="sm" />
                    <StatusChip status={eq.condition} size="sm" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Department & Lab */}
            <tr>
              <td className="p-3 font-semibold text-slate-500 bg-slate-50">Department</td>
              {equipmentList.map((eq) => (
                <td key={eq.id} className="p-3 text-navy-800">
                  {deptMap[eq.departmentId]?.name || 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-500 bg-slate-50">Lab & Location</td>
              {equipmentList.map((eq) => (
                <td key={eq.id} className="p-3 text-navy-800">
                  {labMap[eq.labId]?.name} ({labMap[eq.labId]?.roomNumber})
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-500 bg-slate-50">Max Slot Duration</td>
              {equipmentList.map((eq) => (
                <td key={eq.id} className="p-3 font-bold text-navy-900">
                  {eq.maxBookingHoursPerSlot} hours / session
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-500 bg-slate-50">Prerequisites Check</td>
              {equipmentList.map((eq) => {
                const missing = (eq.prerequisites || []).filter(
                  (p) => !currentUser.completedTrainings.includes(p)
                );
                return (
                  <td key={eq.id} className="p-3">
                    {missing.length === 0 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <Check className="w-3.5 h-3.5" /> Certified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> Missing {missing.length} credential(s)
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Spec Attributes */}
            {allSpecKeys.map((key) => (
              <tr key={key}>
                <td className="p-3 font-semibold text-slate-500 bg-slate-50 capitalize">
                  {key}
                </td>
                {equipmentList.map((eq) => (
                  <td key={eq.id} className="p-3 font-medium text-navy-900">
                    {eq.specs[key] || '—'}
                  </td>
                ))}
              </tr>
            ))}

            {/* Action Row */}
            <tr className="bg-slate-50/50">
              <td className="p-3 font-semibold text-slate-400">Action</td>
              {equipmentList.map((eq) => (
                <td key={eq.id} className="p-3">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CalendarPlus className="w-3.5 h-3.5" />}
                    onClick={() => {
                      onClose();
                      onRequestBooking(eq);
                    }}
                    className="w-full"
                  >
                    Book This
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

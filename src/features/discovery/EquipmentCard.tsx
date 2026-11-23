import React from 'react';
import { Equipment, Department, Laboratory } from '../../types';
import { Card, CardContent, CardFooter } from '../../components/ui/Card';
import { StatusChip } from '../../components/ui/StatusChip';
import { Button } from '../../components/ui/Button';
import {
  Cpu,
  Layers,
  MapPin,
  Clock,
  ShieldAlert,
  ArrowRight,
  GitCompare,
  CalendarPlus,
} from 'lucide-react';

interface EquipmentCardProps {
  equipment: Equipment;
  department?: Department;
  laboratory?: Laboratory;
  onViewDetails: (eq: Equipment) => void;
  onRequestBooking: (eq: Equipment) => void;
  onToggleCompare?: (eq: Equipment) => void;
  isCompared?: boolean;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  department,
  laboratory,
  onViewDetails,
  onRequestBooking,
  onToggleCompare,
  isCompared = false,
}) => {
  // SVG Graphic placeholder based on category
  const renderThumbnail = () => {
    return (
      <div className="relative h-40 w-full overflow-hidden rounded-t-card bg-gradient-to-br from-navy-900 to-navy-800 p-4 flex flex-col justify-between text-white border-b border-navy-700">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase bg-white/10 px-2 py-0.5 rounded backdrop-blur-xs border border-white/20">
            {equipment.code}
          </span>
          <StatusChip status={equipment.availability} size="sm" />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-white/10 p-2.5 backdrop-blur-xs flex items-center justify-center border border-white/15">
            <Cpu className="w-7 h-7 text-primary-400" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-medium text-slate-300 block truncate">
              {equipment.categoryId}
            </span>
            <span className="text-xs text-white/80 block truncate">
              {laboratory?.name || 'Main Lab Facility'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-300 border-t border-white/10 pt-2">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-primary-400" />
            {laboratory?.roomNumber || 'Room TBA'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            Max {equipment.maxBookingHoursPerSlot}h/slot
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card hoverable className="flex flex-col justify-between overflow-hidden group">
      <div>
        {renderThumbnail()}

        <CardContent className="p-4 space-y-3">
          <div>
            <h4
              onClick={() => onViewDetails(equipment)}
              className="text-sm font-bold text-navy-900 line-clamp-2 cursor-pointer hover:text-primary-600 transition-colors"
              title={equipment.name}
            >
              {equipment.name}
            </h4>
            <p className="text-xs text-slate-500 line-clamp-2 mt-1">
              {equipment.description}
            </p>
          </div>

          {/* Quick Specs Snippet */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
            {Object.entries(equipment.specs)
              .slice(0, 2)
              .map(([key, value]) => (
                <div key={key} className="truncate">
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">
                    {key}
                  </span>
                  <span className="font-semibold text-navy-800 truncate block">
                    {value}
                  </span>
                </div>
              ))}
          </div>

          {/* Prerequisites Warning */}
          {equipment.prerequisites && equipment.prerequisites.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50/80 px-2 py-1 rounded border border-amber-200/60">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">
                Requires {equipment.prerequisites[0]}
                {equipment.prerequisites.length > 1 && ` (+${equipment.prerequisites.length - 1})`}
              </span>
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(equipment)}
              className={`p-1.5 rounded-lg border text-xs transition-colors focus:outline-none ${
                isCompared
                  ? 'bg-primary-50 text-primary-700 border-primary-300 font-semibold'
                  : 'text-slate-500 hover:text-navy-900 border-slate-200 hover:bg-slate-100'
              }`}
              title={isCompared ? 'Remove from compare' : 'Add to compare'}
              aria-label="Compare equipment"
            >
              <GitCompare className="w-4 h-4" />
            </button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(equipment)}
            className="text-xs"
          >
            Details
          </Button>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<CalendarPlus className="w-3.5 h-3.5" />}
          onClick={() => onRequestBooking(equipment)}
          className="text-xs"
        >
          Book Slot
        </Button>
      </CardFooter>
    </Card>
  );
};

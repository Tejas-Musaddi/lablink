import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Equipment } from '../../types';
import { EquipmentCard } from './EquipmentCard';
import { EquipmentDetailDrawer } from './EquipmentDetailDrawer';
import { EquipmentCompareModal } from './EquipmentCompareModal';
import { BookingRequestModal } from './BookingRequestModal';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import {
  Search,
  SlidersHorizontal,
  GitCompare,
  X,
  Layers,
  Sparkles,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { EQUIPMENT_CATEGORIES } from '../../lib/constants';

export const EquipmentDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { equipment, departments, laboratories, deptMap, labMap } = useAppStore();

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'ALL'
  );
  const [selectedDept, setSelectedDept] = useState<string>(
    searchParams.get('department') || 'ALL'
  );
  const [selectedAvailability, setSelectedAvailability] = useState<string>('ALL');
  const [selectedCondition, setSelectedCondition] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'hours' | 'cost'>('name');

  // Modals & Drawers
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [equipmentToBook, setEquipmentToBook] = useState<Equipment | null>(null);

  // Compare Mode State
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Check URL query on mount (e.g. ?equipment=eq-gpu---ai-workstations-001)
  useEffect(() => {
    const eqParam = searchParams.get('equipment');
    if (eqParam) {
      const match = equipment.find((e) => e.id === eqParam);
      if (match) {
        setSelectedEquipment(match);
        setDrawerOpen(true);
      }
    }
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams, equipment]);

  // Toggle Compare
  const handleToggleCompare = (eq: Equipment) => {
    setComparedIds((prev) => {
      if (prev.includes(eq.id)) {
        return prev.filter((id) => id !== eq.id);
      }
      if (prev.length >= 4) {
        alert('You can compare a maximum of 4 equipment items simultaneously.');
        return prev;
      }
      return [...prev, eq.id];
    });
  };

  const handleOpenBooking = (eq: Equipment) => {
    setEquipmentToBook(eq);
    setBookingModalOpen(true);
  };

  // Filtered & Sorted Equipment List
  const filteredEquipment = useMemo(() => {
    return equipment
      .filter((eq) => {
        // Text Search (Name, Code, Specs, Description)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = eq.name.toLowerCase().includes(q);
          const matchesCode = eq.code.toLowerCase().includes(q);
          const matchesCategory = eq.categoryId.toLowerCase().includes(q);
          const matchesDesc = eq.description.toLowerCase().includes(q);
          const matchesSpecs = Object.values(eq.specs).some((val) =>
            String(val).toLowerCase().includes(q)
          );
          if (!matchesName && !matchesCode && !matchesCategory && !matchesDesc && !matchesSpecs) {
            return false;
          }
        }

        // Category Filter
        if (selectedCategory !== 'ALL' && eq.categoryId !== selectedCategory) {
          return false;
        }

        // Department Filter
        if (selectedDept !== 'ALL' && eq.departmentId !== selectedDept) {
          return false;
        }

        // Availability Filter
        if (selectedAvailability !== 'ALL' && eq.availability !== selectedAvailability) {
          return false;
        }

        // Condition Filter
        if (selectedCondition !== 'ALL' && eq.condition !== selectedCondition) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'hours') return b.totalHoursLogged - a.totalHoursLogged;
        if (sortBy === 'cost') return (b.hourlyOperatingCost || 0) - (a.hourlyOperatingCost || 0);
        return 0;
      });
  }, [
    equipment,
    searchQuery,
    selectedCategory,
    selectedDept,
    selectedAvailability,
    selectedCondition,
    sortBy,
  ]);

  const comparedEquipmentList = equipment.filter((e) => comparedIds.includes(e.id));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Equipment Discovery & Cross-Campus Sharing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and reserve {equipment.length} verified laboratory research instruments across all 6 campus departments.
          </p>
        </div>

        {/* Compare Toolbar Indicator */}
        {comparedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-xl shadow-xs">
            <span className="text-xs font-semibold text-primary-800">
              {comparedIds.length} item(s) selected
            </span>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<GitCompare className="w-3.5 h-3.5" />}
              onClick={() => setCompareModalOpen(true)}
              className="text-xs h-7"
            >
              Compare
            </Button>
            <button
              type="button"
              onClick={() => setComparedIds([])}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
              aria-label="Clear compare"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-card border border-surface-border bg-white p-4 shadow-card space-y-4">
        {/* Top Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by instrument name, GPU/sensor spec, VRAM, asset tag, or scientific keywords..."
            className="w-full rounded-lg border border-surface-border bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-navy-900 placeholder:text-slate-400 focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills (Horizontal scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors focus:outline-none ${
              selectedCategory === 'ALL'
                ? 'bg-navy-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({equipment.length})
          </button>
          {EQUIPMENT_CATEGORIES.map((cat) => {
            const count = equipment.filter((e) => e.categoryId === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors focus:outline-none ${
                  isSelected
                    ? 'bg-primary-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Dropdowns & Sorting */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs rounded-lg border border-surface-border bg-white px-2.5 py-1.5 text-navy-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Availability
            </label>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full text-xs rounded-lg border border-surface-border bg-white px-2.5 py-1.5 text-navy-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="ALL">Any Availability</option>
              <option value="available">Available Now</option>
              <option value="in_use">In Use</option>
              <option value="reserved">Reserved</option>
              <option value="under_maintenance">Under Maintenance</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Condition
            </label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full text-xs rounded-lg border border-surface-border bg-white px-2.5 py-1.5 text-navy-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="ALL">Any Condition</option>
              <option value="optimal">Optimal</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="maintenance_required">Service Needed</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs rounded-lg border border-surface-border bg-white px-2.5 py-1.5 text-navy-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="name">Alphabetical (A - Z)</option>
              <option value="hours">Usage Hours (High to Low)</option>
              <option value="cost">Operating Cost ($/hr)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Reset Filter Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredEquipment.length}</strong> matching instrument(s)
        </span>
        {(searchQuery ||
          selectedCategory !== 'ALL' ||
          selectedDept !== 'ALL' ||
          selectedAvailability !== 'ALL' ||
          selectedCondition !== 'ALL') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedDept('ALL');
              setSelectedAvailability('ALL');
              setSelectedCondition('ALL');
            }}
            className="text-primary-600 hover:underline font-semibold"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Equipment Cards Grid */}
      {filteredEquipment.length === 0 ? (
        <div className="rounded-card border border-surface-border bg-white p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-navy-900">No equipment found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or resetting category filters to view available lab hardware.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredEquipment.map((eq) => (
            <EquipmentCard
              key={eq.id}
              equipment={eq}
              department={deptMap[eq.departmentId]}
              laboratory={labMap[eq.labId]}
              onViewDetails={(item) => {
                setSelectedEquipment(item);
                setDrawerOpen(true);
              }}
              onRequestBooking={handleOpenBooking}
              onToggleCompare={handleToggleCompare}
              isCompared={comparedIds.includes(eq.id)}
            />
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      <EquipmentDetailDrawer
        equipment={selectedEquipment}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onRequestBooking={handleOpenBooking}
        onSelectAlternative={(alt) => {
          setSelectedEquipment(alt);
        }}
      />

      {/* Compare Modal */}
      <EquipmentCompareModal
        equipmentList={comparedEquipmentList}
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        onRemoveItem={(id) => setComparedIds((prev) => prev.filter((i) => i !== id))}
        onRequestBooking={handleOpenBooking}
      />

      {/* Booking Request Modal */}
      <BookingRequestModal
        equipment={equipmentToBook}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />
    </div>
  );
};

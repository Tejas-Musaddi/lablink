import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Equipment,
  EquipmentCondition,
  EquipmentAvailability,
  MaintenanceRecord,
} from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import {
  Sliders,
  Plus,
  QrCode,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Search,
  Scan,
  Edit2,
  Trash2,
} from 'lucide-react';
import { formatDate, formatDateTime } from '../../lib/utils';
import { EQUIPMENT_CATEGORIES } from '../../lib/constants';

export const LabManagerPortalPage: React.FC = () => {
  const {
    currentRole,
    setRole,
    equipment,
    laboratories,
    maintenanceRecords,
    bookings,
    updateEquipment,
    addEquipment,
    deleteEquipment,
    createMaintenanceRecord,
    updateMaintenanceStatus,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabFilter, setSelectedLabFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // QR Scan State
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    equipment?: Equipment;
  } | null>(null);

  // New Equipment Form State
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState(EQUIPMENT_CATEGORIES[0]);
  const [newLabId, setNewLabId] = useState(laboratories[0]?.id || '');
  const [newCondition, setNewCondition] = useState<EquipmentCondition>('optimal');
  const [newMaxHours, setNewMaxHours] = useState(4);
  const [newLocation, setNewLocation] = useState('Bench Bay 3');

  // New Maintenance Form State
  const [maintEqId, setMaintEqId] = useState(equipment[0]?.id || '');
  const [maintTitle, setMaintTitle] = useState('');
  const [maintStart, setMaintStart] = useState('2026-11-26T09:00');
  const [maintEnd, setMaintEnd] = useState('2026-11-26T14:00');
  const [maintType, setMaintType] = useState<MaintenanceRecord['type']>('routine');
  const [maintTech, setMaintTech] = useState('Field Certified Service Tech');

  // Filtered Equipment
  const filteredEquipment = equipment.filter((e) => {
    if (selectedLabFilter !== 'ALL' && e.labId !== selectedLabFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.categoryId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSimulatedScan = () => {
    if (!scannedCode.trim()) return;
    const match = equipment.find(
      (e) =>
        e.qrCodeId.toLowerCase() === scannedCode.trim().toLowerCase() ||
        e.code.toLowerCase() === scannedCode.trim().toLowerCase()
    );

    if (!match) {
      setScanResult({
        success: false,
        message: `Asset not found for QR tag "${scannedCode}". Verify code or retry.`,
      });
      return;
    }

    if (match.availability === 'in_use') {
      // Check Out
      updateEquipment(match.id, { availability: 'available' });
      setScanResult({
        success: true,
        message: `Checked OUT successfully! ${match.name} (${match.code}) is now marked as AVAILABLE.`,
        equipment: match,
      });
    } else {
      // Check In
      updateEquipment(match.id, { availability: 'in_use' });
      setScanResult({
        success: true,
        message: `Checked IN session started! ${match.name} (${match.code}) is now marked as IN USE.`,
        equipment: match,
      });
    }
  };

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;

    const lab = laboratories.find((l) => l.id === newLabId);
    addEquipment({
      name: newName,
      code: newCode,
      categoryId: newCategory as any,
      departmentId: lab?.departmentId || 'dept-cs',
      labId: newLabId,
      description: `Newly provisioned ${newCategory} apparatus added to campus inventory.`,
      specs: { 'Status': 'Provisioned', 'Year': '2026' },
      condition: newCondition,
      availability: 'available',
      prerequisites: ['General Lab Safety'],
      qrCodeId: `QR-LABLINK-${newCode}`,
      maxBookingHoursPerSlot: newMaxHours,
      locationDetails: newLocation,
      serialNumber: `SN-${Date.now().toString().slice(-6)}`,
      totalHoursLogged: 0,
      lastMaintenanceDate: new Date().toISOString(),
      nextMaintenanceDate: '2027-01-01T00:00:00Z',
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewCode('');
  };

  const handleCreateMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintTitle.trim()) return;

    const eq = equipment.find((e) => e.id === maintEqId);
    if (!eq) return;

    createMaintenanceRecord({
      equipmentId: eq.id,
      labId: eq.labId,
      title: maintTitle,
      description: 'Scheduled preventative calibration by lab manager.',
      scheduledStart: new Date(maintStart).toISOString(),
      scheduledEnd: new Date(maintEnd).toISOString(),
      performedBy: maintTech,
      type: maintType,
      status: 'scheduled',
      cost: 350,
    });

    // Also mark equipment as under_maintenance during the window
    updateEquipment(eq.id, { condition: 'maintenance_required' });

    setIsMaintModalOpen(false);
    setMaintTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Role Banner if not Lab Manager */}
      {currentRole !== 'lab_manager' && currentRole !== 'admin' && (
        <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              You are currently viewing in <strong>{currentRole}</strong> mode. Switch persona to <strong>Lab Manager</strong> to edit physical hardware or schedule maintenance.
            </span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setRole('lab_manager')}
            className="bg-emerald-700 hover:bg-emerald-800 shrink-0"
          >
            Switch to Lab Manager
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Laboratory Manager Operations & Inventory Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage physical apparatus, calibrate instruments, register QR check-ins, and schedule maintenance windows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Scan className="w-4 h-4 text-primary-600" />}
            onClick={() => {
              setScanResult(null);
              setIsQrModalOpen(true);
            }}
          >
            Simulate QR Scan
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Wrench className="w-4 h-4 text-amber-600" />}
            onClick={() => setIsMaintModalOpen(true)}
          >
            Schedule Service
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Equipment
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-card border border-surface-border bg-white p-4 shadow-card grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apparatus inventory by name, code, or serial..."
            className="w-full rounded-lg border border-surface-border bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-navy-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <select
            value={selectedLabFilter}
            onChange={(e) => setSelectedLabFilter(e.target.value)}
            className="w-full text-xs rounded-lg border border-surface-border bg-white px-3 py-2 text-navy-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="ALL">All Laboratories</option>
            {laboratories.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Equipment Inventory Management Table */}
      <Card className="overflow-hidden shadow-card">
        <CardHeader className="bg-slate-50/70 p-4 border-b border-surface-border flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-navy-900">
            Physical Equipment Registry ({filteredEquipment.length} units)
          </CardTitle>
          <span className="text-[11px] text-slate-400">
            Click status chips to toggle live availability
          </span>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 border-b border-surface-border">
              <tr>
                <th className="p-3">Asset Code</th>
                <th className="p-3">Instrument Name</th>
                <th className="p-3">Availability</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Hours Logged</th>
                <th className="p-3">QR Identifier</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEquipment.slice(0, 25).map((eq) => (
                <tr key={eq.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 font-mono font-bold text-primary-700">
                    {eq.code}
                  </td>
                  <td className="p-3 font-semibold text-navy-900 max-w-xs truncate">
                    {eq.name}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => {
                        const nextStatus: EquipmentAvailability =
                          eq.availability === 'available' ? 'in_use' : 'available';
                        updateEquipment(eq.id, { availability: nextStatus });
                      }}
                      title="Click to toggle availability"
                    >
                      <StatusChip status={eq.availability} size="sm" />
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => {
                        const nextCond: EquipmentCondition =
                          eq.condition === 'optimal'
                            ? 'maintenance_required'
                            : 'optimal';
                        updateEquipment(eq.id, { condition: nextCond });
                      }}
                      title="Click to toggle condition"
                    >
                      <StatusChip status={eq.condition} size="sm" />
                    </button>
                  </td>
                  <td className="p-3 font-semibold text-navy-800">
                    {eq.totalHoursLogged} hrs
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">
                    {eq.qrCodeId}
                  </td>
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setScannedCode(eq.qrCodeId);
                        setIsQrModalOpen(true);
                      }}
                      className="text-[10px] h-6 px-2 text-primary-600"
                    >
                      Scan
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Simulated QR Code Scan Modal */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Simulated Physical QR Bench Terminal"
        description="Emulates the physical barcode scanner at the instrument workbench."
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 text-white rounded-xl text-center space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white">
              <QrCode className="w-10 h-10" />
            </div>
            <p className="text-xs text-slate-300">
              Scan student pass or instrument QR code to trigger check-in / check-out.
            </p>
          </div>

          <div className="space-y-2">
            <Input
              label="QR Code Value / Asset Tag"
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              placeholder="e.g. QR-LABLINK-EQ-GPU-001 or EQ-GPU-001"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScannedCode('QR-LABLINK-EQ-GPU-001')}
                className="text-xs"
              >
                Insert Hero DGX QR
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScannedCode('QR-LABLINK-EQ-ROB-001')}
                className="text-xs"
              >
                Insert Drone Kit QR
              </Button>
            </div>
          </div>

          {scanResult && (
            <div
              className={`p-3 rounded-lg border text-xs ${
                scanResult.success
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-red-50 text-red-900 border-red-200'
              }`}
            >
              <span className="font-bold block">
                {scanResult.success ? 'Scan Verified' : 'Scan Failed'}
              </span>
              <span>{scanResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsQrModalOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Scan className="w-4 h-4" />}
              onClick={handleSimulatedScan}
            >
              Simulate Scan Trigger
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Equipment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Laboratory Equipment"
        description="Register a new apparatus into the campus sharing pool."
        size="md"
      >
        <form onSubmit={handleAddEquipment} className="space-y-4">
          <Input
            label="Instrument Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. NVIDIA RTX 5000 Ada Generation"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Asset Tag Code"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="e.g. EQ-GPU-017"
              required
            />
            <Select
              label="Assigned Laboratory"
              value={newLabId}
              onChange={(e) => setNewLabId(e.target.value)}
            >
              {laboratories.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
            >
              {EQUIPMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>

            <Input
              type="number"
              label="Max Slot Duration (Hours)"
              value={newMaxHours}
              onChange={(e) => setNewMaxHours(Number(e.target.value))}
              min={1}
              max={12}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-border">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Register Equipment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Schedule Maintenance Modal */}
      <Modal
        isOpen={isMaintModalOpen}
        onClose={() => setIsMaintModalOpen(false)}
        title="Schedule Preventative Service"
        size="md"
      >
        <form onSubmit={handleCreateMaintenance} className="space-y-4">
          <Select
            label="Select Apparatus"
            value={maintEqId}
            onChange={(e) => setMaintEqId(e.target.value)}
          >
            {equipment.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.code} - {eq.name}
              </option>
            ))}
          </Select>

          <Input
            label="Service Title / Reason"
            value={maintTitle}
            onChange={(e) => setMaintTitle(e.target.value)}
            placeholder="e.g. Laser cavity mirror alignment & recalibration"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="datetime-local"
              label="Start Time"
              value={maintStart}
              onChange={(e) => setMaintStart(e.target.value)}
              required
            />
            <Input
              type="datetime-local"
              label="End Time"
              value={maintEnd}
              onChange={(e) => setMaintEnd(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-border">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsMaintModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Confirm Window
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Project, ProjectPriority, Equipment } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { BookingRequestModal } from '../discovery/BookingRequestModal';
import {
  FolderGit2,
  Sparkles,
  Plus,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Edit3,
  Cpu,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { formatDate, formatDateTime } from '../../lib/utils';
import {
  extractProjectRequirements,
  matchEquipmentForProject,
  EquipmentMatchResult,
} from '../../engine/aiExtractor';

export const ProjectManagementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {
    projects,
    currentUser,
    departments,
    equipment,
    bookings,
    deptMap,
    createProject,
    deleteProject,
  } = useAppStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    searchParams.get('project') || projects[0]?.id || ''
  );

  // Modals & AI State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState<{
    requirements: ReturnType<typeof extractProjectRequirements>;
    matches: EquipmentMatchResult[];
  } | null>(null);

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [equipmentToBook, setEquipmentToBook] = useState<Equipment | null>(null);

  // New Project Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Robotics & Autonomous Systems');
  const [newDeptId, setNewDeptId] = useState('dept-rob');
  const [newPriority, setNewPriority] = useState<ProjectPriority>('normal');
  const [newDeadline, setNewDeadline] = useState('2026-12-15T18:00');
  const [newRequirements, setNewRequirements] = useState('');

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Linked bookings for active project
  const linkedBookings = bookings.filter((b) => b.projectId === activeProject?.id);

  // Trigger AI Analysis
  const handleAnalyzeWithAi = () => {
    if (!activeProject) return;
    setAiAnalyzing(true);
    setTimeout(() => {
      const extracted = extractProjectRequirements(
        activeProject.title,
        activeProject.description,
        activeProject.attachedRequirements
      );
      const matched = matchEquipmentForProject(
        extracted,
        equipment,
        currentUser.completedTrainings
      );
      setAiResults({
        requirements: extracted,
        matches: matched.slice(0, 5),
      });
      setAiAnalyzing(false);
    }, 600);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = createProject({
      title: newTitle,
      description: newDesc,
      category: newCategory,
      departmentId: newDeptId,
      leadStudentId: currentUser.id,
      teamMembers: [currentUser.id],
      facultySupervisorId: 'faculty-2',
      deadline: new Date(newDeadline).toISOString(),
      priority: newPriority,
      status: 'active',
      requiredEquipmentCategories: [],
      attachedRequirements: newRequirements
        ? newRequirements.split('\n').filter((r) => r.trim().length > 0)
        : [],
    });

    setSelectedProjectId(created.id);
    setIsCreateModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewDesc('');
    setNewRequirements('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Research Projects & Hardware Requirements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Map research milestones to campus instruments with semantic requirement extraction and allocation scoring.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Project
        </Button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Project Selector List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Active Projects ({projects.length})
          </div>

          <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
            {projects.map((proj) => {
              const isSelected = proj.id === activeProject?.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    setSelectedProjectId(proj.id);
                    setAiResults(null);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'bg-white border-primary-500 ring-2 ring-primary-500/20 shadow-card'
                      : 'bg-white border-surface-border hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-200 truncate">
                      {deptMap[proj.departmentId]?.code || 'DEPT'}
                    </span>
                    <StatusChip status={proj.priority} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-navy-900 mt-2 line-clamp-2">
                    {proj.title}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Due {formatDate(proj.deadline)}
                    </span>
                    <span className="font-medium text-navy-800">
                      {proj.teamMembers.length} member(s)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Project Details & AI Intelligence (8 cols) */}
        {activeProject && (
          <div className="lg:col-span-8 space-y-6">
            {/* Project Overview Card */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-slate-50/70 p-5 pb-4 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusChip status={activeProject.priority} size="sm" />
                    <span className="text-xs font-semibold text-slate-500">
                      Department: {deptMap[activeProject.departmentId]?.name}
                    </span>
                  </div>
                  <CardTitle className="text-lg mt-2 font-bold text-navy-900">
                    {activeProject.title}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={aiAnalyzing}
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                    onClick={handleAnalyzeWithAi}
                    className="shadow-xs"
                  >
                    Analyse with AI
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete project "${activeProject.title}"?`)) {
                        deleteProject(activeProject.id);
                      }
                    }}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-5">
                {/* Description */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Project Abstract & Methodology
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {activeProject.description}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Lead Student
                    </span>
                    <span className="font-semibold text-navy-900">
                      {activeProject.leadStudentId}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Faculty Supervisor
                    </span>
                    <span className="font-semibold text-navy-900">
                      {activeProject.facultySupervisorId}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Submission Deadline
                    </span>
                    <span className="font-semibold text-navy-900">
                      {formatDate(activeProject.deadline)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Team Size
                    </span>
                    <span className="font-semibold text-navy-900">
                      {activeProject.teamMembers.length} Researcher(s)
                    </span>
                  </div>
                </div>

                {/* Attached Requirements */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Attached Hardware & Experimental Requirements
                  </h4>
                  {activeProject.attachedRequirements.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No custom requirements attached.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {activeProject.attachedRequirements.map((req, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-navy-800"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis & Recommendations Card */}
            {aiResults && (
              <Card className="border-primary-200 bg-gradient-to-br from-primary-50/40 to-white shadow-card">
                <CardHeader className="p-4 border-b border-primary-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary-600 text-white">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-navy-900">
                        AI Compatibility & Equipment Recommendations
                      </CardTitle>
                      <p className="text-[11px] text-slate-500">
                        Synthesized from project description and cross-departmental apparatus inventory.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary-700 bg-primary-100/60 px-2 py-0.5 rounded-full border border-primary-300">
                    {aiResults.matches.length} Matches Found
                  </span>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  {/* Extracted Categories */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Inferred Hardware Categories
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {aiResults.requirements.map((req) => (
                        <div
                          key={req.category}
                          className="flex items-center gap-2 rounded-lg bg-white border border-primary-200 px-3 py-1.5 text-xs shadow-2xs"
                        >
                          <Cpu className="w-3.5 h-3.5 text-primary-600" />
                          <span className="font-semibold text-navy-900">{req.category}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            {Math.round(req.confidence * 100)}% Conf
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ranked Matching Equipment List */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Ranked Compatible Campus Apparatus
                    </span>
                    <div className="space-y-2">
                      {aiResults.matches.map((match) => (
                        <div
                          key={match.equipment.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-surface-border bg-white shadow-2xs hover:border-primary-300 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-navy-900">
                                {match.equipment.name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {match.equipment.code}
                              </span>
                              <StatusChip status={match.equipment.availability} size="sm" />
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {match.matchedReasons[0]}
                            </p>
                            {match.prerequisiteWarning && (
                              <div className="text-[10px] text-amber-700 font-medium">
                                ⚠ {match.prerequisiteWarning}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-base font-black text-primary-600">
                                {match.matchScore}%
                              </span>
                              <span className="text-[9px] text-slate-400 block uppercase">
                                Match Score
                              </span>
                            </div>

                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setEquipmentToBook(match.equipment);
                                setBookingModalOpen(true);
                              }}
                              className="text-xs"
                            >
                              Book This
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Linked Booking Sessions Timeline */}
            <Card>
              <CardHeader className="p-4 border-b border-surface-border flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-600" />
                  Scheduled Equipment Sessions ({linkedBookings.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {linkedBookings.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    No bookings allocated yet. Use "Analyse with AI" or browse discovery to book apparatus.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {linkedBookings.map((b) => (
                      <div key={b.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-navy-900">
                            Equipment: {b.equipmentId}
                          </span>
                          <span className="text-slate-400 text-[11px] block">
                            {formatDateTime(b.startTime)} - {formatDateTime(b.endTime)}
                          </span>
                        </div>
                        <StatusChip status={b.status} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Research Project"
        description="Provide project objectives to unlock automatic hardware recommendation & priority scoring."
        size="md"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Autonomous Robotic SLAM in GPS-Denied Environments"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-navy-800 uppercase tracking-wider mb-1.5">
              Project Description & Abstract
            </label>
            <textarea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Describe your research questions, computational or experimental workflows..."
              className="block w-full rounded-lg border border-surface-border bg-white px-3.5 py-2 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Primary Department"
              value={newDeptId}
              onChange={(e) => setNewDeptId(e.target.value)}
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>

            <Select
              label="Priority Level"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as ProjectPriority)}
            >
              <option value="critical">Critical (Thesis / Conference Deadline)</option>
              <option value="high">High Priority</option>
              <option value="normal">Normal</option>
              <option value="low">Low (Exploratory)</option>
            </Select>
          </div>

          <Input
            type="datetime-local"
            label="Final Submission Deadline"
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-navy-800 uppercase tracking-wider mb-1.5">
              Attached Requirements (One per line)
            </label>
            <textarea
              rows={2}
              value={newRequirements}
              onChange={(e) => setNewRequirements(e.target.value)}
              placeholder="e.g. NVIDIA DGX Station A100 or H100 with >= 80GB VRAM&#10;LiDAR flight cage"
              className="block w-full rounded-lg border border-surface-border bg-white px-3.5 py-2 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-border">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* Booking Modal */}
      <BookingRequestModal
        equipment={equipmentToBook}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />
    </div>
  );
};

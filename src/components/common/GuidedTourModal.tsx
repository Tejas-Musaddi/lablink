import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FolderGit2,
  Search,
  Scale,
  FileCheck2,
  Calendar,
  BarChart3,
} from 'lucide-react';

export const GuidedTourModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    guidedTourOpen,
    guidedTourStep,
    closeGuidedTour,
    nextTourStep,
    prevTourStep,
    setRole,
  } = useAppStore();

  if (!guidedTourOpen) return null;

  const steps = [
    {
      title: 'Welcome to LabLink: The Cross-Campus Resource Sharing Story',
      badge: 'Step 1 of 6',
      icon: <Sparkles className="w-6 h-6 text-primary-600" />,
      content: (
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            University laboratories are historically siloed: Computer Science has high-end GPU compute clusters,
            while Robotics has autonomous flight arenas, and Biomedical has confocal laser microscopes. Students frequently
            hit deadlocks and underutilized assets stay hidden.
          </p>
          <div className="p-3.5 bg-primary-50 rounded-lg border border-primary-100 text-primary-900 text-xs">
            <strong>The Hero Scenario:</strong> Three cross-departmental teams (Robotics Drone Swarm, CS Vision-Language LLM,
            and Bionic Prosthesis) urgently require the <strong>NVIDIA DGX Station A100</strong> within 48 hours of an IEEE deadline.
          </div>
        </div>
      ),
      actionLabel: 'Go to Projects & AI Requirements',
      onAction: () => {
        navigate('/projects');
        nextTourStep();
      },
    },
    {
      title: 'Project Requirements & AI Equipment Extraction',
      badge: 'Step 2 of 6',
      icon: <FolderGit2 className="w-6 h-6 text-purple-600" />,
      content: (
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            Students define their research projects with real-world descriptions. LabLink uses an offline-first semantic
            TF-IDF and heuristic ontology matcher (with optional Gemini LLM enrichment) to automatically infer required
            hardware categories, VRAM thresholds, and safety certifications.
          </p>
          <p className="text-xs text-slate-500">
            Clicking <em>"Analyse with AI"</em> matches project requirements against 128 live cross-department pieces of equipment.
          </p>
        </div>
      ),
      actionLabel: 'Explore Equipment Matches',
      onAction: () => {
        navigate('/discovery?category=GPU+%26+AI+Workstations');
        nextTourStep();
      },
    },
    {
      title: 'Equipment Discovery & Contention Detection',
      badge: 'Step 3 of 6',
      icon: <Search className="w-6 h-6 text-blue-600" />,
      content: (
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            Students browse equipment across all 6 departments. When attempting to book the heavily-contended
            <strong> NVIDIA DGX Station A100</strong>, the platform detects overlapping requests from rival teams
            approaching their conference submission deadlines.
          </p>
          <p className="text-xs text-slate-500">
            Rather than a brittle first-come-first-served lockout, LabLink routes contending requests to the transparent Fair Allocation Engine.
          </p>
        </div>
      ),
      actionLabel: 'Open Fair Allocation Engine',
      onAction: () => {
        navigate('/conflicts');
        nextTourStep();
      },
    },
    {
      title: 'Deterministic Allocation Engine & What-If Simulator',
      badge: 'Step 4 of 6',
      icon: <Scale className="w-6 h-6 text-amber-600" />,
      content: (
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            The pure TypeScript engine scores each request using 5 configurable normalized weights:
            <strong> Deadline Urgency (30%)</strong>, <strong>Project Priority (20%)</strong>, <strong>Waiting Time (20%)</strong>,
            <strong> Usage Fairness (15%)</strong>, and <strong>Requirement Criticality (15%)</strong>.
          </p>
          <p>
            It mathematically guarantees zero double-booking, generates interval assignments, shifts losing requests to equivalent
            hardware (e.g. H100 SuperServer) or nearest slots, and outputs human-readable rationales.
          </p>
        </div>
      ),
      actionLabel: 'Switch to Faculty for Approval',
      onAction: () => {
        setRole('faculty');
        navigate('/faculty');
        nextTourStep();
      },
    },
    {
      title: 'Faculty Governance & Atomic Schedule Commit',
      badge: 'Step 5 of 6',
      icon: <FileCheck2 className="w-6 h-6 text-emerald-600" />,
      content: (
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            Faculty Advisors review the recommendation queue sorted by AI urgency. They can inspect the full mathematical score
            breakdown, review student usage fairness history, and with one click approve the schedule.
          </p>
          <p className="text-xs text-slate-500">
            Approval executes an atomic transaction: calendar slots are locked, students are notified, audit logs are appended,
            and waitlist queues are re-indexed.
          </p>
        </div>
      ),
      actionLabel: 'Inspect Calendar & Analytics',
      onAction: () => {
        navigate('/analytics');
        nextTourStep();
      },
    },
    {
      title: 'Impact Analytics & Campus Optimization',
      badge: 'Step 6 of 6',
      icon: <BarChart3 className="w-6 h-6 text-indigo-600" />,
      content: (
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            Campus leaders see the verified impact: <strong>+48.2% cross-department utilization uplift</strong>,
            Fairness Index improved from 0.62 to 0.89 vs First-Come-First-Served, and zero idle GPU hours.
          </p>
          <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg text-xs font-medium">
            You are ready to explore! Switch roles freely at any time using the top bar switcher.
          </div>
        </div>
      ),
      actionLabel: 'Finish Guided Tour',
      onAction: () => {
        closeGuidedTour();
        navigate('/');
      },
    },
  ];

  const current = steps[Math.min(guidedTourStep, steps.length - 1)];

  return (
    <Modal
      isOpen={guidedTourOpen}
      onClose={closeGuidedTour}
      size="lg"
      showCloseButton={true}
    >
      <div className="space-y-6">
        {/* Step Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200">
            {current.icon}
          </div>
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
              {current.badge}
            </span>
            <h3 className="text-lg font-bold text-navy-900 mt-1">{current.title}</h3>
          </div>
        </div>

        {/* Step Body */}
        <div className="py-2 border-y border-surface-border">{current.content}</div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={closeGuidedTour}
              className="text-slate-500"
            >
              Skip Tour
            </Button>
            {guidedTourStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                onClick={prevTourStep}
              >
                Back
              </Button>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={current.onAction}
          >
            {current.actionLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

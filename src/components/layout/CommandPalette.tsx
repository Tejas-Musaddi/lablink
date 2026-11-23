import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import {
  Search,
  Building2,
  FolderGit2,
  Calendar,
  Scale,
  Bot,
  Sliders,
  Shield,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../ui/Modal';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { equipment, laboratories, projects, setRole, resetDemoData, openGuidedTour } = useAppStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // open
          window.dispatchEvent(new CustomEvent('open-command-palette'));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredEquipment = equipment
    .filter(
      (e) =>
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.code.toLowerCase().includes(query.toLowerCase()) ||
        e.categoryId.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 4);

  const filteredLabs = laboratories
    .filter((l) => l.name.toLowerCase().includes(query.toLowerCase()) || l.code.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3);

  const filteredProjects = projects
    .filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3);

  const actions = [
    {
      id: 'tour',
      label: 'Start Guided Tour (Hero Conflict Workflow)',
      icon: <Sparkles className="w-4 h-4 text-primary-600" />,
      action: () => {
        onClose();
        openGuidedTour();
      },
    },
    {
      id: 'conflicts',
      label: 'Open Fair Allocation Engine & What-If Simulator',
      icon: <Scale className="w-4 h-4 text-purple-600" />,
      action: () => {
        onClose();
        navigate('/conflicts');
      },
    },
    {
      id: 'assistant',
      label: 'Open AI Lab Assistant',
      icon: <Bot className="w-4 h-4 text-blue-600" />,
      action: () => {
        onClose();
        navigate('/assistant');
      },
    },
    {
      id: 'role-faculty',
      label: 'Switch Persona to Faculty (Review Approvals)',
      icon: <Shield className="w-4 h-4 text-emerald-600" />,
      action: () => {
        setRole('faculty');
        onClose();
        navigate('/faculty');
      },
    },
    {
      id: 'role-manager',
      label: 'Switch Persona to Lab Manager (Manage Equipment)',
      icon: <Sliders className="w-4 h-4 text-amber-600" />,
      action: () => {
        setRole('lab_manager');
        onClose();
        navigate('/manager');
      },
    },
    {
      id: 'reset',
      label: 'Reset Simulation to Pristine State',
      icon: <RotateCcw className="w-4 h-4 text-red-600" />,
      action: () => {
        resetDemoData();
        onClose();
      },
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={false}>
      <div className="-m-6">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-surface-border">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search equipment, labs, projects, or type an action..."
            className="w-full border-0 bg-transparent px-3 py-4 text-sm text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
            autoFocus
          />
          <kbd className="hidden sm:inline-block rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          <div>
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Quick Commands
            </div>
            <div className="space-y-1">
              {actions.map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={act.action}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-left font-medium text-navy-800 hover:bg-slate-100 transition-colors"
                >
                  {act.icon}
                  <span>{act.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Equipment */}
          {filteredEquipment.length > 0 && (
            <div>
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Equipment
              </div>
              <div className="space-y-1">
                {filteredEquipment.map((eq) => (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/discovery?equipment=${eq.id}`);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-left text-navy-800 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{eq.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{eq.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Laboratories */}
          {filteredLabs.length > 0 && (
            <div>
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Laboratories
              </div>
              <div className="space-y-1">
                {filteredLabs.map((lab) => (
                  <button
                    key={lab.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/labs?lab=${lab.id}`);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-left text-navy-800 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{lab.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{lab.roomNumber}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Projects
              </div>
              <div className="space-y-1">
                {filteredProjects.map((proj) => (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/projects?project=${proj.id}`);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-left text-navy-800 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium truncate max-w-sm">{proj.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize">{proj.priority}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

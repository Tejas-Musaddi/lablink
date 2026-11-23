import React from 'react';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'underline' | 'pills';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'underline',
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1 overflow-x-auto no-scrollbar',
        variant === 'underline' && 'border-b border-surface-border',
        variant === 'pills' && 'bg-slate-100 p-1 rounded-lg',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              variant === 'underline' && [
                'border-b-2 -mb-px rounded-b-none',
                isActive
                  ? 'border-primary-600 text-primary-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-navy-900 hover:border-slate-300',
              ],
              variant === 'pills' && [
                isActive
                  ? 'bg-white text-navy-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-200/60',
              ]
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.5 text-xs rounded-full font-bold',
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-slate-200 text-slate-700'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

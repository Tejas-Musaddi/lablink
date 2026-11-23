import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { GuidedTourModal } from './components/common/GuidedTourModal';
import { Loader2 } from 'lucide-react';
import { useAppStore } from './store/useAppStore';

// Route-level code-splitting & lazy-loading (Section 9.3)
const DashboardPage = lazy(() =>
  import('./features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const EquipmentDiscoveryPage = lazy(() =>
  import('./features/discovery/EquipmentDiscoveryPage').then((m) => ({
    default: m.EquipmentDiscoveryPage,
  }))
);
const LaboratoryExplorerPage = lazy(() =>
  import('./features/labs/LaboratoryExplorerPage').then((m) => ({
    default: m.LaboratoryExplorerPage,
  }))
);
const ProjectManagementPage = lazy(() =>
  import('./features/projects/ProjectManagementPage').then((m) => ({
    default: m.ProjectManagementPage,
  }))
);
const SmartBookingCalendarPage = lazy(() =>
  import('./features/calendar/SmartBookingCalendarPage').then((m) => ({
    default: m.SmartBookingCalendarPage,
  }))
);
const ConflictResolutionPage = lazy(() =>
  import('./features/conflicts/ConflictResolutionPage').then((m) => ({
    default: m.ConflictResolutionPage,
  }))
);
const AiAssistantPage = lazy(() =>
  import('./features/assistant/AiAssistantPage').then((m) => ({
    default: m.AiAssistantPage,
  }))
);
const FacultyPortalPage = lazy(() =>
  import('./features/portals/FacultyPortalPage').then((m) => ({
    default: m.FacultyPortalPage,
  }))
);
const LabManagerPortalPage = lazy(() =>
  import('./features/portals/LabManagerPortalPage').then((m) => ({
    default: m.LabManagerPortalPage,
  }))
);
const AdminPortalPage = lazy(() =>
  import('./features/portals/AdminPortalPage').then((m) => ({
    default: m.AdminPortalPage,
  }))
);
const AnalyticsPage = lazy(() =>
  import('./features/analytics/AnalyticsPage').then((m) => ({
    default: m.AnalyticsPage,
  }))
);

const PageFallback: React.FC = () => (
  <div className="flex h-64 w-full items-center justify-center space-x-2 text-slate-500">
    <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
    <span className="text-xs font-medium">Loading LabLink module...</span>
  </div>
);

export const App: React.FC = () => {
  const initBackendSync = useAppStore((s) => s.initBackendSync);

  useEffect(() => {
    initBackendSync();
  }, [initBackendSync]);

  return (
    <BrowserRouter>
      {/* Global Guided Spotlight Tour Modal */}
      <GuidedTourModal />

      <Routes>
        <Route element={<AppShell />}>
          <Route
            path="/"
            element={
              <Suspense fallback={<PageFallback />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="/discovery"
            element={
              <Suspense fallback={<PageFallback />}>
                <EquipmentDiscoveryPage />
              </Suspense>
            }
          />
          <Route
            path="/labs"
            element={
              <Suspense fallback={<PageFallback />}>
                <LaboratoryExplorerPage />
              </Suspense>
            }
          />
          <Route
            path="/projects"
            element={
              <Suspense fallback={<PageFallback />}>
                <ProjectManagementPage />
              </Suspense>
            }
          />
          <Route
            path="/calendar"
            element={
              <Suspense fallback={<PageFallback />}>
                <SmartBookingCalendarPage />
              </Suspense>
            }
          />
          <Route
            path="/conflicts"
            element={
              <Suspense fallback={<PageFallback />}>
                <ConflictResolutionPage />
              </Suspense>
            }
          />
          <Route
            path="/assistant"
            element={
              <Suspense fallback={<PageFallback />}>
                <AiAssistantPage />
              </Suspense>
            }
          />
          <Route
            path="/faculty"
            element={
              <Suspense fallback={<PageFallback />}>
                <FacultyPortalPage />
              </Suspense>
            }
          />
          <Route
            path="/manager"
            element={
              <Suspense fallback={<PageFallback />}>
                <LabManagerPortalPage />
              </Suspense>
            }
          />
          <Route
            path="/admin"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminPortalPage />
              </Suspense>
            }
          />
          <Route
            path="/analytics"
            element={
              <Suspense fallback={<PageFallback />}>
                <AnalyticsPage />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

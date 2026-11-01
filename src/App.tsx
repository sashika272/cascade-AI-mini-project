import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SREProvider } from './context/SREContext';
import { RouterProvider, useRouter, OutletContext } from './router';
import { MainLayout } from './components/layout/MainLayout';

// All 16 Complete Application Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { DependencyMapPage } from './pages/DependencyMapPage';
import { AnomalyDetectionPage } from './pages/AnomalyDetectionPage';
import { IncidentManagementPage } from './pages/IncidentManagementPage';
import { RootCauseAnalysisPage } from './pages/RootCauseAnalysisPage';
import { ConfigAnalysisPage } from './pages/ConfigAnalysisPage';
import { IncidentReplayPage } from './pages/IncidentReplayPage';
import { RecoveryAdvisorPage } from './pages/RecoveryAdvisorPage';
import { FailureSimulationPage } from './pages/FailureSimulationPage';
import { RecoveryValidationPage } from './pages/RecoveryValidationPage';
import { PredictiveAnalysisPage } from './pages/PredictiveAnalysisPage';
import { IncidentHistoryPage } from './pages/IncidentHistoryPage';
import { ReportsAnalyticsPage } from './pages/ReportsAnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { HelpDocumentationPage } from './pages/HelpDocumentationPage';

const AppContent: React.FC = () => {
  const { pathname } = useRouter();
  const { isAuthenticated } = useAuth();

  // Standalone Auth pages
  if (pathname === '/login') return <LoginPage />;
  if (pathname === '/register') return <RegisterPage />;
  if (pathname === '/forgot-password') return <ForgotPasswordPage />;

  // Protected route check
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Determine current active view component
  let pageComponent = <OverviewDashboard />;
  switch (pathname) {
    case '/monitoring':
      pageComponent = <LiveMonitoringPage />;
      break;
    case '/dependency-map':
      pageComponent = <DependencyMapPage />;
      break;
    case '/anomalies':
      pageComponent = <AnomalyDetectionPage />;
      break;
    case '/incidents':
      pageComponent = <IncidentManagementPage />;
      break;
    case '/root-cause':
      pageComponent = <RootCauseAnalysisPage />;
      break;
    case '/config-analysis':
      pageComponent = <ConfigAnalysisPage />;
      break;
    case '/incident-replay':
      pageComponent = <IncidentReplayPage />;
      break;
    case '/recovery-advisor':
      pageComponent = <RecoveryAdvisorPage />;
      break;
    case '/simulation':
      pageComponent = <FailureSimulationPage />;
      break;
    case '/validation':
      pageComponent = <RecoveryValidationPage />;
      break;
    case '/predictive':
      pageComponent = <PredictiveAnalysisPage />;
      break;
    case '/history':
      pageComponent = <IncidentHistoryPage />;
      break;
    case '/reports':
      pageComponent = <ReportsAnalyticsPage />;
      break;
    case '/settings':
      pageComponent = <SettingsPage />;
      break;
    case '/digital-twin':
      pageComponent = <DigitalTwinPage />;
      break;
    case '/notifications':
      pageComponent = <NotificationsPage />;
      break;
    case '/profile':
      pageComponent = <UserProfilePage />;
      break;
    case '/admin':
      pageComponent = <AdminDashboardPage />;
      break;
    case '/privacy':
      pageComponent = <PrivacyPage />;
      break;
    case '/terms':
      pageComponent = <TermsPage />;
      break;
    case '/docs':
      pageComponent = <HelpDocumentationPage />;
      break;
    case '/':
    default:
      pageComponent = <OverviewDashboard />;
      break;
  }

  return (
    <OutletContext.Provider value={pageComponent}>
      <MainLayout />
    </OutletContext.Provider>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SREProvider>
          <RouterProvider>
            <AppContent />
          </RouterProvider>
        </SREProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

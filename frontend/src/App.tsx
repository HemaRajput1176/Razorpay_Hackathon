import { useState } from 'react';
import { BootSequence } from './components/boot/BootSequence';
import { LoginPage } from './components/auth/LoginPage';
import { AppShell } from './components/layout/AppShell';
import { CommandCenterPage } from './pages/CommandCenterPage';
import { SOCPage } from './pages/SOCPage';
import { CyberRangePage } from './pages/CyberRangePage';
import { ExerciseListPage } from './pages/ExerciseListPage';
import { ExerciseDetailPage } from './pages/ExerciseDetailPage';
import { AssessmentListPage } from './pages/AssessmentListPage';
import { AssessmentDetailPage } from './pages/AssessmentDetailPage';
import { ThreatHuntingPage } from './pages/ThreatHuntingPage';
import { InvestigationWorkspacePage } from './pages/InvestigationWorkspacePage';
import { PurpleTeamPage } from './pages/PurpleTeamPage';
import { DetectionRulesPage } from './pages/DetectionRulesPage';
import { NexusAIPage } from './pages/NexusAIPage';
import { ResponseApprovalPage } from './pages/ResponseApprovalPage';
import { RiskIntelPage } from './pages/RiskIntelPage';
import { AssetInventoryPage } from './pages/AssetInventoryPage';
import { DevSecOpsPage } from './pages/DevSecOpsPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { CTFAcademyPage } from './pages/CTFAcademyPage';
import { SettingsPage } from './pages/SettingsPage';
import type { ModuleId, User } from './types';

export function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleId>('command-center');
  const [selectedExerciseCode, setSelectedExerciseCode] = useState<string | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  // Step 1: Boot Sequence
  if (isBooting) {
    return <BootSequence onComplete={() => setIsBooting(false)} />;
  }

  // Step 2: Authentication Login Page
  if (!user) {
    return (
      <LoginPage
        onLoginSuccess={(userData) => {
          setUser(userData);
        }}
      />
    );
  }

  // Step 3: Main Command Center Application Shell
  const renderModuleContent = () => {
    if (selectedExerciseCode) {
      return (
        <ExerciseDetailPage
          exerciseCode={selectedExerciseCode}
          onBack={() => setSelectedExerciseCode(null)}
        />
      );
    }

    if (selectedAssessmentId) {
      return (
        <AssessmentDetailPage
          assessmentId={selectedAssessmentId}
          onBack={() => setSelectedAssessmentId(null)}
        />
      );
    }

    switch (activeModule) {
      case 'command-center':
        return <CommandCenterPage onNavigate={(mod) => { setSelectedExerciseCode(null); setSelectedAssessmentId(null); setActiveModule(mod); }} />;
      case 'soc':
        return <SOCPage onNavigateToModule={(mod) => { setSelectedExerciseCode(null); setSelectedAssessmentId(null); setActiveModule(mod); }} />;
      case 'threat-hunting':
        return <ThreatHuntingPage />;
      case 'investigations':
      case 'evidence':
      case 'timeline':
        return <InvestigationWorkspacePage />;
      case 'purple-team':
        return <PurpleTeamPage />;
      case 'blue-team':
        return <DetectionRulesPage />;
      case 'labs':
        return <CyberRangePage />;
      case 'exercises':
      case 'red-team':
        return (
          <ExerciseListPage
            onSelectExercise={(code) => setSelectedExerciseCode(code)}
          />
        );
      case 'assessments':
      case 'vulnerabilities':
      case 'attack-surface':
        return (
          <AssessmentListPage
            onSelectAssessment={(id) => setSelectedAssessmentId(id)}
          />
        );
      case 'assets':
        return <AssetInventoryPage />;
      case 'attack-graph':
      case 'threat-intel':
      case 'iocs':
      case 'threat-actors':
        return <RiskIntelPage />;
      case 'nexus-ai':
        return <NexusAIPage />;
      case 'response-actions':
        return <ResponseApprovalPage />;
      case 'devsecops':
      case 'container-security':
      case 'cloud-security':
        return <DevSecOpsPage />;
      case 'incidents':
      case 'playbooks':
        return <IncidentsPage />;
      case 'reports':
      case 'audit-logs':
        return <ReportsPage />;
      case 'ctf-academy':
        return <CTFAcademyPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <CommandCenterPage onNavigate={(mod) => { setSelectedExerciseCode(null); setSelectedAssessmentId(null); setActiveModule(mod); }} />;
    }
  };

  return (
    <AppShell
      user={user}
      activeModule={activeModule}
      onSelectModule={(mod) => {
        setSelectedExerciseCode(null);
        setSelectedAssessmentId(null);
        setActiveModule(mod);
      }}
    >
      {renderModuleContent()}
    </AppShell>
  );
}

export default App;

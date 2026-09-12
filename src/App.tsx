import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { InvestigationProvider } from './context/InvestigationContext';
import { Navbar } from './components/Navbar';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { CaseBrowserView } from './views/CaseBrowserView';
import { CaseOverviewView } from './views/CaseOverviewView';
import { DocumentUploadView } from './views/DocumentUploadView';
import { ExtractionReviewView } from './views/ExtractionReviewView';
import { EntityMatchReviewView } from './views/EntityMatchReviewView';
import { InvestigationWorkspaceView } from './views/InvestigationWorkspaceView';
import { EntityProfileView } from './views/EntityProfileView';
import { EvidenceDetailView } from './views/EvidenceDetailView';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {!isLoginPage && <Navbar />}
      <div className="flex-1 w-full">
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/cases" element={<CaseBrowserView />} />
          <Route path="/cases/:id" element={<CaseOverviewView />} />
          <Route path="/cases/:id/upload" element={<DocumentUploadView />} />
          <Route path="/cases/:id/extraction" element={<ExtractionReviewView />} />
          <Route path="/cases/:id/matches" element={<EntityMatchReviewView />} />
          <Route path="/cases/:id/investigation" element={<InvestigationWorkspaceView />} />
          <Route path="/entities/:id" element={<EntityProfileView />} />
          <Route path="/evidence/:id" element={<EvidenceDetailView />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <InvestigationProvider>
      <Router>
        <AppContent />
      </Router>
    </InvestigationProvider>
  );
};

export default App;

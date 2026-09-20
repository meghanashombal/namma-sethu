import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { LandingView } from './components/LandingView';
import { CitizenDashboard } from './components/CitizenDashboard';
import { ComplaintDetailView } from './components/ComplaintDetailView';
import { ProblemsNearMeView } from './components/ProblemsNearMeView';
import { StaffDashboardView } from './components/StaffDashboardView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { TrackComplaintModal } from './components/TrackComplaintModal';
import { HelpCivicView } from './components/HelpCivicView';
import { ReportProblemModal } from './components/ReportProblemModal';
import { RoutingVisualizationModal } from './components/RoutingVisualizationModal';
import { AuthModal } from './components/AuthModal';
import { TrendingIssuesChart } from './components/TrendingIssuesChart';
import { MobileSmsToast } from './components/MobileSmsToast';
import { RealMobileSmsModal } from './components/RealMobileSmsModal';

import { StorageService } from './services/storage';
import { Complaint, User, RoutingDecision, NotificationItem } from './types';
import { Language, translations } from './data/translations';

export default function App() {
  // Initialize storage once on mount
  useEffect(() => {
    StorageService.init();
  }, []);

  // State
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser());
  const [language, setLanguage] = useState<Language>('en');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>('MY-2026-1001');

  // Modal triggers
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isRoutingModalOpen, setIsRoutingModalOpen] = useState<boolean>(false);
  const [lastSubmittedComplaint, setLastSubmittedComplaint] = useState<Complaint | null>(null);
  const [lastRoutingDecision, setLastRoutingDecision] = useState<RoutingDecision | null>(null);
  const [realSmsComplaint, setRealSmsComplaint] = useState<Complaint | null>(null);
  const [isRealSmsModalOpen, setIsRealSmsModalOpen] = useState<boolean>(false);

  // Complaints & Notifications live state
  const [complaints, setComplaints] = useState<Complaint[]>(() => StorageService.getComplaints());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    StorageService.getNotifications(currentUser.id)
  );

  const t = translations[language];

  const refreshData = () => {
    setComplaints(StorageService.getComplaints());
    setNotifications(StorageService.getNotifications(currentUser.id));
  };

  const handleUserChange = (newUser: User) => {
    StorageService.setCurrentUser(newUser);
    setCurrentUser(newUser);
    setNotifications(StorageService.getNotifications(newUser.id));
    // Route user to natural home based on role
    if (newUser.role === 'CITIZEN') {
      setCurrentView('citizen_dashboard');
    } else if (newUser.role === 'STAFF') {
      setCurrentView('staff_dashboard');
    } else if (newUser.role === 'ADMIN') {
      setCurrentView('admin_dashboard');
    }
  };

  const handleNavigate = (view: string, complaintId?: string) => {
    if (complaintId) {
      setSelectedComplaintId(complaintId);
    }
    if (view === 'auth') {
      setIsAuthModalOpen(true);
      return;
    }
    if (view === 'report_problem') {
      setIsReportModalOpen(true);
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComplaintSubmitted = (newComp: Complaint, routing: RoutingDecision) => {
    setIsReportModalOpen(false);
    setLastSubmittedComplaint(newComp);
    setLastRoutingDecision(routing);
    setIsRoutingModalOpen(true);
    refreshData();
  };

  const handleTrackComplaintFromRouting = (complaintId: string) => {
    setIsRoutingModalOpen(false);
    setSelectedComplaintId(complaintId);
    setCurrentView('complaint_detail');
  };

  const handleOpenRealSmsModal = (complaintId: string, _phone?: string) => {
    const c = StorageService.getComplaintById(complaintId);
    if (c) {
      setRealSmsComplaint(c);
      setIsRealSmsModalOpen(true);
    }
  };

  const content = (
    <div className="min-h-screen bg-[#F8FAF6] text-[#1E293B] flex flex-col selection:bg-[#22C55E]/30">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onUserChange={handleUserChange}
        language={language}
        onLanguageChange={setLanguage}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        onNavigate={handleNavigate}
        notifications={notifications}
        onRefreshNotifications={refreshData}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {currentView === 'landing' && (
          <LandingView
            language={language}
            onNavigate={handleNavigate}
            onOpenReport={() => setIsReportModalOpen(true)}
          />
        )}

        {currentView === 'citizen_dashboard' && (
          <CitizenDashboard
            currentUser={currentUser}
            complaints={complaints}
            language={language}
            onNavigate={handleNavigate}
            onOpenReport={() => setIsReportModalOpen(true)}
          />
        )}

        {currentView === 'my_reports' && (
          <CitizenDashboard
            currentUser={currentUser}
            complaints={complaints}
            language={language}
            onNavigate={handleNavigate}
            onOpenReport={() => setIsReportModalOpen(true)}
            initialFilter="All"
          />
        )}

        {currentView === 'problems_near_me' && (
          <ProblemsNearMeView
            complaints={complaints}
            language={language}
            onNavigateToDetail={(id) => handleNavigate('complaint_detail', id)}
            onRefreshComplaints={refreshData}
          />
        )}

        {currentView === 'complaint_detail' && selectedComplaintId && (
          <ComplaintDetailView
            complaintId={selectedComplaintId}
            currentUser={currentUser}
            language={language}
            onBack={() => {
              if (currentUser.role === 'STAFF') setCurrentView('staff_dashboard');
              else if (currentUser.role === 'ADMIN') setCurrentView('admin_dashboard');
              else setCurrentView('citizen_dashboard');
            }}
            onNavigateToDetail={(id) => handleNavigate('complaint_detail', id)}
            onRefreshComplaint={refreshData}
          />
        )}

        {currentView === 'staff_dashboard' && (
          <StaffDashboardView
            currentUser={currentUser}
            complaints={complaints}
            language={language}
            onNavigateToDetail={(id) => handleNavigate('complaint_detail', id)}
            onRefreshComplaints={refreshData}
          />
        )}

        {currentView === 'admin_dashboard' && (
          <AdminDashboardView
            complaints={complaints}
            language={language}
            onNavigateToDetail={(id) => handleNavigate('complaint_detail', id)}
            onRefreshAll={refreshData}
          />
        )}

        {currentView === 'track_complaint' && (
          <TrackComplaintModal
            language={language}
            onNavigateToDetail={(id) => handleNavigate('complaint_detail', id)}
          />
        )}

        {currentView === 'trending_issues' && (
          <div className="space-y-4 max-w-6xl mx-auto pb-20">
            <TrendingIssuesChart complaints={complaints} language={language} />
          </div>
        )}

        {currentView === 'help_civic' && (
          <HelpCivicView language={language} />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentView={currentView}
        userRole={currentUser.role}
        language={language}
        onNavigate={handleNavigate}
      />

      {/* Modals */}
      <ReportProblemModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentUser={currentUser}
        language={language}
        onComplaintSubmitted={handleComplaintSubmitted}
        onNavigateToDetail={(id) => handleNavigate('complaint_detail', id)}
      />

      <RoutingVisualizationModal
        isOpen={isRoutingModalOpen}
        onClose={() => setIsRoutingModalOpen(false)}
        complaint={lastSubmittedComplaint}
        routingDecision={lastRoutingDecision}
        language={language}
        onTrackComplaint={handleTrackComplaintFromRouting}
        onOpenRealSmsModal={handleOpenRealSmsModal}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserSelect={handleUserChange}
        language={language}
      />

      {/* Real Mobile SMS Modal */}
      <RealMobileSmsModal
        isOpen={isRealSmsModalOpen}
        onClose={() => setIsRealSmsModalOpen(false)}
        complaint={realSmsComplaint}
      />

      {/* Floating Mobile SMS Notification Toast */}
      <MobileSmsToast
        onTrackComplaint={(id) => handleNavigate('complaint_detail', id)}
        onOpenRealSmsModal={handleOpenRealSmsModal}
      />
    </div>
  );

  // If mobile frame emulation is toggled on, wrap in phone mockup frame
  if (isMobileFrame) {
    return (
      <div className="min-h-screen bg-slate-900 py-6 px-2 flex flex-col items-center justify-center">
        {/* Frame Top Info */}
        <div className="text-center text-slate-400 text-xs mb-2 flex items-center gap-3">
          <span className="font-mono">📱 Mobile App Simulation (Mysuru Civic Mobile)</span>
          <button
            onClick={() => setIsMobileFrame(false)}
            className="text-[#22C55E] hover:underline font-bold"
          >
            Exit Frame
          </button>
        </div>

        <div className="mobile-device-frame w-full">
          {/* Phone speaker notch */}
          <div className="w-full bg-[#1E293B] h-6 flex items-center justify-center relative z-50">
            <div className="w-20 h-3.5 bg-black/40 rounded-full" />
          </div>

          <div className="h-[820px] overflow-y-auto">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
}

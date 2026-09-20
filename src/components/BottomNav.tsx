import React from 'react';
import {
  Home,
  PlusCircle,
  FileSpreadsheet,
  MapPin,
  HelpCircle,
  Briefcase,
  ShieldCheck,
  Flame,
  Search,
  TrendingUp,
} from 'lucide-react';
import { UserRole } from '../types';
import { Language, translations } from '../data/translations';

interface BottomNavProps {
  currentView: string;
  userRole: UserRole;
  language: Language;
  onNavigate: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  userRole,
  language,
  onNavigate,
}) => {
  const t = translations[language];

  if (userRole === 'CITIZEN') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 max-w-lg md:max-w-none mx-auto">
        <div className="flex items-center justify-around">
          <button
            id="bottom-nav-home"
            onClick={() => onNavigate('citizen_dashboard')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 text-[11px] font-medium transition-colors ${
              currentView === 'citizen_dashboard'
                ? 'text-[#087F5B] font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span>Home</span>
          </button>

          <button
            id="bottom-nav-reports"
            onClick={() => onNavigate('my_reports')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 text-[11px] font-medium transition-colors ${
              currentView === 'my_reports'
                ? 'text-[#087F5B] font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5 mb-0.5" />
            <span>{t.myReports}</span>
          </button>

          {/* Primary Action Button: Report Problem */}
          <button
            id="bottom-nav-report-action"
            onClick={() => onNavigate('report_problem')}
            className="flex flex-col items-center justify-center -mt-5"
          >
            <div className="w-13 h-13 rounded-full bg-[#087F5B] hover:bg-[#066347] active:scale-95 text-white shadow-xl flex items-center justify-center transition-transform border-4 border-white">
              <PlusCircle className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-bold text-[#087F5B] mt-0.5">
              Report
            </span>
          </button>

          <button
            id="bottom-nav-map"
            onClick={() => onNavigate('problems_near_me')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 text-[11px] font-medium transition-colors ${
              currentView === 'problems_near_me'
                ? 'text-[#087F5B] font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-5 h-5 mb-0.5" />
            <span>Near Me</span>
          </button>

          <button
            id="bottom-nav-help"
            onClick={() => onNavigate('help_civic')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 text-[11px] font-medium transition-colors ${
              currentView === 'help_civic'
                ? 'text-[#087F5B] font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-5 h-5 mb-0.5" />
            <span>Help</span>
          </button>
        </div>
      </nav>
    );
  }

  if (userRole === 'STAFF') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 max-w-lg md:max-w-none mx-auto">
        <div className="flex items-center justify-around">
          <button
            id="bottom-staff-tasks"
            onClick={() => onNavigate('staff_dashboard')}
            className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[11px] font-medium transition-colors ${
              currentView === 'staff_dashboard'
                ? 'text-[#087F5B] font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-5 h-5 mb-0.5" />
            <span>Staff Queue</span>
          </button>

          <button
            id="bottom-staff-map"
            onClick={() => onNavigate('problems_near_me')}
            className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[11px] font-medium transition-colors ${
              currentView === 'problems_near_me'
                ? 'text-[#087F5B] font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-5 h-5 mb-0.5" />
            <span>Field Map</span>
          </button>

          <button
            id="bottom-staff-track"
            onClick={() => onNavigate('track_complaint')}
            className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[11px] font-medium transition-colors ${
              currentView === 'track_complaint'
                ? 'text-[#087F5B] font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-5 h-5 mb-0.5" />
            <span>Lookup</span>
          </button>

          <button
            id="bottom-staff-help"
            onClick={() => onNavigate('help_civic')}
            className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[11px] font-medium transition-colors ${
              currentView === 'help_civic'
                ? 'text-[#087F5B] font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-5 h-5 mb-0.5" />
            <span>SOP & Directory</span>
          </button>
        </div>
      </nav>
    );
  }

  // Administrator
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 max-w-lg md:max-w-none mx-auto">
      <div className="flex items-center justify-around">
        <button
          id="bottom-admin-console"
          onClick={() => onNavigate('admin_dashboard')}
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[11px] font-medium transition-colors ${
            currentView === 'admin_dashboard'
              ? 'text-[#087F5B] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-5 h-5 mb-0.5" />
          <span>Admin Console</span>
        </button>

        <button
          id="bottom-admin-trends"
          onClick={() => onNavigate('trending_issues')}
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[11px] font-medium transition-colors ${
            currentView === 'trending_issues'
              ? 'text-[#087F5B] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span>Trends</span>
        </button>

        <button
          id="bottom-admin-map"
          onClick={() => onNavigate('problems_near_me')}
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[11px] font-medium transition-colors ${
            currentView === 'problems_near_me'
              ? 'text-[#087F5B] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span>City Map</span>
        </button>

        <button
          id="bottom-admin-help"
          onClick={() => onNavigate('help_civic')}
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[11px] font-medium transition-colors ${
            currentView === 'help_civic'
              ? 'text-[#087F5B] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-5 h-5 mb-0.5" />
          <span>Helplines</span>
        </button>
      </div>
    </nav>
  );
};

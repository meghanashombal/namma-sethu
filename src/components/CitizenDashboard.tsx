import React, { useState } from 'react';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  FileSpreadsheet,
  MapPin,
  Search,
  Bell,
  HelpCircle,
  User as UserIcon,
  ChevronRight,
  Filter,
  Flame,
  ArrowUpRight,
  ExternalLink,
  TrendingUp,
  MessageSquare,
  Smartphone,
} from 'lucide-react';
import { Complaint, User, ComplaintStatus } from '../types';
import { Language, translations } from '../data/translations';
import { TrendingIssuesChart } from './TrendingIssuesChart';
import { SmsInboxModal } from './SmsInboxModal';

interface CitizenDashboardProps {
  currentUser: User;
  complaints: Complaint[];
  language: Language;
  onNavigate: (view: string, complaintId?: string) => void;
  onOpenReport: () => void;
  initialFilter?: string;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  currentUser,
  complaints,
  language,
  onNavigate,
  onOpenReport,
  initialFilter = 'All',
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTrendingChart, setShowTrendingChart] = useState<boolean>(false);
  const [isSmsInboxOpen, setIsSmsInboxOpen] = useState<boolean>(false);

  const t = translations[language];

  // Filter complaints by citizen
  const citizenComplaints = complaints.filter(
    (c) => c.citizenId === currentUser.id || c.citizenName.includes(currentUser.name.split(' ')[0])
  );

  // Compute metric counts
  const totalCount = citizenComplaints.length;
  const inProgressCount = citizenComplaints.filter(
    (c) => c.status === 'In Progress' || c.status === 'Assigned' || c.status === 'Acknowledged'
  ).length;
  const resolvedCount = citizenComplaints.filter((c) => c.status === 'Resolved').length;
  const awaitingVerificationCount = citizenComplaints.filter(
    (c) => c.status === 'Awaiting Verification'
  ).length;
  const slaBreachedCount = citizenComplaints.filter(
    (c) => c.status === 'SLA Breached' || c.routingDecision?.routingSlaStatus === 'SLA Breached'
  ).length;
  const escalatedCount = citizenComplaints.filter(
    (c) => c.status === 'Escalated' || (c.escalationLevel && c.escalationLevel > 0)
  ).length;

  // Filter list
  const filteredList = citizenComplaints.filter((c) => {
    // Filter condition
    if (selectedFilter === 'In Progress') {
      if (!['In Progress', 'Assigned', 'Acknowledged'].includes(c.status)) return false;
    } else if (selectedFilter === 'Resolved') {
      if (c.status !== 'Resolved') return false;
    } else if (selectedFilter === 'Awaiting Verification') {
      if (c.status !== 'Awaiting Verification') return false;
    } else if (selectedFilter === 'SLA Breached') {
      if (c.status !== 'SLA Breached' && c.routingDecision?.routingSlaStatus !== 'SLA Breached')
        return false;
    } else if (selectedFilter === 'Escalated') {
      if (c.status !== 'Escalated' && (!c.escalationLevel || c.escalationLevel === 0)) return false;
    } else if (selectedFilter === 'Closed') {
      if (c.status !== 'Closed') return false;
    } else if (selectedFilter === 'Reopened') {
      if (c.status !== 'Reopened') return false;
    } else if (selectedFilter === 'Submitted') {
      if (c.status !== 'Submitted') return false;
    } else if (selectedFilter === 'Routed') {
      if (c.status !== 'Routed') return false;
    }

    // Search condition
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = c.id.toLowerCase().includes(q);
      const matchCat = c.category.toLowerCase().includes(q);
      const matchLoc = (c.locationName || '').toLowerCase().includes(q);
      const matchDesc = (c.description || '').toLowerCase().includes(q);
      if (!matchId && !matchCat && !matchLoc && !matchDesc) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#087F5B] to-[#066347] text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#A7F3D0] text-xs font-semibold uppercase tracking-wider mb-1">
              <span>Mysuru Citizen Portal</span>
              <span>•</span>
              <span>Ward Grievance Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Welcome, {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-lg">
              Report civic problems anytime. Your complaints are dynamically routed to verified municipal departments within 24 hours.
            </p>
          </div>

          <button
            id="dash-report-action-btn"
            onClick={onOpenReport}
            className="px-5 py-3 rounded-2xl bg-[#22C55E] hover:bg-[#16a34a] active:scale-95 text-slate-900 font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 self-start sm:self-auto transition-transform cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{t.reportAProblem}</span>
          </button>
        </div>
      </div>

      {/* 6 Clickable Metric Cards */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Complaint Status Overview (Click to filter)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1: My Reports */}
          <button
            id="metric-all-reports"
            onClick={() => setSelectedFilter('All')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedFilter === 'All'
                ? 'bg-[#087F5B] text-white border-[#087F5B] shadow-md scale-102'
                : 'bg-white text-slate-800 border-slate-200 hover:border-[#087F5B]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold opacity-80">My Reports</span>
              <FileSpreadsheet className="w-4 h-4 text-[#22C55E]" />
            </div>
            <p className="text-2xl font-black">{totalCount}</p>
            <p className="text-[10px] opacity-70 mt-0.5">Total logged</p>
          </button>

          {/* Card 2: In Progress */}
          <button
            id="metric-in-progress"
            onClick={() => setSelectedFilter('In Progress')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedFilter === 'In Progress'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-102'
                : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold opacity-80">In Progress</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black">{inProgressCount}</p>
            <p className="text-[10px] opacity-70 mt-0.5">Active with field teams</p>
          </button>

          {/* Card 3: Resolved */}
          <button
            id="metric-resolved"
            onClick={() => setSelectedFilter('Resolved')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedFilter === 'Resolved'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-102'
                : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold opacity-80">Resolved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black">{resolvedCount}</p>
            <p className="text-[10px] opacity-70 mt-0.5">Work completed</p>
          </button>

          {/* Card 4: Awaiting Verification */}
          <button
            id="metric-awaiting-verification"
            onClick={() => setSelectedFilter('Awaiting Verification')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedFilter === 'Awaiting Verification'
                ? 'bg-purple-600 text-white border-purple-600 shadow-md scale-102'
                : 'bg-white text-slate-800 border-slate-200 hover:border-purple-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold opacity-80">Awaiting Verify</span>
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
            </div>
            <p className="text-2xl font-black text-purple-600 group-hover:text-white">
              {awaitingVerificationCount}
            </p>
            <p className="text-[10px] opacity-70 mt-0.5">Needs your review</p>
          </button>

          {/* Card 5: SLA Breached */}
          <button
            id="metric-sla-breached"
            onClick={() => setSelectedFilter('SLA Breached')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedFilter === 'SLA Breached'
                ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-102'
                : 'bg-white text-slate-800 border-slate-200 hover:border-rose-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold opacity-80">SLA Breached</span>
              <AlertOctagon className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-black text-rose-600">{slaBreachedCount}</p>
            <p className="text-[10px] opacity-70 mt-0.5">Overdue resolution</p>
          </button>

          {/* Card 6: Escalated */}
          <button
            id="metric-escalated"
            onClick={() => setSelectedFilter('Escalated')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedFilter === 'Escalated'
                ? 'bg-amber-600 text-white border-amber-600 shadow-md scale-102'
                : 'bg-white text-slate-800 border-slate-200 hover:border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold opacity-80">Escalated</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600">{escalatedCount}</p>
            <p className="text-[10px] opacity-70 mt-0.5">To higher supervisor</p>
          </button>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <button
            id="qa-report-btn"
            onClick={onOpenReport}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-[#087F5B] transition-colors text-center cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 mb-1 text-[#22C55E]" />
            <span className="text-[11px] font-bold">Report Problem</span>
          </button>

          <button
            id="qa-myreports-btn"
            onClick={() => setSelectedFilter('All')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-center cursor-pointer"
          >
            <FileSpreadsheet className="w-5 h-5 mb-1 text-slate-600" />
            <span className="text-[11px] font-bold">My Reports</span>
          </button>

          <button
            id="qa-nearme-btn"
            onClick={() => onNavigate('problems_near_me')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-center cursor-pointer"
          >
            <MapPin className="w-5 h-5 mb-1 text-emerald-600" />
            <span className="text-[11px] font-bold">Problems Near Me</span>
          </button>

          <button
            id="qa-track-btn"
            onClick={() => onNavigate('track_complaint')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-center cursor-pointer"
          >
            <Search className="w-5 h-5 mb-1 text-blue-600" />
            <span className="text-[11px] font-bold">Track ID</span>
          </button>

          <button
            id="qa-profile-btn"
            onClick={() => onNavigate('auth')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-center cursor-pointer"
          >
            <UserIcon className="w-5 h-5 mb-1 text-purple-600" />
            <span className="text-[11px] font-bold">Profile / Switch</span>
          </button>

          <button
            id="qa-trending-btn"
            onClick={() => setShowTrendingChart(!showTrendingChart)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-colors text-center cursor-pointer ${
              showTrendingChart
                ? 'bg-[#087F5B] text-white shadow-sm'
                : 'bg-emerald-50 hover:bg-emerald-100/80 text-[#087F5B]'
            }`}
          >
            <TrendingUp className={`w-5 h-5 mb-1 ${showTrendingChart ? 'text-white' : 'text-[#087F5B]'}`} />
            <span className="text-[11px] font-bold">Trending Issues</span>
          </button>

          <button
            id="qa-help-btn"
            onClick={() => onNavigate('help_civic')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-center cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 mb-1 text-amber-600" />
            <span className="text-[11px] font-bold">Helpline & FAQ</span>
          </button>

          <button
            id="qa-sms-btn"
            onClick={() => setIsSmsInboxOpen(true)}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-[#087F5B] transition-colors text-center cursor-pointer border border-emerald-200/60"
          >
            <div className="relative">
              <Smartphone className="w-5 h-5 mb-1 text-[#087F5B]" />
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[11px] font-bold">SMS Tracking</span>
          </button>
        </div>
      </div>

      {/* Recharts Trending Civic Issues Section (collapsible / toggleable) */}
      {showTrendingChart && (
        <div className="animate-in fade-in slide-in-from-top-3 duration-200">
          <TrendingIssuesChart complaints={complaints} language={language} />
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900">
              Complaints ({filteredList.length})
            </h2>
            {selectedFilter !== 'All' && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#087F5B]/10 text-[#087F5B]">
                Filter: {selectedFilter}
              </span>
            )}
          </div>

          {/* Search by ID, Category, or Location */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="citizen-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, Category, Locality..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#087F5B] bg-white"
            />
          </div>
        </div>

        {/* Scrollable Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            'All',
            'Submitted',
            'Routed',
            'In Progress',
            'Resolved',
            'Awaiting Verification',
            'Closed',
            'Reopened',
            'SLA Breached',
            'Escalated',
          ].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedFilter(status)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedFilter === status
                  ? 'bg-[#087F5B] text-white font-bold shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Complaint Cards List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-700 text-sm">
              No complaints match the selected filter.
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try choosing a different status filter or click below to submit a new complaint.
            </p>
            <button
              onClick={onOpenReport}
              className="px-4 py-2 rounded-xl bg-[#087F5B] text-white font-bold text-xs hover:bg-[#066347]"
            >
              Report a Problem
            </button>
          </div>
        ) : (
          filteredList.map((comp) => {
            const isAwaitingVerify = comp.status === 'Awaiting Verification';
            const isBreached =
              comp.status === 'SLA Breached' ||
              comp.routingDecision?.routingSlaStatus === 'SLA Breached';
            const isEscalated = comp.status === 'Escalated' || (comp.escalationLevel && comp.escalationLevel > 0);

            return (
              <div
                key={comp.id}
                id={`complaint-card-${comp.id}`}
                onClick={() => onNavigate('complaint_detail', comp.id)}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all hover:shadow-md cursor-pointer group relative ${
                  isAwaitingVerify
                    ? 'border-purple-300 ring-2 ring-purple-100 bg-purple-50/20'
                    : isBreached
                    ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20'
                    : 'border-slate-200 hover:border-[#087F5B]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#087F5B] bg-[#087F5B]/10 px-2 py-0.5 rounded-md">
                      #{comp.id}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        comp.status === 'Resolved' || comp.status === 'Closed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : comp.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : comp.status === 'Awaiting Verification'
                          ? 'bg-purple-100 text-purple-800 animate-pulse'
                          : comp.status === 'SLA Breached'
                          ? 'bg-rose-100 text-rose-800'
                          : comp.status === 'Escalated'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {comp.status}
                    </span>

                    {comp.priority === 'High' || comp.priority === 'Emergency' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        {comp.priority}
                      </span>
                    ) : null}
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">
                    Reported {new Date(comp.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="mt-2.5 flex items-start gap-3">
                  {comp.photoUrls && comp.photoUrls.length > 0 && (
                    <img
                      src={comp.photoUrls[0]}
                      alt="Complaint preview"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#087F5B] transition-colors">
                      {comp.category}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                      {comp.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{comp.locationName}</span>
                      </span>
                      <span>•</span>
                      <span className="text-slate-700 font-medium">
                        {comp.routingDecision?.department || 'Assigned Department'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom SLA / Verification Alert Bar */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {isAwaitingVerify ? (
                    <div className="flex items-center gap-1.5 text-purple-700 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Resolution proof submitted — click to verify</span>
                    </div>
                  ) : isBreached ? (
                    <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                      <AlertOctagon className="w-4 h-4" />
                      <span>🔴 SLA Breached — Overdue by target date</span>
                    </div>
                  ) : isEscalated ? (
                    <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Escalated to Level {comp.escalationLevel}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Expected Resolution: <strong>{comp.expectedResolutionDate}</strong></span>
                    </div>
                  )}

                  <span className="text-[11px] font-bold text-[#087F5B] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Track Detail
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SMS Inbox Modal */}
      <SmsInboxModal
        isOpen={isSmsInboxOpen}
        onClose={() => setIsSmsInboxOpen(false)}
        onTrackComplaint={(id) => onNavigate('complaint_detail', id)}
      />
    </div>
  );
};

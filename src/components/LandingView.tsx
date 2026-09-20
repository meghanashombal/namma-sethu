import React from 'react';
import {
  ArrowRight,
  Shield,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  Sparkles,
  GitBranch,
  QrCode,
  Layers,
  ChevronRight,
  PhoneCall,
  Lock,
  TrendingUp,
} from 'lucide-react';
import { Language, translations } from '../data/translations';

interface LandingViewProps {
  language: Language;
  onNavigate: (view: string, complaintId?: string) => void;
  onOpenReport: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  language,
  onNavigate,
  onOpenReport,
}) => {
  const t = translations[language];

  return (
    <div className="space-y-8 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#087F5B] via-[#066347] to-[#1E293B] text-white p-6 sm:p-10 shadow-xl">
        {/* Subtle decorative bridge arches background */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full border-[18px] border-white/5 pointer-events-none" />
        <div className="absolute right-20 -top-20 w-60 h-60 rounded-full border-[14px] border-[#22C55E]/10 pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/30 text-[#A7F3D0] text-xs font-bold uppercase tracking-wider">
            <span>🏛️</span>
            <span>Mysuru Civic Governance Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {t.appName}
            <span className="block text-[#22C55E] text-2xl sm:text-3xl font-extrabold mt-1">
              “{t.tagline}”
            </span>
          </h1>

          <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-xl font-normal">
            {t.heroHeadline}
          </p>

          <p className="text-xs text-[#A7F3D0] italic border-l-2 border-[#22C55E] pl-3 py-0.5">
            {t.heroQuote}
          </p>

          {/* Core Landing Page Buttons - All Working! */}
          <div className="pt-3 flex flex-wrap gap-3">
            <button
              id="hero-report-btn"
              onClick={onOpenReport}
              className="px-5 py-3 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] active:scale-95 text-slate-900 font-bold text-sm shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>{t.reportAProblem}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-nearme-btn"
              onClick={() => onNavigate('problems_near_me')}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-sm border border-white/20 backdrop-blur-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#A7F3D0]" />
              <span>{t.problemsNearMe}</span>
            </button>

            <button
              id="hero-trending-btn"
              onClick={() => onNavigate('trending_issues')}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-sm border border-white/20 backdrop-blur-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-[#22C55E]" />
              <span>Trending Issues</span>
            </button>

            <button
              id="hero-track-btn"
              onClick={() => onNavigate('track_complaint')}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-sm border border-white/20 backdrop-blur-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileSearch className="w-4 h-4 text-[#A7F3D0]" />
              <span>{t.trackComplaint}</span>
            </button>

            <button
              id="hero-login-btn"
              onClick={() => onNavigate('auth')}
              className="px-4 py-3 rounded-xl bg-black/25 hover:bg-black/35 text-white font-semibold text-sm border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4 text-white/70" />
              <span>{t.login}</span>
            </button>

            <button
              id="hero-signup-btn"
              onClick={() => onNavigate('auth')}
              className="px-4 py-3 rounded-xl bg-black/25 hover:bg-black/35 text-[#A7F3D0] font-semibold text-sm border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>{t.signUp}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Hackathon Demo Flow Quick Launcher */}
      <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-[#087F5B]">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Hackathon Live Demonstration Scenarios
              </h2>
              <p className="text-xs text-slate-500">
                Click any scenario below to test end-to-end routing, SLAs, escalation & verification
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-[#087F5B] border border-emerald-200">
            DEMO READY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Demo 1 */}
          <button
            id="demo-flow-1-btn"
            onClick={() => onNavigate('complaint_detail', 'MY-2026-1001')}
            className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#087F5B] mb-1">
              <span>DEMO 1: Standard Flow</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-xs font-semibold text-slate-800">
              #MY-2026-1001: Pothole in Jayalakshmipuram
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Test Smart Routing, 24h SLA, Staff assignment & timeline tracking.
            </p>
          </button>

          {/* Demo 2 */}
          <button
            id="demo-flow-2-btn"
            onClick={() => onNavigate('complaint_detail', 'MY-2026-0942')}
            className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-bold text-rose-700 mb-1">
              <span>DEMO 2: SLA Breached</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-xs font-semibold text-slate-800">
              #MY-2026-0942: Kuvempunagar Streetlight
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Overdue complaint automatically escalated to Level 2 (AEE Supervisor).
            </p>
          </button>

          {/* Demo 3 */}
          <button
            id="demo-flow-3-btn"
            onClick={() => onNavigate('complaint_detail', 'MY-2026-0915')}
            className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-bold text-blue-700 mb-1">
              <span>DEMO 3: Citizen Verification</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-xs font-semibold text-slate-800">
              #MY-2026-0915: VVWW Water Pipeline
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Staff uploaded Before/After proof. Test "Yes Resolved" vs "No Reopen"!
            </p>
          </button>

          {/* Demo 4 */}
          <button
            id="demo-flow-4-btn"
            onClick={() => onNavigate('complaint_detail', 'MY-2026-0880')}
            className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-bold text-amber-700 mb-1">
              <span>DEMO 4: Dynamic Jurisdiction</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-xs font-semibold text-slate-800">
              #MY-2026-0880: Hinkal Historical Record
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Retained Hinkal Gram Panchayat routing even after Sept 1 MCC merger.
            </p>
          </button>
        </div>
      </section>

      {/* The 4 Architectural Innovations */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B]">
            Core Civic Innovations
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            How Namma Sethu Bridges Citizens to Civic Action
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Explainable Routing */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#087F5B] flex items-center justify-center font-bold">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              1. Explainable Routing
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every complaint reveals the exact jurisdiction, responsibility rule, and official authority. No black-box decisions.
            </p>
          </div>

          {/* Card 2: Dynamic Jurisdiction */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              2. Dynamic Jurisdiction
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Supports temporal boundary versions (e.g. Gram Panchayat upgraded to MCC Zone 8). Historical records remain tamper-proof.
            </p>
          </div>

          {/* Card 3: 24-Hour SLA Accountability */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              3. 24h Routing Accountability
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The system guarantees complaints reach the responsible ward desk within 24 hours, backed by automatic escalation.
            </p>
          </div>

          {/* Card 4: Citizen Verification */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              4. Citizen Verification
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Staff cannot unilaterally close complaints. Citizens must inspect Before & After proof and confirm "YES, RESOLVED".
            </p>
          </div>
        </div>
      </section>

      {/* Civic Authorities Covered */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Official Mysore Data Integrated
            </h3>
            <p className="text-xs text-slate-500">
              Directly mapped from Official Mysuru Municipal & Tahsildar Gazette
            </p>
          </div>
          <button
            onClick={() => onNavigate('help_civic')}
            className="text-xs font-bold text-[#087F5B] hover:underline flex items-center gap-1 self-start"
          >
            <span>View All Official Helplines</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-lg font-black text-[#087F5B]">65</p>
            <p className="text-[11px] font-semibold text-slate-600">MCC Wards</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-lg font-black text-[#087F5B]">9 Zones</p>
            <p className="text-[11px] font-semibold text-slate-600">Admin Divisions</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-lg font-black text-[#087F5B]">4 TMCs</p>
            <p className="text-[11px] font-semibold text-slate-600">Town Municipal Councils</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-lg font-black text-[#087F5B]">9 Taluks</p>
            <p className="text-[11px] font-semibold text-slate-600">Tahsildar Jurisdictions</p>
          </div>
        </div>
      </section>
    </div>
  );
};

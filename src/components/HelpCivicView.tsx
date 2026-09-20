import React from 'react';
import {
  HelpCircle,
  Phone,
  Clock,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Building,
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { Language, translations } from '../data/translations';

interface HelpCivicViewProps {
  language: Language;
}

export const HelpCivicView: React.FC<HelpCivicViewProps> = ({ language }) => {
  const t = translations[language];
  const helplines = StorageService.getHelplines();
  const sources = StorageService.getOfficialSources();

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#087F5B]" />
          <span>{t.helpAndInfo}</span>
        </h1>
        <p className="text-xs text-slate-500">
          Guide to Mysore civic grievance redressal, emergency contacts, SLA charters and statutory authorities.
        </p>
      </div>

      {/* Official Civic Helplines Directory */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Phone className="w-4 h-4 text-[#087F5B]" />
          <h2 className="font-bold text-sm">
            Official Mysuru Municipal Helplines & Control Rooms
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {helplines.map((hl) => (
            <div
              key={hl.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 hover:border-[#087F5B] transition-colors"
            >
              <div className="flex justify-between items-start">
                <strong className="text-slate-900 text-xs">{hl.department}</strong>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                  {hl.authority}
                </span>
              </div>
              <p className="text-[#087F5B] font-mono font-bold text-sm">{hl.phone}</p>
              <p className="text-[11px] text-slate-500">{hl.purpose}</p>
              <span className="text-[10px] text-slate-400 block pt-0.5">Hours: {hl.timings}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ & Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2 text-xs">
          <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
            <span className="text-base">🌉</span>
            <span>How does Smart Routing work?</span>
          </h3>
          <p className="text-slate-600 leading-relaxed">
            When you report a problem, Namma Sethu checks your coordinates against the active territorial jurisdiction layer. Based on the issue type (e.g. road damage vs water leak), it automatically assigns the grievance to the statutory responsible department under Mysuru City Corporation, Town Municipal Councils, or Gram Panchayats.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2 text-xs">
          <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>What is the 24-Hour Routing SLA?</span>
          </h3>
          <p className="text-slate-600 leading-relaxed">
            The platform guarantees that within 24 hours of submission, your grievance is placed in the designated field engineer’s active queue. If routing is delayed, an audit alarm is raised to the Administrative Grievance Officer.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2 text-xs">
          <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>How does Automated Escalation operate?</span>
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Every category has a target resolution SLA (e.g., 3 days for potholes). If work is not completed by the target date, the complaint advances automatically: Level 1 (Ward AEE) &rarr; Level 2 (Executive Engineer) &rarr; Level 3 (Superintending Engineer) &rarr; Level 4 (Commissioner).
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2 text-xs">
          <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>How does Citizen Verification protect you?</span>
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Staff cannot unilaterally close a complaint. When staff finish repairs, they must upload photographic proof. You receive a notification to verify on-site. Only when you click <strong>YES, ISSUE RESOLVED</strong> is the case formally closed. If you click <strong>NO</strong>, it is reopened for rework.
          </p>
        </div>
      </div>

      {/* Official Sources Citation */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
        <h3 className="font-bold text-slate-900">
          Statutory Sources & Mysore District Governance Reference
        </h3>
        <div className="space-y-2">
          {sources.map((s) => (
            <div key={s.id} className="flex justify-between items-center text-slate-600">
              <span>{s.name} ({s.authority})</span>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-[#087F5B] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{s.url.replace('https://', '')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

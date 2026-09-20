import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { Complaint } from '../types';
import { Language, translations } from '../data/translations';

interface TrackComplaintModalProps {
  language: Language;
  onNavigateToDetail: (id: string) => void;
}

export const TrackComplaintModal: React.FC<TrackComplaintModalProps> = ({
  language,
  onNavigateToDetail,
}) => {
  const [query, setQuery] = useState<string>('MY-2026-1001');
  const [result, setResult] = useState<Complaint | null>(() =>
    StorageService.getComplaintById('MY-2026-1001') || null
  );
  const [searched, setSearched] = useState<boolean>(true);

  const t = translations[language];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const found = StorageService.getComplaintById(query.trim());
    setResult(found || null);
    setSearched(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-[#087F5B]" />
            <span>{t.trackComplaint}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your 10-character Grievance ID (e.g., <code>MY-2026-1001</code>) to track real-time departmental progress without logging in.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Complaint ID (e.g. MY-2026-1001)..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#087F5B] focus:outline-none uppercase"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-[#087F5B] hover:bg-[#066347] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            Track
          </button>
        </form>

        {/* Quick Demo ID suggestions */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span>Demo Complaint IDs:</span>
          {['MY-2026-1001', 'MY-2026-0942', 'MY-2026-0915', 'MY-2026-0880'].map((demoId) => (
            <button
              key={demoId}
              type="button"
              onClick={() => {
                setQuery(demoId);
                setResult(StorageService.getComplaintById(demoId) || null);
                setSearched(true);
              }}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-semibold"
            >
              {demoId}
            </button>
          ))}
        </div>
      </div>

      {/* Result Card */}
      {searched && (
        <div>
          {result ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-[#087F5B] bg-emerald-50 px-2.5 py-1 rounded">
                    #{result.id}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                      result.status === 'Resolved' || result.status === 'Closed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : result.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : result.status === 'Awaiting Verification'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {result.status}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  Target Date: <strong>{result.expectedResolutionDate}</strong>
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900">{result.category}</h3>
                <p className="text-xs text-slate-600 mt-1">{result.description}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Responsible Authority:</span>
                  <strong className="text-slate-900">{result.routingDecision.authority}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Department:</span>
                  <strong className="text-[#087F5B]">{result.routingDecision.department}</strong>
                </div>
                <div className="flex justify-between">
                  <span>24-hr Routing SLA:</span>
                  <strong className="text-emerald-700">{result.routingDecision.routingSlaStatus}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Approximate Location:</span>
                  <strong className="text-slate-800">{result.locationName}</strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                🔒 Privacy Protected: Citizen contact information is withheld on public tracking links.
              </p>

              <button
                onClick={() => onNavigateToDetail(result.id)}
                className="w-full py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066347] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View Full Timeline & QR Code</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-xs text-slate-500">
              No complaint found with ID "{query}". Please verify the complaint ID and try again.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

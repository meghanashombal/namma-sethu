import React, { useState } from 'react';
import {
  ShieldCheck,
  Layers,
  Clock,
  AlertTriangle,
  History,
  BarChart3,
  ExternalLink,
  Plus,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Building,
  AlertOctagon,
  FileSpreadsheet,
} from 'lucide-react';
import {
  Complaint,
  Jurisdiction,
  JurisdictionVersion,
  SlaRule,
  EscalationPolicy,
  AuditLog,
  OfficialSource,
} from '../types';
import { StorageService } from '../services/storage';
import { Language, translations } from '../data/translations';
import { TrendingIssuesChart } from './TrendingIssuesChart';

interface AdminDashboardViewProps {
  complaints: Complaint[];
  language: Language;
  onNavigateToDetail: (id: string) => void;
  onRefreshAll: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  complaints,
  language,
  onNavigateToDetail,
  onRefreshAll,
}) => {
  const [activeTab, setActiveTab] = useState<
    'transparency' | 'jurisdictions' | 'sla' | 'escalation' | 'sources' | 'audit'
  >('transparency');

  // Dynamic Jurisdiction creation state
  const [showNewVersionModal, setShowNewVersionModal] = useState<boolean>(false);
  const [selectedJurisdictionId, setSelectedJurisdictionId] = useState<string>('jur-hinkal');
  const [newVersionGoverningBody, setNewVersionGoverningBody] = useState<string>(
    'Mysuru City Corporation (MCC) - Zone 8'
  );
  const [newVersionStartDate, setNewVersionStartDate] = useState<string>('2026-09-01');
  const [newVersionNotes, setNewVersionNotes] = useState<string>(
    'Official government gazette notification merging urban sector into MCC limits.'
  );

  const t = translations[language];

  const jurisdictions = StorageService.getJurisdictions();
  const versions = StorageService.getJurisdictionVersions();
  const slaRules = StorageService.getSlaRules();
  const escalationPolicies = StorageService.getEscalationPolicies();
  const auditLogs = StorageService.getAuditLogs();
  const officialSources = StorageService.getOfficialSources();
  const hotspots = StorageService.getHotspots();

  // Compute operational statistics
  const totalCount = complaints.length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const activeCount = totalCount - resolvedCount;
  const escalatedCount = complaints.filter(
    (c) => c.status === 'Escalated' || (c.escalationLevel && c.escalationLevel > 0)
  ).length;
  const reopenedCount = complaints.filter((c) => c.status === 'Reopened').length;
  const slaBreachedCount = complaints.filter(
    (c) => c.status === 'SLA Breached' || c.routingDecision?.routingSlaStatus === 'SLA Breached'
  ).length;
  const complianceRate = totalCount > 0 ? Math.round(((totalCount - slaBreachedCount) / totalCount) * 100) : 100;

  // Breakdown by Category
  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  // Breakdown by Authority
  const authorityCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    const auth = c.routingDecision?.authority || 'Mysuru City Corporation';
    authorityCounts[auth] = (authorityCounts[auth] || 0) + 1;
  });

  // Handler: Create new jurisdiction version
  const handleCreateVersion = () => {
    const parent = jurisdictions.find((j) => j.id === selectedJurisdictionId);
    if (!parent) return;

    // Highest version number + 1
    const existingVerNumbers = versions
      .filter((v) => v.jurisdictionId === selectedJurisdictionId)
      .map((v) => v.versionNumber);
    const nextVer = Math.max(0, ...existingVerNumbers) + 1;

    StorageService.addJurisdictionVersion({
      jurisdictionId: parent.id,
      jurisdictionName: parent.name,
      versionNumber: nextVer,
      governingBody: newVersionGoverningBody,
      effectiveStartDate: newVersionStartDate,
      effectiveEndDate: null,
      isActive: true,
      changeReason: newVersionNotes,
    });

    setShowNewVersionModal(false);
    onRefreshAll();
  };

  // Handler: Reset demo seed
  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data back to the Official Mysuru Demo Seed?')) {
      StorageService.resetToOfficialSeed();
      onRefreshAll();
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto">
      {/* Admin Title & Seed Reset */}
      <div className="bg-gradient-to-r from-slate-900 to-[#087F5B] text-white p-6 rounded-3xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#A7F3D0] text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Mysuru District Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            System Administration & Policy Engine
          </h1>
          <p className="text-xs text-white/80 mt-1 max-w-xl">
            Configure dynamic temporal boundaries, statutory SLA policies, auto-escalation thresholds, and review immutable audit ledgers.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
          title="Reset back to initial clean hackathon demo data"
        >
          <RefreshCw className="w-4 h-4 text-[#A7F3D0]" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* 6 Main Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('transparency')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'transparency'
              ? 'bg-[#087F5B] text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Transparency Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('jurisdictions')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'jurisdictions'
              ? 'bg-[#087F5B] text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Dynamic Jurisdictions ({jurisdictions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sla')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'sla'
              ? 'bg-[#087F5B] text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>SLA Configuration</span>
        </button>

        <button
          onClick={() => setActiveTab('escalation')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'escalation'
              ? 'bg-[#087F5B] text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Escalation Policies</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'sources'
              ? 'bg-[#087F5B] text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ExternalLink className="w-4 h-4" />
          <span>Official Sources (Mysore)</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-[#087F5B] text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: TRANSPARENCY DASHBOARD & DEMO METRICS */}
      {activeTab === 'transparency' && (
        <div className="space-y-6">
          {/* Prominent Demo Data Banner Required by Prompt */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 text-amber-900 text-xs font-bold text-center">
            ⚠️ DEMO DATA — NOT OFFICIAL GOVERNMENT STATISTICS. FOR HACKATHON EVALUATION ONLY.
          </div>

          {/* Metric KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-left">
              <span className="text-slate-400 text-xs font-semibold">Total Grievances</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-left">
              <span className="text-slate-400 text-xs font-semibold">Active In-Flight</span>
              <p className="text-2xl font-black text-blue-600 mt-1">{activeCount}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-left">
              <span className="text-slate-400 text-xs font-semibold">Verified Resolved</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{resolvedCount}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-left">
              <span className="text-slate-400 text-xs font-semibold">Escalated (L1-L4)</span>
              <p className="text-2xl font-black text-amber-600 mt-1">{escalatedCount}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-left">
              <span className="text-slate-400 text-xs font-semibold">Reopened by Citizen</span>
              <p className="text-2xl font-black text-purple-600 mt-1">{reopenedCount}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-left">
              <span className="text-slate-400 text-xs font-semibold">SLA Compliance</span>
              <p className="text-2xl font-black text-[#087F5B] mt-1">{complianceRate}%</p>
            </div>
          </div>

          {/* Recharts Trending Civic Issues Visualization */}
          <TrendingIssuesChart complaints={complaints} language={language} />

          {/* Breakdown Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* By Category */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900">
                Complaints by Category
              </h3>
              <div className="space-y-2 text-xs">
                {Object.entries(categoryCounts).map(([cat, count]) => {
                  const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between font-medium">
                        <span>{cat}</span>
                        <span className="text-slate-500">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#087F5B]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* By Responsible Authority */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900">
                Complaints by Civic Authority
              </h3>
              <div className="space-y-2 text-xs">
                {Object.entries(authorityCounts).map(([auth, count]) => {
                  const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                  return (
                    <div key={auth} className="space-y-1">
                      <div className="flex justify-between font-medium">
                        <span>{auth}</span>
                        <span className="text-slate-500">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Hotspots Summary */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>🔥 Active Civic Hotspots</span>
              <span className="text-xs font-normal text-slate-500">
                (Clusters with 3+ repeated grievances)
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hotspots.map((spot) => (
                <div
                  key={spot.id}
                  className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs space-y-1"
                >
                  <div className="flex justify-between font-bold text-rose-900">
                    <span>{spot.name}</span>
                    <span className="bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full text-[10px]">
                      {spot.complaintCount} Reports
                    </span>
                  </div>
                  <p className="text-rose-800 text-[11px]">{spot.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DYNAMIC JURISDICTIONS & VERSION MANAGER */}
      {activeTab === 'jurisdictions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Dynamic Jurisdiction & Temporal Version Engine
              </h2>
              <p className="text-xs text-slate-500">
                When administrative boundaries shift, historical complaints retain their original routing. New complaints adopt the active version.
              </p>
            </div>

            <button
              onClick={() => setShowNewVersionModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#087F5B] hover:bg-[#066347] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Version</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {jurisdictions.map((j) => {
              const jVersions = versions.filter((v) => v.jurisdictionId === j.id);

              return (
                <div
                  key={j.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{j.name}</h3>
                      <p className="text-xs text-slate-500">
                        Type: {j.type} • Official Center: {j.centerLat}, {j.centerLng} • Radius: {j.radiusMeters}m
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-[#087F5B] font-bold border border-emerald-200 self-start">
                      Active: {jVersions.find((v) => v.isActive)?.governingBody || 'Active'}
                    </span>
                  </div>

                  {/* Versions Table */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700">Version History:</p>
                    <div className="space-y-1.5 text-xs">
                      {jVersions.map((ver) => (
                        <div
                          key={ver.id}
                          className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                            ver.isActive
                              ? 'bg-emerald-50/60 border-emerald-200'
                              : 'bg-slate-50 border-slate-200 opacity-75'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">
                                Version {ver.versionNumber}: {ver.governingBody}
                              </span>
                              {ver.isActive && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#22C55E] text-slate-900">
                                  CURRENT ACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              Effective: {ver.effectiveStartDate} {ver.effectiveEndDate ? `to ${ver.effectiveEndDate}` : 'onwards'}
                            </p>
                            <p className="text-[11px] text-slate-500 italic mt-0.5">
                              Note: {ver.changeReason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal: Create New Version */}
          {showNewVersionModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-sm text-slate-900">
                    Create New Jurisdiction Version
                  </h3>
                  <button onClick={() => setShowNewVersionModal(false)} className="text-slate-400">
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Target Jurisdiction:
                    </label>
                    <select
                      value={selectedJurisdictionId}
                      onChange={(e) => setSelectedJurisdictionId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                    >
                      {jurisdictions.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.name} ({j.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      New Governing Body Authority:
                    </label>
                    <input
                      type="text"
                      value={newVersionGoverningBody}
                      onChange={(e) => setNewVersionGoverningBody(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Effective Start Date:
                    </label>
                    <input
                      type="date"
                      value={newVersionStartDate}
                      onChange={(e) => setNewVersionStartDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Administrative Gazette / Change Justification:
                    </label>
                    <textarea
                      rows={2}
                      value={newVersionNotes}
                      onChange={(e) => setNewVersionNotes(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCreateVersion}
                  className="w-full py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066347] text-white text-xs font-bold"
                >
                  Activate Version (Auto-deactivates previous)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SLA CONFIGURATION */}
      {activeTab === 'sla' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <p className="font-bold">
              Mandatory 24-Hour Routing SLA: Enabled for 100% of Mysore grievances.
            </p>
            <p className="text-emerald-700">
              Citizens are guaranteed that within 24 hours of submission, their problem is assigned to the verified municipal department.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900">
                Resolution SLAs by Category & Authority
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Working Days vs Calendar Days
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {slaRules.map((rule) => (
                <div key={rule.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-slate-900 block">{rule.category}</span>
                    <span className="text-slate-500 text-[11px]">
                      Authority: {rule.authority} • Type: {rule.isWorkingDays ? 'Working Days' : 'Calendar Days'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-[#087F5B]">
                      {rule.expectedResolutionDays} Days
                    </span>
                    <button
                      onClick={() => {
                        const newDays = prompt('Enter new resolution days:', String(rule.expectedResolutionDays));
                        if (newDays && !isNaN(Number(newDays))) {
                          StorageService.updateSlaRule(rule.id, Number(newDays), true);
                          onRefreshAll();
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                    >
                      Edit SLA
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ESCALATION POLICIES */}
      {activeTab === 'escalation' && (
        <div className="space-y-4">
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-bold">
              Automated 4-Tier Civic Escalation Protocol
            </p>
            <p className="text-amber-700">
              When grievances remain unaddressed beyond the threshold hours, Namma Sethu automatically advances the grievance to the next managerial tier.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {escalationPolicies.map((pol) => (
              <div
                key={pol.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-black text-slate-900 text-sm">
                    Escalation Level {pol.level}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                    {pol.isAutomated ? 'AUTOMATED TRIGGER' : 'MANUAL'}
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Threshold Time:</span>
                    <strong className="text-slate-900">{pol.thresholdHours} Hours overdue</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Designation:</span>
                    <strong className="text-[#087F5B]">{pol.targetRole}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Notice Action:</span>
                    <span>{pol.actionDescription}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const newHours = prompt('Enter new threshold hours:', String(pol.thresholdHours));
                    if (newHours && !isNaN(Number(newHours))) {
                      StorageService.updateEscalationPolicy(pol.id, Number(newHours), pol.targetRole);
                      onRefreshAll();
                    }
                  }}
                  className="w-full mt-2 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
                >
                  Adjust Threshold Hours
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: OFFICIAL MYSURU SOURCES */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Official Mysore Data Verification Directory
              </h3>
              <p className="text-xs text-slate-500">
                All routing logic and departmental assignments trace directly to these verified state resources.
              </p>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {officialSources.map((src) => (
                <div key={src.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{src.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                        {src.authority}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{src.description}</p>
                    <span className="text-[10px] text-slate-400 block">
                      Verified On: {src.lastVerifiedDate}
                    </span>
                  </div>

                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#087F5B] hover:underline font-bold self-start sm:self-auto text-[11px]"
                  >
                    <span>Visit Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900">
                Immutable Governance Audit Stream
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {auditLogs.length} Events Logged
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs max-h-[500px] overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      {log.complaintId && (
                        <span className="font-mono text-[10px] font-bold text-[#087F5B] bg-emerald-50 px-1.5 py-0.5 rounded">
                          #{log.complaintId}
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        {log.userRole}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{log.details}</p>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleString('en-GB', {
                      dateStyle: 'short',
                      timeStyle: 'medium',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

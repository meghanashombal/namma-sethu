import React, { useState } from 'react';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  UserCheck,
  Send,
  Camera,
  Upload,
  Search,
  Filter,
  Eye,
  MessageSquare,
  ArrowUpRight,
  Shield,
  Layers,
  ChevronRight,
  X,
} from 'lucide-react';
import { Complaint, User, ComplaintStatus, ResolutionProof } from '../types';
import { StorageService } from '../services/storage';
import { Language, translations } from '../data/translations';

interface StaffDashboardViewProps {
  currentUser: User;
  complaints: Complaint[];
  language: Language;
  onNavigateToDetail: (id: string) => void;
  onRefreshComplaints: () => void;
}

export const StaffDashboardView: React.FC<StaffDashboardViewProps> = ({
  currentUser,
  complaints,
  language,
  onNavigateToDetail,
  onRefreshComplaints,
}) => {
  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterSla, setFilterSla] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [activeModal, setActiveModal] = useState<
    'assign' | 'status' | 'note' | 'escalate' | 'proof' | null
  >(null);

  // Modal form inputs
  const [assigneeName, setAssigneeName] = useState<string>('Ravi Kumar (Ward Junior Engineer)');
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('In Progress');
  const [noteText, setNoteText] = useState<string>('');
  const [escalationReason, setEscalationReason] = useState<string>('');
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=600&auto=format&fit=crop&q=80'
  );

  const t = translations[language];

  // Counts for staff metrics
  const newCount = complaints.filter((c) => c.status === 'Submitted' || c.status === 'Routed').length;
  const pendingCount = complaints.filter((c) => c.status === 'Acknowledged').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress' || c.status === 'Assigned').length;
  const awaitingVerifyCount = complaints.filter((c) => c.status === 'Awaiting Verification').length;
  const breachedCount = complaints.filter(
    (c) => c.status === 'SLA Breached' || c.routingDecision?.routingSlaStatus === 'SLA Breached'
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const escalatedCount = complaints.filter(
    (c) => c.status === 'Escalated' || (c.escalationLevel && c.escalationLevel > 0)
  ).length;

  // Filtered list
  const filteredList = complaints.filter((c) => {
    if (filterCategory !== 'All' && c.category !== filterCategory) return false;
    if (filterStatus !== 'All' && c.status !== filterStatus) return false;
    if (filterPriority !== 'All' && c.priority !== filterPriority) return false;

    if (filterSla === 'Breached') {
      const isOverdue = new Date(c.expectedResolutionDate).getTime() < Date.now() && c.status !== 'Closed';
      if (!isOverdue && c.status !== 'SLA Breached') return false;
    } else if (filterSla === 'Within SLA') {
      const isOverdue = new Date(c.expectedResolutionDate).getTime() < Date.now() && c.status !== 'Closed';
      if (isOverdue || c.status === 'SLA Breached') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = c.id.toLowerCase().includes(q);
      const matchLoc = (c.locationName || '').toLowerCase().includes(q);
      const matchDesc = (c.description || '').toLowerCase().includes(q);
      if (!matchId && !matchLoc && !matchDesc) return false;
    }

    return true;
  });

  // Action handlers
  const handleAcknowledge = (c: Complaint) => {
    StorageService.acknowledgeComplaint(c.id, currentUser);
    onRefreshComplaints();
  };

  const handleAssignSubmit = () => {
    if (!selectedComplaint) return;
    StorageService.assignComplaint(selectedComplaint.id, currentUser, assigneeName);
    setActiveModal(null);
    onRefreshComplaints();
  };

  const handleStatusSubmit = () => {
    if (!selectedComplaint) return;
    StorageService.updateComplaintStatus(
      selectedComplaint.id,
      newStatus,
      currentUser.name,
      'STAFF',
      `Status changed by ${currentUser.name} (${currentUser.role})`
    );
    setActiveModal(null);
    onRefreshComplaints();
  };

  const handleNoteSubmit = () => {
    if (!selectedComplaint || !noteText.trim()) return;
    StorageService.addComplaintNote(selectedComplaint.id, currentUser, noteText);
    setNoteText('');
    setActiveModal(null);
    onRefreshComplaints();
  };

  const handleEscalateSubmit = () => {
    if (!selectedComplaint) return;
    StorageService.escalateComplaint(
      selectedComplaint.id,
      escalationReason || 'Staff initiated escalation due to field complexity',
      undefined,
      currentUser.name,
      'STAFF'
    );
    setEscalationReason('');
    setActiveModal(null);
    onRefreshComplaints();
  };

  const handleProofSubmit = () => {
    if (!selectedComplaint) return;
    const proof: ResolutionProof = {
      afterPhotoUrl,
      resolutionNote: resolutionNote.trim() || 'Work completed on site according to municipal standards.',
      resolvedBy: currentUser.name,
      resolvedAt: new Date().toISOString(),
    };

    StorageService.uploadResolutionProof(selectedComplaint.id, proof);
    setResolutionNote('');
    setActiveModal(null);
    onRefreshComplaints();
  };

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto">
      {/* Staff Header */}
      <div className="bg-gradient-to-r from-[#087F5B] to-[#1E293B] text-white rounded-3xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#A7F3D0] text-xs font-bold uppercase tracking-wider">
              <Briefcase className="w-4 h-4" />
              <span>Civic Operations & Engineering Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{currentUser.name}</h1>
            <p className="text-xs sm:text-sm text-white/90">
              Role: <strong>Assistant Executive Engineer (AEE)</strong> • Department:{' '}
              <strong>{currentUser.department || 'Roads & Infrastructure'}</strong>
            </p>
            <p className="text-[11px] text-[#A7F3D0]">
              Jurisdiction: <strong>MCC Zone 4 (Wards 24-32)</strong> • Engineering Division
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 border border-white/20 text-xs space-y-1 self-start sm:self-auto">
            <div className="flex justify-between gap-4">
              <span>Active Staff Queue:</span>
              <strong className="text-white">{complaints.length} grievances</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span>24h Routing SLA:</span>
              <strong className="text-[#22C55E]">100% Compliant</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 7 Status Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <button
          onClick={() => setFilterStatus('Submitted')}
          className="p-3 bg-white rounded-2xl border border-slate-200 text-left hover:border-slate-400 transition-colors"
        >
          <span className="text-[11px] font-bold text-slate-500 block">New Logged</span>
          <p className="text-xl font-black text-blue-600 mt-1">{newCount}</p>
        </button>

        <button
          onClick={() => setFilterStatus('Acknowledged')}
          className="p-3 bg-white rounded-2xl border border-slate-200 text-left hover:border-slate-400 transition-colors"
        >
          <span className="text-[11px] font-bold text-slate-500 block">Acknowledged</span>
          <p className="text-xl font-black text-indigo-600 mt-1">{pendingCount}</p>
        </button>

        <button
          onClick={() => setFilterStatus('In Progress')}
          className="p-3 bg-white rounded-2xl border border-slate-200 text-left hover:border-slate-400 transition-colors"
        >
          <span className="text-[11px] font-bold text-slate-500 block">In Progress</span>
          <p className="text-xl font-black text-amber-600 mt-1">{inProgressCount}</p>
        </button>

        <button
          onClick={() => setFilterStatus('Awaiting Verification')}
          className="p-3 bg-white rounded-2xl border border-purple-200 bg-purple-50/50 text-left hover:border-purple-400 transition-colors"
        >
          <span className="text-[11px] font-bold text-purple-700 block">Awaiting Verify</span>
          <p className="text-xl font-black text-purple-700 mt-1">{awaitingVerifyCount}</p>
        </button>

        <button
          onClick={() => setFilterSla('Breached')}
          className="p-3 bg-white rounded-2xl border border-rose-200 bg-rose-50/50 text-left hover:border-rose-400 transition-colors"
        >
          <span className="text-[11px] font-bold text-rose-700 block">SLA Breached</span>
          <p className="text-xl font-black text-rose-600 mt-1">{breachedCount}</p>
        </button>

        <button
          onClick={() => setFilterStatus('Resolved')}
          className="p-3 bg-white rounded-2xl border border-emerald-200 bg-emerald-50/50 text-left hover:border-emerald-400 transition-colors"
        >
          <span className="text-[11px] font-bold text-emerald-700 block">Resolved</span>
          <p className="text-xl font-black text-emerald-600 mt-1">{resolvedCount}</p>
        </button>

        <button
          onClick={() => setFilterStatus('Escalated')}
          className="p-3 bg-white rounded-2xl border border-amber-200 bg-amber-50/50 text-left hover:border-amber-400 transition-colors"
        >
          <span className="text-[11px] font-bold text-amber-700 block">Escalated</span>
          <p className="text-xl font-black text-amber-600 mt-1">{escalatedCount}</p>
        </button>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Staff Filter Console ({filteredList.length} grievances)
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, Locality, or Citizen text..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#087F5B] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
          >
            <option value="All">All Categories</option>
            <option value="Pothole / Road Damage">Potholes / Road</option>
            <option value="Garbage Overflow">Garbage Overflow</option>
            <option value="Blocked Drain">Blocked Drain</option>
            <option value="Streetlight Problem">Streetlight</option>
            <option value="Water Issue">Water Issue</option>
            <option value="Construction Waste">Construction Waste</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Routed">Routed</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="In Progress">In Progress</option>
            <option value="Awaiting Verification">Awaiting Verification</option>
            <option value="Resolved">Resolved</option>
            <option value="Escalated">Escalated</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
          >
            <option value="All">All Priorities</option>
            <option value="Normal">Normal</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Emergency">Emergency</option>
          </select>

          <select
            value={filterSla}
            onChange={(e) => setFilterSla(e.target.value)}
            className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
          >
            <option value="All">All SLAs</option>
            <option value="Within SLA">Within Target SLA</option>
            <option value="Breached">SLA Overdue / Breached</option>
          </select>

          <button
            onClick={() => {
              setFilterCategory('All');
              setFilterStatus('All');
              setFilterPriority('All');
              setFilterSla('All');
              setSearchQuery('');
            }}
            className="text-[11px] font-bold text-[#087F5B] hover:underline ml-auto"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Staff Complaint Cards Table */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No complaints match the selected filter criteria.
          </div>
        ) : (
          filteredList.map((comp) => {
            const isOverdue =
              new Date(comp.expectedResolutionDate).getTime() < Date.now() &&
              comp.status !== 'Resolved' &&
              comp.status !== 'Closed';

            return (
              <div
                key={comp.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-[#087F5B] transition-colors space-y-3"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#087F5B] bg-emerald-50 px-2.5 py-0.5 rounded">
                      #{comp.id}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{comp.category}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        comp.status === 'Resolved' || comp.status === 'Closed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : comp.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : comp.status === 'Awaiting Verification'
                          ? 'bg-purple-100 text-purple-800'
                          : comp.status === 'SLA Breached'
                          ? 'bg-rose-100 text-rose-800'
                          : comp.status === 'Escalated'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {comp.status}
                    </span>

                    {comp.priority === 'High' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        High Priority
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>
                      Target Date: <strong>{comp.expectedResolutionDate}</strong>
                    </span>
                    {isOverdue && (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3" />
                        OVERDUE
                      </span>
                    )}
                  </div>
                </div>

                {/* Complaint Info */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {comp.photoUrls && comp.photoUrls.length > 0 && (
                    <img
                      src={comp.photoUrls[0]}
                      alt="Thumbnail"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  )}

                  <div className="flex-1 space-y-1 text-xs">
                    <p className="text-slate-700">{comp.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>Location: <strong>{comp.locationName}</strong></span>
                      <span>•</span>
                      <span>Reported by: {comp.citizenName} ({comp.citizenPhone || 'Verified'})</span>
                      {comp.assignedStaffName && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 font-bold">
                            Assigned to: {comp.assignedStaffName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Staff Interactive Actions Bar - EVERY BUTTON WORKS! */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                  {/* View Details */}
                  <button
                    onClick={() => onNavigateToDetail(comp.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Detail</span>
                  </button>

                  {/* Acknowledge */}
                  {comp.status === 'Submitted' || comp.status === 'Routed' ? (
                    <button
                      onClick={() => handleAcknowledge(comp)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  ) : null}

                  {/* Assign */}
                  <button
                    onClick={() => {
                      setSelectedComplaint(comp);
                      setActiveModal('assign');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Assign Engineer</span>
                  </button>

                  {/* Change Status */}
                  <button
                    onClick={() => {
                      setSelectedComplaint(comp);
                      setNewStatus(comp.status);
                      setActiveModal('status');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Change Status</span>
                  </button>

                  {/* Add Note */}
                  <button
                    onClick={() => {
                      setSelectedComplaint(comp);
                      setActiveModal('note');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Add Note</span>
                  </button>

                  {/* Escalate */}
                  <button
                    onClick={() => {
                      setSelectedComplaint(comp);
                      setActiveModal('escalate');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Escalate</span>
                  </button>

                  {/* Upload Resolution Proof / Mark Resolved */}
                  <button
                    onClick={() => {
                      setSelectedComplaint(comp);
                      setActiveModal('proof');
                    }}
                    className="ml-auto px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload Proof / Mark Resolved</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- MODAL 1: ASSIGN TO FIELD ENGINEER --- */}
      {activeModal === 'assign' && selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                Assign #{selectedComplaint.id} to Field Engineer
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Select Ward Engineer:
              </label>
              <select
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-medium"
              >
                <option value="Ravi Kumar (Junior Engineer - Roads)">
                  Ravi Kumar (Junior Engineer - Roads)
                </option>
                <option value="Anand Swamy (Asst. Engineer - Electrical)">
                  Anand Swamy (Asst. Engineer - Electrical)
                </option>
                <option value="Sunita Gowda (Health Inspector - SWM)">
                  Sunita Gowda (Health Inspector - SWM)
                </option>
                <option value="P. Mahesh (UGD Section Officer)">
                  P. Mahesh (UGD Section Officer)
                </option>
              </select>
            </div>

            <button
              onClick={handleAssignSubmit}
              className="w-full py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066347] text-white text-xs font-bold"
            >
              Confirm Assignment & Log Timeline
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 2: CHANGE STATUS --- */}
      {activeModal === 'status' && selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                Update Status for #{selectedComplaint.id}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">New Status:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-medium"
              >
                <option value="Acknowledged">Acknowledged</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Awaiting Verification">Awaiting Verification</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <button
              onClick={handleStatusSubmit}
              className="w-full py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066347] text-white text-xs font-bold"
            >
              Save New Status
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 3: ADD NOTE --- */}
      {activeModal === 'note' && selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                Internal Engineering Note #{selectedComplaint.id}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Asphalting team scheduled for 10:00 AM tomorrow..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#087F5B] focus:outline-none"
            />

            <button
              onClick={handleNoteSubmit}
              className="w-full py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066347] text-white text-xs font-bold"
            >
              Append Note to Case File
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 4: ESCALATE --- */}
      {activeModal === 'escalate' && selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="font-bold text-sm">
                  Escalate Complaint #{selectedComplaint.id}
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              This will elevate the grievance to Level {(selectedComplaint.escalationLevel || 0) + 1} (Executive Engineer / Commissioner review).
            </p>

            <textarea
              rows={3}
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              placeholder="Justification: e.g. Major water main burst requires inter-departmental trenching permission..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />

            <button
              onClick={handleEscalateSubmit}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
            >
              Submit Official Escalation Notice
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 5: UPLOAD RESOLUTION PROOF --- */}
      {activeModal === 'proof' && selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm">
                  Upload Resolution Proof for #{selectedComplaint.id}
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Staff cannot directly close a grievance without citizen verification. Uploading this proof moves status to <strong>Awaiting Verification</strong>.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                After-Repair Evidence Photo URL:
              </label>
              <input
                type="text"
                value={afterPhotoUrl}
                onChange={(e) => setAfterPhotoUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#087F5B]"
              />
              <div className="h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={afterPhotoUrl}
                  alt="After Repair Proof"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Resolution Work Summary Note:
              </label>
              <textarea
                rows={2}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="e.g. Asphalting completed on Temple Road using standard cold mix. Curbs cleared."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#087F5B]"
              />
            </div>

            <button
              onClick={handleProofSubmit}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md"
            >
              Upload Proof & Request Citizen Verification
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

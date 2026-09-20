import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Building,
  Phone,
  QrCode as QrIcon,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  User as UserIcon,
  Send,
  Camera,
  Share2,
  Smartphone,
  MessageSquare,
  Copy,
  Check,
} from 'lucide-react';
import { Complaint, User } from '../types';
import { StorageService } from '../services/storage';
import { QrCodeModal } from './QrCodeModal';
import { RealMobileSmsModal } from './RealMobileSmsModal';
import { RealSmsService } from '../services/realSms';
import { Language, translations } from '../data/translations';

interface ComplaintDetailViewProps {
  complaintId: string;
  currentUser: User;
  language: Language;
  onBack: () => void;
  onNavigateToDetail: (id: string) => void;
  onRefreshComplaint: () => void;
}

export const ComplaintDetailView: React.FC<ComplaintDetailViewProps> = ({
  complaintId,
  currentUser,
  language,
  onBack,
  onNavigateToDetail,
  onRefreshComplaint,
}) => {
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showDelayModal, setShowDelayModal] = useState<boolean>(false);
  const [showWhyRoutedModal, setShowWhyRoutedModal] = useState<boolean>(false);

  // Citizen verification form
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string>('');
  const [verificationPhoto, setVerificationPhoto] = useState<string>('');

  // SMS Tracking controls
  const [smsResentNotice, setSmsResentNotice] = useState<string>('');
  const [isLinkCopied, setIsLinkCopied] = useState<boolean>(false);
  const [showSmsEditor, setShowSmsEditor] = useState<boolean>(false);
  const [customPhone, setCustomPhone] = useState<string>('');
  const [isRealSmsModalOpen, setIsRealSmsModalOpen] = useState<boolean>(false);

  const t = translations[language];
  const complaint = StorageService.getComplaintById(complaintId);

  if (!complaint) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-4 max-w-lg mx-auto">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Complaint Not Found</h2>
        <p className="text-xs text-slate-500">
          No grievance record matches ID "{complaintId}".
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-[#087F5B] text-white text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Check confirmation state
  const hasConfirmed = complaint.confirmedUserIds?.includes(currentUser.id);

  const handleToggleConfirm = (confirm: boolean) => {
    StorageService.addCommunityConfirmation(complaint.id, currentUser.id, confirm);
    onRefreshComplaint();
  };

  const handleCitizenVerify = (resolved: boolean) => {
    StorageService.verifyCitizenResolution(
      complaint.id,
      resolved,
      verificationFeedback,
      verificationPhoto || undefined
    );
    setIsVerifying(false);
    onRefreshComplaint();
  };

  const isOverdue =
    new Date(complaint.expectedResolutionDate).getTime() < Date.now() &&
    complaint.status !== 'Resolved' &&
    complaint.status !== 'Closed';

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Top Bar with Back, ID, and Action buttons */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#087F5B] hover:bg-[#066347] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            <QrIcon className="w-4 h-4" />
            <span>Show QR Code</span>
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black text-[#087F5B] bg-[#087F5B]/10 px-2.5 py-1 rounded-md">
              #{complaint.id}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                complaint.status === 'Resolved' || complaint.status === 'Closed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : complaint.status === 'In Progress'
                  ? 'bg-blue-100 text-blue-800'
                  : complaint.status === 'Awaiting Verification'
                  ? 'bg-purple-100 text-purple-800 animate-pulse'
                  : complaint.status === 'SLA Breached'
                  ? 'bg-rose-100 text-rose-800'
                  : complaint.status === 'Escalated'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {complaint.status}
            </span>

            {complaint.isUrgentSafety && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                🚨 Urgent Safety Concern
              </span>
            )}
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Reported on {new Date(complaint.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {complaint.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed whitespace-pre-line">
            {complaint.description}
          </p>
        </div>

        {/* Evidence Photos Gallery */}
        {complaint.photoUrls && complaint.photoUrls.length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-bold text-slate-700 mb-2">Attached Citizen Evidence:</p>
            <div className="flex flex-wrap gap-3">
              {complaint.photoUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100"
                >
                  <img
                    src={url}
                    alt={`Evidence ${idx + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Community Confirmation Widget */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-[#087F5B] font-black flex items-center justify-center">
              {complaint.confirmationsCount || 1}
            </span>
            <div>
              <span className="font-bold text-slate-900">
                {complaint.confirmationsCount || 1} citizens confirmed this problem
              </span>
              <p className="text-[11px] text-slate-500">
                Multiple confirmations prioritize civic scheduling.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleConfirm(true)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                hasConfirmed
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Confirm Problem (+1)</span>
            </button>
            <button
              onClick={() => handleToggleConfirm(false)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>No Longer Exists</span>
            </button>
          </div>
        </div>
      </div>

      {/* CITIZEN VERIFICATION CARD (When status is Awaiting Verification) */}
      {complaint.status === 'Awaiting Verification' && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2.5 text-purple-900">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base">
                Civic Verification Required: {t.isProblemFixed}
              </h2>
              <p className="text-xs text-purple-700">
                Civic staff uploaded resolution proof below. The complaint cannot be closed without citizen sign-off.
              </p>
            </div>
          </div>

          {/* Before & After Proof Display */}
          {complaint.resolutionProof && (
            <div className="bg-white rounded-2xl p-4 border border-purple-200 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-900">
                {t.resolutionProofTitle}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">
                    BEFORE (Reported Condition)
                  </span>
                  <div className="h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={complaint.photoUrls[0]}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 block mb-1">
                    AFTER (Staff Rectification Work)
                  </span>
                  <div className="h-40 rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50">
                    <img
                      src={complaint.resolutionProof.afterPhotoUrl}
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                <strong>Staff Resolution Note:</strong> "{complaint.resolutionProof.resolutionNote}"
                <span className="block text-[11px] text-slate-400 mt-1">
                  Completed by {complaint.resolutionProof.resolvedBy} on {new Date(complaint.resolutionProof.resolvedAt).toLocaleString('en-GB')}
                </span>
              </div>
            </div>
          )}

          {/* Citizen Verification Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="btn-citizen-verify-yes"
                onClick={() => handleCitizenVerify(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.yesResolved}</span>
              </button>

              <button
                id="btn-citizen-verify-no"
                onClick={() => setIsVerifying(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>{t.noStillExists} (Reopen)</span>
              </button>
            </div>

            {/* Reopen Feedback Area */}
            {isVerifying && (
              <div className="p-4 bg-white rounded-2xl border border-rose-200 space-y-3 animate-in fade-in duration-150">
                <p className="text-xs font-bold text-rose-900">
                  Please provide details why the issue is not solved:
                </p>
                <textarea
                  rows={2}
                  value={verificationFeedback}
                  onChange={(e) => setVerificationFeedback(e.target.value)}
                  placeholder="e.g. The pothole was only filled with loose gravel and washed away with today's rain..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
                <button
                  onClick={() => handleCitizenVerify(false)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  Submit Reopen Notice & Escalate
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Routing, Authority & SLA Accountability Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Authority & Department Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Responsible Civic Authority
            </span>
            <button
              onClick={() => setShowWhyRoutedModal(true)}
              className="text-[11px] font-bold text-[#087F5B] hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.whyRoutedHere}</span>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 font-medium block text-[11px]">Authority:</span>
              <strong className="text-slate-900 text-sm">
                {complaint.routingDecision.authority}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[11px]">Department:</span>
              <strong className="text-[#087F5B] text-sm">
                {complaint.routingDecision.department}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[11px]">Territorial Jurisdiction:</span>
              <span className="text-slate-700 font-semibold">
                {complaint.routingDecision.governingBody} (Version {complaint.routingDecision.jurisdictionVersionNumber})
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[11px]">Official Contact Desk:</span>
              <span className="text-slate-700 font-medium">
                0821-2440890 / 2418800 • MCC Central Control Room
              </span>
            </div>
          </div>
        </div>

        {/* SLA Status & Resolution Timeline Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              SLA & Timeline Accountability
            </span>
            {isOverdue && (
              <button
                onClick={() => setShowDelayModal(true)}
                className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>{t.whyDelayed}</span>
              </button>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">24-hr Routing SLA:</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                {complaint.routingDecision.routingSlaStatus}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Expected Resolution:</span>
              <strong className="text-slate-900">{complaint.expectedResolutionDate}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Escalation Status:</span>
              <span className="font-bold text-slate-800">
                {complaint.escalationLevel > 0
                  ? `Escalated to Level ${complaint.escalationLevel}`
                  : 'Level 0 (Normal Queue)'}
              </span>
            </div>
            {isOverdue && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold flex items-center justify-between">
                <span>🔴 SLA Breached — Resolution Overdue</span>
                <button
                  onClick={() => setShowDelayModal(true)}
                  className="underline text-rose-900"
                >
                  View Details
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile SMS Notification & Live Tracking Dispatch Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                Mobile SMS Tracking Dispatch
              </h3>
              <p className="text-[10px] text-slate-400">
                Official SMS Gateway • Govt of Karnataka Civic Dispatch
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold">
            DELIVERED TO PHONE
          </span>
        </div>

        {/* SMS Preview Body */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800/80 pb-1 font-mono">
            <span>Sender: GOVT-MYSURU (Namma Sethu)</span>
            <span>Recipient: {complaint.citizenPhone || '+91 98450 12345'}</span>
          </div>
          <p className="select-all">
            Dear {complaint.citizenName}, your grievance <strong className="text-emerald-300">#{complaint.id}</strong> for "{complaint.category}" at {complaint.locationName} is active and routed to {complaint.routingDecision.authority}. Track live at{' '}
            <span className="text-emerald-400 underline font-mono">
              nammasethu.karnataka.gov.in/track/{complaint.id}
            </span>. Expected resolution by {complaint.expectedResolutionDate}. 24-hr Routing SLA guaranteed.
          </p>
        </div>

        {/* Quick Real Mobile Delivery Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-800">
          <button
            onClick={() => {
              const msg = RealSmsService.formatComplaintSmsText(complaint);
              RealSmsService.openNativeSms(complaint.citizenPhone || '+91 98450 12345', msg);
            }}
            className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Open phone's native SMS app"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Open Phone SMS</span>
          </button>

          <button
            onClick={() => {
              const msg = RealSmsService.formatComplaintSmsText(complaint);
              RealSmsService.openWhatsApp(complaint.citizenPhone || '+91 98450 12345', msg);
            }}
            className="py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Send directly to citizen WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Send via WhatsApp</span>
          </button>

          <button
            onClick={() => setIsRealSmsModalOpen(true)}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Send via Carrier Gateway, QR code scanner, or customized phone"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Real SMS Hub & QR</span>
          </button>
        </div>

        {/* Interactive Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `https://nammasethu.karnataka.gov.in/track/${complaint.id}`
                );
                setIsLinkCopied(true);
                setTimeout(() => setIsLinkCopied(false), 2000);
              }}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer text-[11px]"
            >
              {isLinkCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Tracking Link</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                StorageService.dispatchComplaintSms(complaint);
                setSmsResentNotice(`SMS re-sent to ${complaint.citizenPhone || '+91 98450 12345'}!`);
                setTimeout(() => setSmsResentNotice(''), 3000);
              }}
              className="py-1.5 px-3 rounded-xl bg-[#087F5B] hover:bg-[#066347] text-white font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer text-[11px]"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Resend Tracking SMS</span>
            </button>
          </div>

          <button
            onClick={() => setShowSmsEditor(!showSmsEditor)}
            className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
          >
            {showSmsEditor ? 'Cancel' : 'Send to another number'}
          </button>
        </div>

        {/* Notice feedback */}
        {smsResentNotice && (
          <p className="text-[11px] font-bold text-emerald-400 animate-in fade-in">
            ✓ {smsResentNotice}
          </p>
        )}

        {/* Custom phone form */}
        {showSmsEditor && (
          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <input
              type="tel"
              value={customPhone}
              onChange={(e) => setCustomPhone(e.target.value)}
              placeholder="Enter mobile number e.g. +91 99887 76655"
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-emerald-400 focus:outline-none"
            />
            <button
              onClick={() => {
                if (customPhone.trim()) {
                  StorageService.dispatchComplaintSms(
                    { ...complaint, citizenPhone: customPhone.trim() },
                    `Dear Citizen, tracking for grievance #${complaint.id} is available at https://nammasethu.karnataka.gov.in/track/${complaint.id}. - Govt of Karnataka`
                  );
                  setSmsResentNotice(`Tracking SMS sent to ${customPhone.trim()}!`);
                  setCustomPhone('');
                  setShowSmsEditor(false);
                  setTimeout(() => setSmsResentNotice(''), 3500);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
            >
              Send
            </button>
          </div>
        )}
      </div>

      {/* 9-Stage Visual Stepper Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-black text-sm text-slate-900">
          Official Audit & Workflow Timeline
        </h3>

        <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {complaint.timeline.map((event, idx) => (
            <div key={event.id || idx} className="flex items-start gap-3 relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  event.status === 'Resolved' || event.status === 'Closed'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : event.status === 'Escalated' || event.status === 'SLA Breached'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : event.status === 'Reopened'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-[#087F5B] text-white shadow-sm'
                }`}
              >
                {idx + 1}
              </div>

              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex-1 space-y-1 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-slate-900">{event.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(event.timestamp).toLocaleString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {event.description}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
                  <span>Actor: <strong>{event.actor}</strong> ({event.actorRole})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: Why was my complaint sent here? */}
      {showWhyRoutedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-slate-900 text-base">
                {t.whyRoutedHere}
              </h3>
              <button
                onClick={() => setShowWhyRoutedModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs whitespace-pre-line leading-relaxed max-h-80 overflow-y-auto">
              {complaint.routingDecision.explanation}
            </div>

            <button
              onClick={() => setShowWhyRoutedModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#087F5B] text-white text-xs font-bold"
            >
              Close Record
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Why is my complaint delayed? */}
      {showDelayModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertOctagon className="w-5 h-5" />
                <h3 className="font-black text-base">{t.whyDelayed}</h3>
              </div>
              <button
                onClick={() => setShowDelayModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-xs text-rose-950">
              <p>
                <strong>Expected Resolution:</strong> {complaint.expectedResolutionDate}
              </p>
              <p>
                <strong>Delay Status:</strong> Overdue by{' '}
                {Math.max(
                  1,
                  Math.round(
                    (Date.now() - new Date(complaint.expectedResolutionDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                )}{' '}
                days
              </p>
              <p>
                <strong>Escalation Tier:</strong> Level {complaint.escalationLevel || 1}
              </p>
              <p>
                <strong>Responsible Unit:</strong> {complaint.routingDecision.department}
              </p>
              <p>
                <strong>Reason:</strong>{' '}
                {complaint.escalationReason ||
                  'Field repair crew awaiting parts delivery / weather constraint. Notice served to AEE.'}
              </p>
            </div>

            <button
              onClick={() => setShowDelayModal(false)}
              className="w-full py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
            >
              Acknowledge Notice
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal Component */}
      <QrCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        complaint={complaint}
      />

      {/* Real Mobile SMS Modal */}
      <RealMobileSmsModal
        isOpen={isRealSmsModalOpen}
        onClose={() => setIsRealSmsModalOpen(false)}
        complaint={complaint}
        defaultPhone={complaint.citizenPhone || '+91 98450 12345'}
      />
    </div>
  );
};

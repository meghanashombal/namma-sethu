import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Shield,
  HelpCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  Building,
  FileText,
  X,
  Smartphone,
  Copy,
  Check,
  MessageSquare,
} from 'lucide-react';
import { Complaint, RoutingDecision } from '../types';
import { Language, translations } from '../data/translations';
import { StorageService } from '../services/storage';
import { RealSmsService } from '../services/realSms';

interface RoutingVisualizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  routingDecision: RoutingDecision | null;
  language: Language;
  onTrackComplaint: (complaintId: string) => void;
  onOpenRealSmsModal?: (complaintId: string, phone: string) => void;
}

const ANIMATION_STEPS = [
  '📍 Location coordinates pinpointed',
  '🗺 Active jurisdiction boundary matched',
  '🔎 Civic issue category identified',
  '📋 Statutory responsibility rule checked',
  '🏢 Municipal department assigned',
  '🏛 Responsible civic authority verified',
  '✅ Grievance routed within 24-Hour SLA',
];

export const RoutingVisualizationModal: React.FC<RoutingVisualizationModalProps> = ({
  isOpen,
  onClose,
  complaint,
  routingDecision,
  language,
  onTrackComplaint,
  onOpenRealSmsModal,
}) => {
  const [completedIndex, setCompletedIndex] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [smsResent, setSmsResent] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const t = translations[language];

  useEffect(() => {
    if (isOpen) {
      setCompletedIndex(0);
      setShowExplanation(false);

      const interval = setInterval(() => {
        setCompletedIndex((prev) => {
          if (prev < ANIMATION_STEPS.length) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen || !complaint || !routingDecision) return null;

  const isComplete = completedIndex >= ANIMATION_STEPS.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#087F5B] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5 text-[#A7F3D0]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A7F3D0]">
                Smart Routing Engine
              </span>
              <h2 className="text-lg font-black leading-tight">
                Complaint #{complaint.id} Routed!
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/20 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Animated Steps Checklist */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Automated Routing Sequence
            </p>
            {ANIMATION_STEPS.map((stepText, idx) => {
              const isDone = idx < completedIndex;
              const isCurrent = idx === completedIndex;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 text-xs transition-all duration-200 ${
                    isDone
                      ? 'text-[#087F5B] font-bold'
                      : isCurrent
                      ? 'text-slate-900 font-semibold animate-pulse'
                      : 'text-slate-400 opacity-60'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                  <span>{stepText}</span>
                </div>
              );
            })}
          </div>

          {/* Routing Decision Summary Card (Revealed after sequence) */}
          {isComplete && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                  <span className="text-slate-500 font-medium">Assigned Authority:</span>
                  <span className="font-black text-slate-900 text-right">
                    {routingDecision.authority}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                  <span className="text-slate-500 font-medium">Department:</span>
                  <span className="font-bold text-[#087F5B] text-right">
                    {routingDecision.department}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                  <span className="text-slate-500 font-medium">Jurisdiction:</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {routingDecision.governingBody} (v{routingDecision.jurisdictionVersionNumber})
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                  <span className="text-slate-500 font-medium">Routing SLA:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                    24-Hour Routing SLA Met
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500 font-medium">Expected Resolution:</span>
                  <span className="font-bold text-slate-900">
                    {complaint.expectedResolutionDate}
                  </span>
                </div>
              </div>

              {/* Mobile SMS Confirmation & Tracking Card */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-700/80 shadow-inner space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>SMS Tracking Sent to Mobile</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                    DELIVERED
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-200 font-sans leading-relaxed">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1.5 mb-1.5 font-mono">
                    <span>Sender: GOVT-MYSURU (Namma Sethu)</span>
                    <span>To: {complaint.citizenPhone || '+91 98450 12345'}</span>
                  </div>
                  <p>
                    Dear {complaint.citizenName}, your grievance <strong className="text-emerald-300">#{complaint.id}</strong> has been registered & routed to {routingDecision.authority}. Track live at{' '}
                    <span className="text-emerald-400 underline font-mono">
                      nammasethu.karnataka.gov.in/track/{complaint.id}
                    </span>. 24-hr Routing SLA guaranteed.
                  </p>
                </div>

                {/* Real Mobile Delivery Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const msg = RealSmsService.formatComplaintSmsText(complaint);
                      RealSmsService.openNativeSms(complaint.citizenPhone || '+91 98450 12345', msg);
                    }}
                    className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Open Phone SMS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const msg = RealSmsService.formatComplaintSmsText(complaint);
                      RealSmsService.openWhatsApp(complaint.citizenPhone || '+91 98450 12345', msg);
                    }}
                    className="py-2 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send via WhatsApp</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://nammasethu.karnataka.gov.in/track/${complaint.id}`
                      );
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  {onOpenRealSmsModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenRealSmsModal(complaint.id, complaint.citizenPhone || '+91 98450 12345');
                      }}
                      className="text-emerald-300 hover:text-emerald-200 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Real SMS Hub / QR</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      StorageService.dispatchComplaintSms(complaint);
                      setSmsResent(true);
                      setTimeout(() => setSmsResent(false), 2500);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {smsResent ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Resent!</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Resend SMS</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* "Why was my complaint sent here?" Accordion / Modal button */}
              <div>
                <button
                  id="why-routed-here-btn"
                  type="button"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full py-2.5 px-4 rounded-xl border border-emerald-300 bg-emerald-50 text-[#087F5B] text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-[#087F5B]" />
                  <span>{t.whyRoutedHere}</span>
                </button>

                {showExplanation && (
                  <div className="mt-3 p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-2 whitespace-pre-line font-mono animate-in fade-in duration-150">
                    <p className="font-bold text-[#A7F3D0] border-b border-slate-700 pb-1 text-[11px] font-sans">
                      Explainable Routing Audit Record
                    </p>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {routingDecision.explanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Action: Track this complaint */}
              <button
                id="track-complaint-now-btn"
                type="button"
                onClick={() => {
                  onClose();
                  onTrackComplaint(complaint.id);
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#087F5B] hover:bg-[#066347] text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <span>Track This Complaint Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

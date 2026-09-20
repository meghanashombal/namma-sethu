import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  X,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { SmsMessage } from '../types';
import { RealSmsService } from '../services/realSms';

interface MobileSmsToastProps {
  onTrackComplaint?: (complaintId: string) => void;
  onOpenRealSmsModal?: (complaintId: string, phone: string) => void;
}

export const MobileSmsToast: React.FC<MobileSmsToastProps> = ({
  onTrackComplaint,
  onOpenRealSmsModal,
}) => {
  const [activeSms, setActiveSms] = useState<SmsMessage | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    const handleSmsEvent = (e: any) => {
      if (e.detail) {
        setActiveSms(e.detail);
        setIsCopied(false);
        setIsMinimized(false);

        // Play subtle civic notification chime using Web Audio API
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContext) {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.36);
          }
        } catch (err) {
          // audio fallback
        }
      }
    };

    window.addEventListener('namma_sethu_sms_dispatched', handleSmsEvent);
    return () => window.removeEventListener('namma_sethu_sms_dispatched', handleSmsEvent);
  }, []);

  if (!activeSms) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSms.message);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleTrack = () => {
    if (onTrackComplaint) {
      onTrackComplaint(activeSms.complaintId);
      setActiveSms(null);
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md animate-in slide-in-from-top-6 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 space-y-3">
        {/* Top Header: Mimicking Mobile OS Notification */}
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-300">MESSAGES • Just now</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/60 font-bold">
              SMS DELIVERED
            </span>
            <button
              onClick={() => setActiveSms(null)}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
              title="Dismiss SMS"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sender & Recipient Metadata */}
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{activeSms.senderId}</span>
          </div>
          <div className="flex items-center gap-1">
            <Smartphone className="w-3 h-3 text-slate-400" />
            <span>To: {activeSms.recipientPhone}</span>
          </div>
        </div>

        {/* SMS Message Content */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans select-all">
          <p>{activeSms.message}</p>
        </div>

        {/* Quick Real Mobile Delivery Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => RealSmsService.openNativeSms(activeSms.recipientPhone, activeSms.message)}
            className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Opens native SMS app with pre-filled tracking SMS"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Open Phone SMS</span>
          </button>

          <button
            onClick={() => RealSmsService.openWhatsApp(activeSms.recipientPhone, activeSms.message)}
            className="py-2 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Sends grievance update directly to WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Send via WhatsApp</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            onClick={handleTrack}
            className="flex-1 py-2 px-3 rounded-xl bg-[#087F5B] hover:bg-[#066347] active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <span>Track Complaint</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {onOpenRealSmsModal && (
            <button
              onClick={() => {
                onOpenRealSmsModal(activeSms.complaintId, activeSms.recipientPhone);
                setActiveSms(null);
              }}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1 transition-all cursor-pointer"
              title="View QR Code, Carrier Gateway, and Mobile Options"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Real SMS Hub</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
            title="Copy message & tracking link"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

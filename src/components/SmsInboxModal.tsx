import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Smartphone,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Clock,
  RefreshCw,
  Send,
} from 'lucide-react';
import { SmsMessage } from '../types';
import { StorageService } from '../services/storage';

interface SmsInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackComplaint: (complaintId: string) => void;
}

export const SmsInboxModal: React.FC<SmsInboxModalProps> = ({
  isOpen,
  onClose,
  onTrackComplaint,
}) => {
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testPhone, setTestPhone] = useState<string>('');
  const [sentNotice, setSentNotice] = useState<string>('');

  const loadMessages = () => {
    setMessages(StorageService.getSmsMessages());
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendTestSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) return;

    const complaints = StorageService.getComplaints();
    const latest = complaints[0];
    if (latest) {
      const sent = StorageService.dispatchComplaintSms(
        { ...latest, citizenPhone: testPhone.trim() },
        `[TEST SMS] Dear Citizen, live tracking for your grievance #${latest.id} is active at https://nammasethu.karnataka.gov.in/track/${latest.id}. 24-hr SLA active.`
      );
      setMessages(StorageService.getSmsMessages());
      setSentNotice(`Test SMS dispatched to ${testPhone}!`);
      setTestPhone('');
      setTimeout(() => setSentNotice(''), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#087F5B] to-[#066347] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#A7F3D0]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7F3D0]">
                  Official SMS Gateway
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-[#A7F3D0] text-[9px] font-bold">
                  Live Dispatch
                </span>
              </div>
              <h2 className="text-lg font-black leading-tight">
                Mobile SMS Tracking Log
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Information banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
            <Smartphone className="w-4 h-4 text-[#087F5B] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Every time a grievance is registered or updated in Mysuru, an official SMS is sent to the citizen&apos;s mobile number with their unique tracking ID and live tracking link.
            </p>
          </div>

          {/* Test SMS Dispatcher Form */}
          <form
            onSubmit={handleSendTestSms}
            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
          >
            <label className="font-bold text-slate-700 block">
              Send Live Test SMS to Any Phone:
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+91 98450 12345"
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#087F5B] hover:bg-[#066347] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send SMS</span>
              </button>
            </div>
            {sentNotice && (
              <p className="text-[11px] font-bold text-emerald-600 animate-in fade-in">
                ✓ {sentNotice}
              </p>
            )}
          </form>

          {/* Messages List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>Dispatched SMS Messages ({messages.length})</span>
              <button
                onClick={loadMessages}
                className="flex items-center gap-1 text-[#087F5B] hover:underline normal-case text-xs font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No SMS messages logged yet. Submit a complaint to receive your tracking SMS!
              </div>
            ) : (
              messages.map((sms) => {
                const dateStr = new Date(sms.timestamp).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={sms.id}
                    className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2.5 text-xs shadow-md"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{sms.senderId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dateStr}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[9px]">
                          {sms.status}
                        </span>
                      </div>
                    </div>

                    {/* Recipient info */}
                    <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
                      <span>To: {sms.recipientPhone}</span>
                      <span className="text-slate-300 font-sans">{sms.recipientName}</span>
                    </div>

                    {/* Body */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-200 leading-relaxed font-sans select-all">
                      {sms.message}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleCopy(sms.id, sms.message)}
                        className="text-slate-300 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        {copiedId === sms.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy SMS</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onTrackComplaint(sms.complaintId);
                        }}
                        className="py-1.5 px-3 rounded-xl bg-[#087F5B] hover:bg-[#066347] text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        <span>Track #{sms.complaintId}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

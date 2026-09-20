import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  MessageSquare,
  QrCode as QrIcon,
  Copy,
  Check,
  Share2,
  Send,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { Complaint } from '../types';
import { RealSmsService, SmsDispatchResult } from '../services/realSms';
import { StorageService } from '../services/storage';

interface RealMobileSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  defaultPhone?: string;
}

export const RealMobileSmsModal: React.FC<RealMobileSmsModalProps> = ({
  isOpen,
  onClose,
  complaint,
  defaultPhone,
}) => {
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [smsQrUrl, setSmsQrUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(false);
  const [isSendingGateway, setIsSendingGateway] = useState<boolean>(false);
  const [gatewayStatus, setGatewayStatus] = useState<SmsDispatchResult | null>(null);
  const [activeTab, setActiveTab] = useState<'instant' | 'qr' | 'gateway'>('instant');

  useEffect(() => {
    if (complaint) {
      const initialPhone =
        defaultPhone ||
        complaint.citizenPhone ||
        '+91 98450 12345';
      setRecipientPhone(initialPhone);
      setGatewayStatus(null);
    }
  }, [complaint, defaultPhone]);

  useEffect(() => {
    if (complaint && recipientPhone) {
      const message = RealSmsService.formatComplaintSmsText(complaint);
      RealSmsService.generateSmsQrCode(recipientPhone, message)
        .then((url) => setSmsQrUrl(url))
        .catch((err) => console.error('Failed to generate SMS QR:', err));
    }
  }, [complaint, recipientPhone]);

  if (!isOpen || !complaint) return null;

  const smsText = RealSmsService.formatComplaintSmsText(complaint);
  const trackingUrl = `https://nammasethu.karnataka.gov.in/track/${complaint.id}`;
  const cleaned = RealSmsService.cleanPhoneNumber(recipientPhone);

  const handleOpenNativeSms = () => {
    RealSmsService.openNativeSms(recipientPhone, smsText);
    StorageService.logAudit(
      'Citizen Dispatched Real Native SMS',
      'CITIZEN',
      complaint.id,
      undefined,
      `Opened Native SMS app targeting ${cleaned.formatted}`
    );
  };

  const handleOpenWhatsApp = () => {
    RealSmsService.openWhatsApp(recipientPhone, smsText);
    StorageService.logAudit(
      'Citizen Dispatched WhatsApp Notification',
      'CITIZEN',
      complaint.id,
      undefined,
      `Opened WhatsApp message targeting ${cleaned.formatted}`
    );
  };

  const handleNativeShare = async () => {
    const shared = await RealSmsService.shareViaNativeShare(
      `Grievance Tracking #${complaint.id}`,
      smsText,
      trackingUrl
    );
    if (shared) {
      StorageService.logAudit(
        'Citizen Shared via Native Mobile Share',
        'CITIZEN',
        complaint.id,
        undefined,
        `Shared grievance update via native OS sheet`
      );
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(smsText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2200);
  };

  const handleSendViaGateway = async () => {
    setIsSendingGateway(true);
    setGatewayStatus(null);
    try {
      const res = await RealSmsService.sendViaBackendGateway(
        recipientPhone,
        smsText,
        complaint.id
      );
      setGatewayStatus(res);
      if (res.success) {
        StorageService.logAudit(
          'Carrier SMS Dispatched',
          'SYSTEM',
          complaint.id,
          undefined,
          `Carrier SMS delivered to ${cleaned.formatted} via ${res.provider}`
        );
      }
    } finally {
      setIsSendingGateway(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#087F5B] to-[#066347] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-[#A7F3D0]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7F3D0]">
                  Real Mobile Delivery
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-[#A7F3D0] text-[9px] font-bold">
                  Active
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black leading-tight">
                Send Real SMS to Citizen Mobile
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Recipient Phone Selector */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#087F5B]" />
                <span>Recipient Mobile Number:</span>
              </label>
              <span className="text-[10px] text-emerald-700 font-medium">
                Verified Citizen SIM
              </span>
            </div>
            <div className="flex gap-2">
              <input
                id="real-sms-recipient-phone"
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="+91 98450 12345"
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveTab('instant')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'instant'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Direct Mobile Apps
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Scan with Phone
            </button>
            <button
              onClick={() => setActiveTab('gateway')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'gateway'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Cellular Gateway
            </button>
          </div>

          {/* TAB 1: Instant Mobile Apps */}
          {activeTab === 'instant' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#087F5B] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Tap below to immediately trigger your phone&apos;s real messaging app. The grievance tracking details and official link will be pre-filled automatically.
                </p>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Native SMS App */}
                <button
                  id="btn-open-real-native-sms"
                  onClick={handleOpenNativeSms}
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-600 to-[#087F5B] hover:from-emerald-700 hover:to-[#066347] text-white flex flex-col items-start gap-1 shadow-md hover:shadow-lg transition-all cursor-pointer text-left group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="p-1.5 rounded-xl bg-white/20 text-white group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full font-bold">
                      Native SMS
                    </span>
                  </div>
                  <strong className="text-xs font-black mt-1">Open Phone SMS App</strong>
                  <span className="text-[10px] text-emerald-100">
                    Opens Messages app to {cleaned.formatted}
                  </span>
                </button>

                {/* 2. WhatsApp Grievance Dispatch */}
                <button
                  id="btn-open-real-whatsapp"
                  onClick={handleOpenWhatsApp}
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] hover:from-[#20BA5A] hover:to-[#0D6E63] text-white flex flex-col items-start gap-1 shadow-md hover:shadow-lg transition-all cursor-pointer text-left group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="p-1.5 rounded-xl bg-white/20 text-white group-hover:scale-110 transition-transform">
                      <Smartphone className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full font-bold">
                      WhatsApp
                    </span>
                  </div>
                  <strong className="text-xs font-black mt-1">Send via WhatsApp</strong>
                  <span className="text-[10px] text-emerald-100">
                    Sends directly to {cleaned.formatted}
                  </span>
                </button>
              </div>

              {/* Extra sharing row */}
              <div className="flex gap-2">
                {typeof navigator !== 'undefined' && (navigator as any).share && (
                  <button
                    onClick={handleNativeShare}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#087F5B]" />
                    <span>Mobile Share Sheet</span>
                  </button>
                )}

                <button
                  onClick={handleCopy}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Copy SMS Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Scan with Phone Camera */}
          {activeTab === 'qr' && (
            <div className="space-y-3 text-center animate-in fade-in duration-150">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5 text-left">
                <QrIcon className="w-4 h-4 text-[#087F5B] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Scanning from Desktop/Laptop:</strong> Point your iPhone or Android camera at the QR code below. Your phone will prompt you to open its native Messages app with the SMS ready!
                </p>
              </div>

              <div className="inline-block p-4 rounded-3xl bg-white border-2 border-emerald-100 shadow-md">
                {smsQrUrl ? (
                  <img
                    src={smsQrUrl}
                    alt="SMS QR Code"
                    className="w-44 h-44 sm:w-48 sm:h-48 mx-auto"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
                    Generating SMS QR...
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">
                  Target: {cleaned.formatted}
                </p>
                <p className="text-[11px] text-slate-500">
                  Scanning triggers: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">sms:{cleaned.international}</code>
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Cellular Gateway Backend */}
          {activeTab === 'gateway' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Automated Telecom Carrier Dispatch</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    HTTP /api/send-sms
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  This connects to real telecom cellular towers (Airtel, Jio, Vi, BSNL) via integrated telecom SMS gateways (Twilio or Fast2SMS).
                </p>
              </div>

              <button
                id="btn-dispatch-carrier-gateway"
                onClick={handleSendViaGateway}
                disabled={isSendingGateway}
                className="w-full py-2.5 px-4 rounded-xl bg-[#087F5B] hover:bg-[#066347] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                {isSendingGateway ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Contacting Carrier SMS Gateway...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Telecom SMS to {cleaned.formatted}</span>
                  </>
                )}
              </button>

              {/* Status report */}
              {gatewayStatus && (
                <div
                  className={`p-3 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                    gatewayStatus.success
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {gatewayStatus.success ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Carrier SMS Successfully Dispatched!</span>
                      </>
                    ) : (
                      <>
                        <Info className="w-4 h-4 text-amber-600" />
                        <span>Telecom Gateway Credentials Notice</span>
                      </>
                    )}
                  </div>

                  {gatewayStatus.success ? (
                    <p className="text-[11px]">
                      Delivered via <strong>{gatewayStatus.provider}</strong>. Reference ID: <code className="font-mono">{gatewayStatus.sid || 'CONFIRMED'}</code>.
                    </p>
                  ) : (
                    <div className="space-y-1 text-[11px]">
                      <p>
                        To send automated carrier SMS directly over cell towers without user interaction, configure <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">TWILIO_ACCOUNT_SID</code> or <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">FAST2SMS_API_KEY</code> in your environment secrets.
                      </p>
                      <p className="font-bold text-amber-900">
                        In the meantime, use the <strong>Direct Mobile Apps</strong> tab above to send the real SMS immediately with 1 tap!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SMS Message Content Preview */}
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5 font-mono">
              <span className="text-emerald-400 font-bold">Sender: GOVT-MYSURU</span>
              <span>Recipient: {cleaned.formatted}</span>
            </div>
            <pre className="font-sans text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
              {smsText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Karnataka Civic Grievance SLA: 24h Routing Guarantee
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

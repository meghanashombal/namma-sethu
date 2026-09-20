import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Download,
  Printer,
  QrCode as QrIcon,
  CheckCircle2,
  ExternalLink,
  Building,
  Calendar,
  Phone,
} from 'lucide-react';
import { Complaint } from '../types';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  complaint,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && complaint) {
      const trackingUrl = `https://nammasethu.karnataka.gov.in/track/${complaint.id}`;
      QRCode.toDataURL(trackingUrl, {
        width: 280,
        margin: 2,
        color: {
          dark: '#087F5B',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen, complaint]);

  if (!isOpen || !complaint) return null;

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `NammaSethu-QR-${complaint.id}.png`;
    a.click();
  };

  const handlePrintNotice = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#087F5B] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrIcon className="w-5 h-5 text-[#A7F3D0]" />
            <h2 className="font-bold text-sm sm:text-base">
              Civic Complaint QR Code #{complaint.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/20 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Area */}
        <div ref={printAreaRef} className="p-6 text-center space-y-4 print:p-8">
          <div className="inline-block p-4 rounded-2xl bg-white border-2 border-emerald-100 shadow-inner">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ${complaint.id}`}
                className="w-48 h-48 sm:w-56 sm:h-56 mx-auto"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                Generating official QR...
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-xs">
            <p className="font-black text-slate-900 text-sm">{complaint.title}</p>
            <p className="text-slate-600 font-medium">{complaint.locationName}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#087F5B] font-bold text-[11px] border border-emerald-200">
              <Building className="w-3 h-3" />
              <span>{complaint.routingDecision.department}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 text-left space-y-1">
            <div className="flex justify-between">
              <span>Authority:</span>
              <strong className="text-slate-900">{complaint.routingDecision.authority}</strong>
            </div>
            <div className="flex justify-between">
              <span>Target Resolution:</span>
              <strong className="text-slate-900">{complaint.expectedResolutionDate}</strong>
            </div>
            <div className="flex justify-between">
              <span>Municipal Helpline:</span>
              <strong className="text-slate-900">0821-2440890 / 2418800</strong>
            </div>
          </div>

          <p className="text-[10px] text-slate-400">
            Scan to track real-time resolution status or verify municipal field progress on-site.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#087F5B]" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handlePrintNotice}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#087F5B] hover:bg-[#066347] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Notice</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import QRCode from 'qrcode';
import { Complaint } from '../types';

export interface SmsDispatchResult {
  success: boolean;
  provider?: string;
  sid?: string;
  error?: string;
  noGatewayConfigured?: boolean;
  message?: string;
}

export class RealSmsService {
  /**
   * Normalizes phone number to international standard (defaulting to India +91 if 10 digits)
   */
  static cleanPhoneNumber(rawPhone: string): { international: string; digitsOnly: string; formatted: string } {
    if (!rawPhone) {
      return { international: '+919845012345', digitsOnly: '919845012345', formatted: '+91 98450 12345' };
    }

    const digits = rawPhone.replace(/\D/g, '');

    // If 10 digits (e.g. 9845012345), assume India (+91)
    if (digits.length === 10) {
      return {
        international: `+91${digits}`,
        digitsOnly: `91${digits}`,
        formatted: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
      };
    }

    // If 12 digits starting with 91 (e.g. 919845012345)
    if (digits.length === 12 && digits.startsWith('91')) {
      const main = digits.slice(2);
      return {
        international: `+${digits}`,
        digitsOnly: digits,
        formatted: `+91 ${main.slice(0, 5)} ${main.slice(5)}`,
      };
    }

    // Fallback
    return {
      international: rawPhone.startsWith('+') ? rawPhone.replace(/\s+/g, '') : `+${digits}`,
      digitsOnly: digits,
      formatted: rawPhone,
    };
  }

  /**
   * Formats official Grievance SMS text for citizen mobile delivery
   */
  static formatComplaintSmsText(complaint: Complaint): string {
    const trackingUrl = `https://nammasethu.karnataka.gov.in/track/${complaint.id}`;
    const authority = complaint.routingDecision?.authority || 'Mysuru Municipal Authority';
    const dept = complaint.routingDecision?.department || 'Civic Works';

    return (
      `[Govt of Karnataka - Namma Sethu]\n` +
      `Dear ${complaint.citizenName},\n` +
      `Your grievance #${complaint.id} for "${complaint.category}" at ${complaint.locationName} is registered and routed to ${authority} (${dept}).\n\n` +
      `Track live progress: ${trackingUrl}\n` +
      `24-hr Routing SLA Active. Expected Resolution: ${complaint.expectedResolutionDate || '48 hours'}.`
    );
  }

  /**
   * Triggers the native mobile SMS messaging app on the user's device (Android, iOS, macOS, Windows Phone Link)
   * Pre-loads the citizen's mobile number and the full grievance tracking text.
   */
  static openNativeSms(phone: string, message: string): void {
    const cleaned = RealSmsService.cleanPhoneNumber(phone);
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // iOS uses ';?&body=' or '&body=', Android uses '?body='
    const separator = isIOS ? '&' : '?';
    const smsUrl = `sms:${cleaned.international}${separator}body=${encodeURIComponent(message)}`;

    // Create an anchor click to ensure browser handles protocol handler cleanly
    if (typeof window !== 'undefined') {
      const link = document.createElement('a');
      link.href = smsUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 500);
    }
  }

  /**
   * Dispatches the grievance update directly to the citizen's WhatsApp number.
   * Widely used by Karnataka Municipal authorities for instant citizen notification.
   */
  static openWhatsApp(phone: string, message: string): void {
    const cleaned = RealSmsService.cleanPhoneNumber(phone);
    const whatsappUrl = `https://wa.me/${cleaned.digitsOnly}?text=${encodeURIComponent(message)}`;
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Invokes native Web Share API to send the tracking SMS to Messages, WhatsApp, or any mobile messaging app.
   */
  static async shareViaNativeShare(title: string, message: string, trackingUrl: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title,
          text: message,
          url: trackingUrl,
        });
        return true;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Native share failed:', err);
        }
        return false;
      }
    }
    return false;
  }

  /**
   * Generates a mobile SMS QR code.
   * When scanned with any smartphone camera (iPhone / Android), the camera prompts:
   * "Send SMS to [Phone]" and automatically opens their real phone's SMS app with the pre-filled message!
   */
  static async generateSmsQrCode(phone: string, message: string): Promise<string> {
    const cleaned = RealSmsService.cleanPhoneNumber(phone);
    // Standard SMS URI for QR scanning
    const smsUri = `sms:${cleaned.international}?body=${encodeURIComponent(message)}`;

    return await QRCode.toDataURL(smsUri, {
      width: 260,
      margin: 2,
      color: {
        dark: '#087F5B',
        light: '#FFFFFF',
      },
    });
  }

  /**
   * Calls the backend `/api/send-sms` endpoint to attempt direct cellular network SMS delivery
   * via configured telecom gateways (Twilio, Fast2SMS, etc.).
   */
  static async sendViaBackendGateway(
    phone: string,
    message: string,
    complaintId: string
  ): Promise<SmsDispatchResult> {
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          message,
          complaintId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `Gateway returned HTTP ${response.status}`,
          noGatewayConfigured: errorData.noGatewayConfigured || false,
        };
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error connecting to SMS gateway',
        noGatewayConfigured: true,
      };
    }
  }
}

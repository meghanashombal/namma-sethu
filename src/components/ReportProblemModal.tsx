import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Mic,
  MicOff,
  Camera,
  Upload,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  Trash2,
  Smartphone,
  MessageSquare,
} from 'lucide-react';
import { User, Complaint, RoutingDecision } from '../types';
import { classifyCivicText, isSpeechRecognitionSupported } from '../services/classifier';
import { checkForDuplicate, DuplicateCheckResult } from '../services/duplicateDetector';
import { routeComplaint } from '../services/routingEngine';
import { StorageService } from '../services/storage';
import { RealSmsService } from '../services/realSms';
import { OFFICIAL_LOCALITIES } from '../data/mysuruOfficialData';
import { Language, translations, CATEGORY_TRANSLATIONS } from '../data/translations';

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  language: Language;
  onComplaintSubmitted: (complaint: Complaint, routingDecision: RoutingDecision) => void;
  onNavigateToDetail: (complaintId: string) => void;
}

const CATEGORIES = [
  'Pothole / Road Damage',
  'Garbage Overflow',
  'Blocked Drain',
  'Streetlight Problem',
  'Water Issue',
  'Construction Waste',
  'Other',
];

export const ReportProblemModal: React.FC<ReportProblemModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  language,
  onComplaintSubmitted,
  onNavigateToDetail,
}) => {
  const [step, setStep] = useState<number>(1);

  // Step 1: Category & Safety
  const [category, setCategory] = useState<string>('Pothole / Road Damage');
  const [isUrgentSafety, setIsUrgentSafety] = useState<boolean>(false);

  // Step 2: Description & Voice
  const [description, setDescription] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string>('');
  const [classification, setClassification] = useState<{
    category: string;
    confidence: number;
    explanation: string;
  } | null>(null);

  // Step 3: Photo / Video Upload
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string>('');

  // Step 4: Location
  const [selectedLocality, setSelectedLocality] = useState(OFFICIAL_LOCALITIES[0]);
  const [lat, setLat] = useState<number>(OFFICIAL_LOCALITIES[0].lat);
  const [lng, setLng] = useState<number>(OFFICIAL_LOCALITIES[0].lng);
  const [locationName, setLocationName] = useState<string>(OFFICIAL_LOCALITIES[0].name);
  const [gpsStatus, setGpsStatus] = useState<string>('');

  // Step 5: Duplicate check, mobile SMS tracking & submit
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
  const [citizenPhone, setCitizenPhone] = useState<string>(currentUser.phone || '+91 98450 12345');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Speech recognition ref
  const recognitionRef = useRef<any>(null);

  const t = translations[language];

  useEffect(() => {
    if (currentUser?.phone) {
      setCitizenPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Auto classify when description changes
  useEffect(() => {
    if (description.trim().length >= 5) {
      const res = classifyCivicText(description);
      if (res.confidence > 50) {
        setClassification(res);
      } else {
        setClassification(null);
      }
    } else {
      setClassification(null);
    }
  }, [description]);

  // Check for duplicates when reaching Step 5
  useEffect(() => {
    if (step === 5) {
      const dup = checkForDuplicate(category, lat, lng);
      setDuplicateResult(dup);
    }
  }, [step, category, lat, lng]);

  if (!isOpen) return null;

  // Voice handler
  const toggleVoiceRecording = () => {
    if (!isSpeechRecognitionSupported()) {
      setVoiceNotice('Voice input not supported in this browser. Please type your complaint.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'kn' ? 'kn-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice('Listening... Speak clearly in Kannada or English.');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setDescription((prev) => (prev ? prev + ' ' + transcript.trim() : transcript.trim()));
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setVoiceNotice('Microphone access denied or error occurred. Please type your complaint.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setVoiceNotice('Voice input not supported in this browser. Please type your complaint.');
    }
  };

  // Location handler
  const handleLocalityChange = (locName: string) => {
    const found = OFFICIAL_LOCALITIES.find((l) => l.name === locName);
    if (found) {
      setSelectedLocality(found);
      setLocationName(found.name);
      setLat(found.lat);
      setLng(found.lng);
    }
  };

  const detectBrowserGps = () => {
    setGpsStatus('Requesting GPS coordinates...');
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported by browser. Selected default Mysuru coordinates.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detectedLat = Number(pos.coords.latitude.toFixed(6));
        const detectedLng = Number(pos.coords.longitude.toFixed(6));
        setLat(detectedLat);
        setLng(detectedLng);
        setLocationName(`Current GPS (${detectedLat}, ${detectedLng})`);
        setGpsStatus('Location locked via GPS successfully!');
      },
      (err) => {
        setGpsStatus('GPS permission denied or unavailable. Fallback to Mysuru locality presets.');
      },
      { timeout: 8000 }
    );
  };

  // File upload handler (<10MB check)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size exceeds 10MB limit. Please upload a smaller photo or video.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Final Submit Action
  const handleSubmit = () => {
    setIsSubmitting(true);

    const complaintId = `MY-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const submissionDate = new Date().toISOString();

    // 1. Run Explainable Dynamic Routing
    const routingDecision = routeComplaint({
      complaintId,
      category,
      lat,
      lng,
      locationName,
      submissionDate,
    });

    // 2. Compute Expected Resolution Date based on official SLA
    const slaRules = StorageService.getSlaRules();
    const matchedSla =
      slaRules.find((r) => r.category === category && r.authority === routingDecision.authority) ||
      slaRules[0];
    const resolutionDays = matchedSla ? matchedSla.expectedResolutionDays : 3;
    const expDate = new Date(Date.now() + resolutionDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    // 3. Construct new Complaint object
    const newComplaint: Complaint = {
      id: complaintId,
      title: `${category} at ${locationName}`,
      category,
      description: description.trim() || `Reported ${category} requiring municipal attention at ${locationName}.`,
      status: 'Routed',
      priority: isUrgentSafety ? 'High' : 'Medium',
      isEmergencySafetyConcern: isUrgentSafety,
      isUrgentSafety,
      locationName,
      address: `${locationName}, Mysuru, Karnataka`,
      lat,
      lng,
      citizenId: currentUser.id,
      citizenName: currentUser.name,
      citizenPhone: citizenPhone.trim() || currentUser.phone || '+91 98450 12345',
      citizenEmail: currentUser.email,
      photoUrls:
        photos.length > 0
          ? photos
          : ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80'],
      createdAt: submissionDate,
      updatedAt: submissionDate,
      routingDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      expectedResolutionDate: expDate,
      routingDecision,
      escalationLevel: 0,
      confirmationsCount: 1,
      confirmedUserIds: [currentUser.id],
      linkedDuplicates: [],
      timeline: [
        {
          id: `tl-${Date.now()}-1`,
          status: 'Submitted',
          timestamp: submissionDate,
          title: 'Complaint Logged by Citizen',
          description: `Grievance submitted for ${category} at ${locationName}. Location coordinates locked: ${lat}, ${lng}.`,
          actor: currentUser.name,
          actorRole: 'CITIZEN',
        },
        {
          id: `tl-${Date.now()}-2`,
          status: 'Routed',
          timestamp: submissionDate,
          title: 'Smart Routing Executed',
          description: `Automatically routed to ${routingDecision.department} (${routingDecision.authority}) under ${routingDecision.ruleApplied}. 24-hr Routing SLA confirmed.`,
          actor: 'Namma Sethu Routing Engine',
          actorRole: 'SYSTEM',
        },
      ],
      internalNotes: [],
    };

    // Save to local storage (auto-queues SMS)
    StorageService.saveComplaint(newComplaint);

    // Asynchronously attempt direct carrier gateway transmission (Twilio / Fast2SMS)
    const smsContent = RealSmsService.formatComplaintSmsText(newComplaint);
    RealSmsService.sendViaBackendGateway(
      newComplaint.citizenPhone || '+91 98450 12345',
      smsContent,
      newComplaint.id
    ).catch((err) => console.error('Background Carrier SMS dispatch failed:', err));

    setTimeout(() => {
      setIsSubmitting(false);
      onComplaintSubmitted(newComplaint, routingDecision);
    }, 600);
  };

  const handleLinkToExisting = (existingComplaintId: string) => {
    // Generate placeholder ID to link
    const newId = `MY-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    StorageService.linkDuplicateComplaint(newId, existingComplaintId);
    onClose();
    onNavigateToDetail(existingComplaintId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header with Step indicator */}
        <div className="bg-[#087F5B] text-white px-5 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A7F3D0]">
                STEP {step} OF 5
              </span>
              <span>•</span>
              <span className="text-xs text-white/80">
                {step === 1 && 'Category Selection'}
                {step === 2 && 'Problem Description'}
                {step === 3 && 'Photo Evidence'}
                {step === 4 && 'Locality & GPS'}
                {step === 5 && 'Review & Routing'}
              </span>
            </div>
            <h2 className="text-lg font-black">{t.reportAProblem}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* STEP 1: Category Selection & Urgent Safety Check */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800">
                {t.selectCategory}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CATEGORIES.map((cat) => {
                  const label = language === 'kn' ? CATEGORY_TRANSLATIONS[cat]?.kn || cat : cat;
                  const isSelected = category === cat;

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#087F5B] bg-emerald-50/80 text-[#087F5B] font-bold shadow-sm ring-2 ring-[#087F5B]/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <span className="text-xs font-semibold">{label}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#087F5B] shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Urgent Safety Checkbox */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 cursor-pointer transition-colors hover:bg-rose-50">
                <input
                  type="checkbox"
                  checked={isUrgentSafety}
                  onChange={(e) => setIsUrgentSafety(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-rose-900 block">
                    {t.safetyConcern}
                  </span>
                  <span className="text-[11px] text-rose-700">
                    Triggers immediate High Priority status and alerts on-duty emergency control room officers.
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* STEP 2: Description + Voice Input + Auto-Classification */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  {t.describeProblem}
                </h3>

                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse shadow-md'
                      : 'bg-emerald-100 text-[#087F5B] hover:bg-emerald-200'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Recording... (Stop)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>{t.voiceInput}</span>
                    </>
                  )}
                </button>
              </div>

              {voiceNotice && (
                <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{voiceNotice}</span>
                </div>
              )}

              {/* Natural Language Textarea */}
              <div className="space-y-1">
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Deep pothole near Temple Road causing two-wheelers to slip, or overflowing garbage bin near market..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#087F5B] focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">
                  Supports natural language in English or Kannada (ಕನ್ನಡ).
                </p>
              </div>

              {/* AI Classification Pill */}
              {classification && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
                  <Sparkles className="w-4 h-4 text-[#087F5B] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#087F5B]">
                        Smart Classifier Suggestion: {classification.category} ({classification.confidence}%)
                      </span>
                      {category !== classification.category && (
                        <button
                          type="button"
                          onClick={() => setCategory(classification.category)}
                          className="text-[11px] font-bold text-[#087F5B] underline cursor-pointer ml-2"
                        >
                          Switch to this
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      {classification.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Photo / Video Upload */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800">
                {t.uploadPhoto}
              </h3>

              {/* Dropzone */}
              <label className="border-2 border-dashed border-slate-300 hover:border-[#087F5B] rounded-2xl p-6 text-center block cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">
                  Click to browse or drag and drop photo / video
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports JPEG, PNG, MP4, MOV (Max 10MB)
                </p>
              </label>

              {uploadError && (
                <p className="text-xs text-rose-600 font-medium">{uploadError}</p>
              )}

              {/* Uploaded Photos Preview List */}
              {photos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-600">Attached Evidence:</p>
                  <div className="flex flex-wrap gap-3">
                    {photos.map((src, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={src} alt="Evidence" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-black/60 hover:bg-rose-600 text-white p-1 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Location Selection */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800">
                {t.confirmLocation}
              </h3>

              {/* GPS Auto-Detect Button */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div>
                  <p className="text-xs font-bold text-[#087F5B]">
                    Automatic Geolocation (GPS)
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Lock coordinates from your current device
                  </p>
                </div>
                <button
                  type="button"
                  onClick={detectBrowserGps}
                  className="px-3 py-1.5 rounded-lg bg-[#087F5B] text-white text-xs font-bold hover:bg-[#066347] transition-colors cursor-pointer"
                >
                  Detect GPS
                </button>
              </div>

              {gpsStatus && (
                <p className="text-[11px] text-emerald-800 font-medium">{gpsStatus}</p>
              )}

              {/* Locality Selector Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Select Official Mysuru Locality:
                </label>
                <select
                  value={selectedLocality.name}
                  onChange={(e) => handleLocalityChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#087F5B] focus:outline-none bg-white font-medium"
                >
                  {OFFICIAL_LOCALITIES.map((loc) => (
                    <option key={loc.name} value={loc.name}>
                      {loc.name} — {loc.zone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Coordinates Preview Card */}
              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Location Preview:</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                  </span>
                </div>
                <p className="text-slate-600 font-medium">{locationName}</p>
                <p className="text-[11px] text-slate-500">
                  Zone: {selectedLocality.zone} • Official Ward: 1-65 Municipal Limit
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Review & Duplicate Detection */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800">
                5. Review Complaint & Routing Preview
              </h3>

              {/* Duplicate Warning if nearby match */}
              {duplicateResult && duplicateResult.hasDuplicate && duplicateResult.duplicateComplaint && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{t.duplicateWarning}</span>
                  </div>
                  <p className="text-xs text-amber-800">
                    Complaint <strong>#{duplicateResult.duplicateComplaint.id}</strong> ({duplicateResult.duplicateComplaint.category}) is already active just{' '}
                    <strong>{duplicateResult.distanceMeters}m</strong> away at {duplicateResult.duplicateComplaint.locationName}.
                  </p>
                  <div className="pt-1 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleLinkToExisting(duplicateResult.duplicateComplaint!.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 cursor-pointer"
                    >
                      {t.linkToExisting} (+1 Upvote)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuplicateResult(null)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100/50 cursor-pointer"
                    >
                      {t.submitSeparate}
                    </button>
                  </div>
                </div>
              )}

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Category:</span>
                  <span className="font-bold text-slate-900">{category}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Location:</span>
                  <span className="font-semibold text-slate-900">{locationName}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Citizen:</span>
                  <span className="font-semibold text-slate-900">{currentUser.name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Urgent Safety:</span>
                  <span className={isUrgentSafety ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                    {isUrgentSafety ? 'YES (High Priority)' : 'Standard Priority'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block mb-1">Description:</span>
                  <p className="text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] leading-relaxed">
                    {description.trim() || 'No additional text provided.'}
                  </p>
                </div>
              </div>

              {/* Mobile SMS Notification & Tracking Confirmation Card */}
              <div className="p-4 rounded-2xl bg-emerald-950 text-white border border-emerald-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-400">
                    <Smartphone className="w-4 h-4 text-[#A7F3D0]" />
                    <span>Instant SMS Tracking to Mobile</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Auto-Dispatched
                  </span>
                </div>

                <p className="text-[11px] text-emerald-100/90 leading-relaxed">
                  Upon submission, an official SMS with your <strong>Grievance Tracking ID</strong>, assigned municipal department, and live tracking URL will be sent to your mobile phone.
                </p>

                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-bold text-emerald-300 block">
                    Mobile Number for SMS Tracking:
                  </label>
                  <div className="relative">
                    <input
                      id="citizen-sms-phone-input"
                      type="tel"
                      value={citizenPhone}
                      onChange={(e) => setCitizenPhone(e.target.value)}
                      placeholder="+91 98450 12345"
                      className="w-full pl-3 pr-20 py-2 rounded-xl bg-slate-900 border border-emerald-700/80 text-white font-mono text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400 font-bold uppercase">
                      SMS Enabled
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-emerald-900/80 text-[10px] text-slate-300 font-sans leading-relaxed">
                  <span className="text-emerald-400 font-semibold block mb-0.5">
                    Preview SMS (Sender: GOVT-MYSURU):
                  </span>
                  "Dear {currentUser.name}, your grievance for &apos;{category}&apos; at {locationName} is registered and routed under 24-hr SLA. Track live: nammasethu.karnataka.gov.in/track/[ID]"
                </div>
              </div>

              {/* 24-hr Routing SLA Guarantee Notice */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
                <Sparkles className="w-4 h-4 text-[#087F5B] shrink-0" />
                <p className="text-[11px] text-emerald-800">
                  <strong>24-Hour Routing Guarantee:</strong> Upon submission, Namma Sethu automatically assigns this to the verified municipal department.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066347] text-white text-xs font-bold flex items-center gap-1 shadow-md transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              id="submit-complaint-final-btn"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] text-slate-900 text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Routing to Civic Authority...</span>
              ) : (
                <>
                  <span>{t.submitComplaint}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

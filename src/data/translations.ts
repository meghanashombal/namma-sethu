export type Language = 'en' | 'kn';

export interface Translations {
  appName: string;
  tagline: string;
  subTagline: string;
  heroHeadline: string;
  heroQuote: string;
  reportAProblem: string;
  problemsNearMe: string;
  trackComplaint: string;
  myReports: string;
  login: string;
  signUp: string;
  logout: string;
  switchLang: string;
  roleCitizen: string;
  roleStaff: string;
  roleAdmin: string;
  all: string;
  submitted: string;
  routed: string;
  inProgress: string;
  resolved: string;
  awaitingVerification: string;
  closed: string;
  reopened: string;
  slaBreached: string;
  escalated: string;
  manualReview: string;
  selectCategory: string;
  describeProblem: string;
  uploadPhoto: string;
  confirmLocation: string;
  submitComplaint: string;
  voiceInput: string;
  transcribedText: string;
  whyRoutedHere: string;
  whyDelayed: string;
  routingSlaBadge: string;
  expectedResolution: string;
  resolutionProofTitle: string;
  isProblemFixed: string;
  yesResolved: string;
  noStillExists: string;
  confirmProblem: string;
  problemNoLongerExists: string;
  civicHotspot: string;
  safetyConcern: string;
  duplicateWarning: string;
  linkToExisting: string;
  submitSeparate: string;
  helpAndInfo: string;
  auditLogs: string;
  dynamicJurisdiction: string;
  officialSources: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'NAMMA SETHU',
    tagline: 'Your problem. The right hands.',
    subTagline: 'Our Bridge connecting citizens of Mysuru to the verified civic authorities.',
    heroHeadline: 'Citizens don\'t need to know who is responsible. They simply report the problem. Namma Sethu finds the right hands.',
    heroQuote: 'Bridging citizens to Mysuru City Corporation, Town Municipal Councils & Panchayats.',
    reportAProblem: 'Report a Problem',
    problemsNearMe: 'Problems Near Me',
    trackComplaint: 'Track Complaint',
    myReports: 'My Reports',
    login: 'Login',
    signUp: 'Sign Up',
    logout: 'Logout',
    switchLang: 'ಕನ್ನಡ',
    roleCitizen: 'Citizen',
    roleStaff: 'Civic Staff',
    roleAdmin: 'Administrator',
    all: 'All',
    submitted: 'Submitted',
    routed: 'Routed',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    awaitingVerification: 'Awaiting Verification',
    closed: 'Closed',
    reopened: 'Reopened',
    slaBreached: 'SLA Breached',
    escalated: 'Escalated',
    manualReview: 'Manual Review Required',
    selectCategory: '1. Select or describe problem',
    describeProblem: '2. Describe the problem',
    uploadPhoto: '3. Upload Photo / Video evidence',
    confirmLocation: '4. Pinpoint Location',
    submitComplaint: 'Submit to Namma Sethu',
    voiceInput: 'Report Using Voice',
    transcribedText: 'Transcribed complaint',
    whyRoutedHere: 'Why was my complaint sent here?',
    whyDelayed: 'Why is my complaint delayed?',
    routingSlaBadge: 'Routed Within 24 Hours',
    expectedResolution: 'Expected Resolution',
    resolutionProofTitle: 'Resolution Proof (Before & After)',
    isProblemFixed: 'Is the problem actually fixed?',
    yesResolved: 'YES, ISSUE RESOLVED',
    noStillExists: 'NO, ISSUE STILL EXISTS',
    confirmProblem: 'Confirm Problem (+1)',
    problemNoLongerExists: 'Problem No Longer Exists',
    civicHotspot: 'Civic Hotspot',
    safetyConcern: 'Mark as Urgent Safety Concern',
    duplicateWarning: 'Similar complaint found nearby',
    linkToExisting: 'Link to Existing Complaint',
    submitSeparate: 'Submit as Separate Complaint',
    helpAndInfo: 'Help & Civic Helplines',
    auditLogs: 'Audit Logs',
    dynamicJurisdiction: 'Dynamic Jurisdiction',
    officialSources: 'Official Sources',
  },
  kn: {
    appName: 'ನಮ್ಮ ಸೇತು',
    tagline: 'ನಿಮ್ಮ ಸಮಸ್ಯೆ. ಸೂಕ್ತ ಅಧಿಕಾರಿಗಳ ಕೈಯಲ್ಲಿ.',
    subTagline: 'ಮೈಸೂರಿನ ನಾಗರಿಕರನ್ನು ಸರಿಯಾದ ನಾಗರಿಕ ಪ್ರಾಧಿಕಾರಕ್ಕೆ ಜೋಡಿಸುವ ಅಧಿಕೃತ ಡಿಜಿಟಲ್ ಸೇತು.',
    heroHeadline: 'ಯಾವ ಇಲಾಖೆ ಹೊಣೆಗಾರರೆಂದು ನಾಗರಿಕರು ತಿಳಿಯಬೇಕಿಲ್ಲ. ಕೇವಲ ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ, ನಮ್ಮ ಸೇತು ಸರಿಯಾದವರ ಬಳಿಗೆ ತಲುಪಿಸುತ್ತದೆ.',
    heroQuote: 'ನಾಗರಿಕರನ್ನು ಮೈಸೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ, ಪುರಸಭೆ ಮತ್ತು ಪಂಚಾಯತಿಗಳೊಂದಿಗೆ ಬೆಸೆಯುವ ಸೇತು.',
    reportAProblem: 'ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ',
    problemsNearMe: 'ನನ್ನ ಸುತ್ತಲಿನ ಸಮಸ್ಯೆಗಳು',
    trackComplaint: 'ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    myReports: 'ನನ್ನ ದೂರುಗಳು',
    login: 'ಲಾಗಿನ್',
    signUp: 'ನೋಂದಣಿ',
    logout: 'ನಿರ್ಗಮನ',
    switchLang: 'English',
    roleCitizen: 'ನಾಗರಿಕರು',
    roleStaff: 'ಪಾಲಿಕೆ ಸಿಬ್ಬಂದಿ',
    roleAdmin: 'ಆಡಳಿತಾಧಿಕಾರಿ',
    all: 'ಎಲ್ಲವೂ',
    submitted: 'ಸಲ್ಲಿಕೆಯಾಗಿದೆ',
    routed: 'ಮಾರ್ಗಸೂಚಿ ಮುಗಿದಿದೆ',
    inProgress: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ',
    resolved: 'ಪರಿಹರಿಸಲಾಗಿದೆ',
    awaitingVerification: 'ಪರಿಶೀಲನೆ ಬಾಕಿ',
    closed: 'ಮುಕ್ತಾಯಗೊಂಡಿದೆ',
    reopened: 'ಮರುತೆರೆಯಲಾಗಿದೆ',
    slaBreached: 'ಗಡುವು ಮೀರಿದೆ',
    escalated: 'ಉನ್ನತೀಕರಿಸಲಾಗಿದೆ',
    manualReview: 'ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ',
    selectCategory: '೧. ಸಮಸ್ಯೆಯ ವರ್ಗವನ್ನು ಆರಿಸಿ',
    describeProblem: '೨. ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ',
    uploadPhoto: '೩. ಫೋಟೋ / ವೀಡಿಯೊ ಅಪ್ಲೋಡ್ ಮಾಡಿ',
    confirmLocation: '೪. ಸ್ಥಳವನ್ನು ಖಚಿತಪಡಿಸಿ',
    submitComplaint: 'ನಮ್ಮ ಸೇತುಗೆ ಸಲ್ಲಿಸಿ',
    voiceInput: 'ಧ್ವನಿ ಮೂಲಕ ವರದಿ ಮಾಡಿ (ಮೈಕ್)',
    transcribedText: 'ಧ್ವನಿ ಪಠ್ಯ (Transcribed)',
    whyRoutedHere: 'ನನ್ನ ದೂರು ಇಲ್ಲಿಗೆ ಏಕೆ ಹೋಯಿತು?',
    whyDelayed: 'ದೂರು ವಿಳಂಬಕ್ಕೆ ಕಾರಣವೇನು?',
    routingSlaBadge: '೨೪ ಗಂಟೆಯೊಳಗೆ ರವಾನೆಯಾಗಿದೆ',
    expectedResolution: 'ನಿರೀಕ್ಷಿತ ಪರಿಹಾರ ದಿನಾಂಕ',
    resolutionProofTitle: 'ಪರಿಹಾರ ಪುರಾವೆ (ಮೊದಲು & ನಂತರ)',
    isProblemFixed: 'ಸಮಸ್ಯೆ ನಿಜವಾಗಿಯೂ ಬಗೆಹರಿದಿದೆಯೇ?',
    yesResolved: 'ಹೌದು, ಸಮಸ್ಯೆ ಪರಿಹಾರವಾಗಿದೆ',
    noStillExists: 'ಇಲ್ಲ, ಸಮಸ್ಯೆ ಇನ್ನು ಇದೆ',
    confirmProblem: 'ನಾನೂ ಧೃಡೀಕರಿಸುತ್ತೇನೆ (+೧)',
    problemNoLongerExists: 'ಸಮಸ್ಯೆ ಈಗ ಇಲ್ಲ',
    civicHotspot: 'ನಾಗರಿಕ ಹಾಟ್‌ಸ್ಪಾಟ್',
    safetyConcern: 'ತುರ್ತು ಸುರಕ್ಷತಾ ಸಮಸ್ಯೆ ಎಂದು ಗುರುತಿಸಿ',
    duplicateWarning: 'ಹತ್ತಿರದಲ್ಲೇ ಇಂಥದ್ದೇ ದೂರು ದಾಖಲಾಗಿದೆ',
    linkToExisting: 'ಈಗಿರುವ ದೂರಿಗೆ ಲಿಂಕ್ ಮಾಡಿ',
    submitSeparate: 'ಪ್ರತ್ಯೇಕ ಹೊಸ ದೂರಾಗಿ ಸಲ್ಲಿಸಿ',
    helpAndInfo: 'ಸಹಾಯ & ಅಧಿಕೃತ ಸಹಾಯವಾಣಿಗಳು',
    auditLogs: 'ಆಡಿಟ್ ಲಾಗ್',
    dynamicJurisdiction: 'ಡೈನಾಮಿಕ್ ಜೂರಿಸ್‌ಡಿಕ್ಷನ್',
    officialSources: 'ಅಧಿಕೃತ ಮೂಲಗಳು',
  },
};

export const CATEGORY_TRANSLATIONS: Record<string, { en: string; kn: string }> = {
  'Pothole / Road Damage': { en: 'Pothole / Road Damage', kn: 'ರಸ್ತೆ ಗುಂಡಿ / ಹಾನಿ' },
  'Garbage Overflow': { en: 'Garbage Overflow', kn: 'ಕಸದ ರಾಶಿ / ಸ್ವಚ್ಛತೆ' },
  'Blocked Drain': { en: 'Blocked Drain', kn: 'ಒಳಚರಂಡಿ / ಗಟಾರ ಬ್ಲಾಕ್' },
  'Streetlight Problem': { en: 'Streetlight Problem', kn: 'ಬೀದಿದೀಪ ದುರಸ್ತಿ' },
  'Water Issue': { en: 'Water Issue', kn: 'ಕುಡಿಯುವ ನೀರಿನ ಸರಬರಾಜು' },
  'Construction Waste': { en: 'Construction Waste', kn: 'ಕಟ್ಟಡ ತ್ಯಾಜ್ಯ / ಡೆಬ್ರಿಸ್' },
  'Other': { en: 'Other Civic Issue', kn: 'ಇತರ ನಾಗರಿಕ ಸಮಸ್ಯೆ' },
};

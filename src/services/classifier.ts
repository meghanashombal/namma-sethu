export interface ClassificationResult {
  category: string;
  confidence: number;
  matchedKeywords: string[];
  explanation: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Pothole / Road Damage': [
    'pothole', 'road', 'asphalt', 'crater', 'tar', 'bump', 'manhole cover', 'footpath', 'broken road', 'skid', 'cracks',
    'ಗುಂಡಿ', 'ರಸ್ತೆ', 'ಡಾಂಬರು', 'ಫುಟ್‌ಪಾತ್',
  ],
  'Garbage Overflow': [
    'garbage', 'trash', 'waste', 'bin', 'dump', 'rubbish', 'smell', 'litter', 'plastic', 'debris', 'dog', 'swachh',
    'ಕಸ', 'ಕಸದ', 'ಸ್ವಚ್ಛತೆ', 'ವಾಸನೆ', 'ಪ್ಲಾಸ್ಟಿಕ್',
  ],
  'Blocked Drain': [
    'drain', 'drainage', 'gutter', 'sewage', 'clog', 'overflow', 'manhole', 'stagnant', 'culvert', 'stench',
    'ಚರಂಡಿ', 'ಗಟಾರ', 'ಒಳಚರಂಡಿ', 'ನೀರು ನಿಂತಿದೆ',
  ],
  'Streetlight Problem': [
    'streetlight', 'street light', 'light', 'dark', 'lamp', 'pole', 'electric', 'bulb', 'flickering', 'cesc', 'cable', 'wire',
    'ಬೀದಿದೀಪ', 'ದೀಪ', 'ಕತ್ತಲೆ', 'ವಿದ್ಯುತ್', 'ಕಂಬ',
  ],
  'Water Issue': [
    'water', 'pipe', 'leak', 'drinking', 'pipeline', 'tap', 'pressure', 'vvww', 'burst', 'contaminated', 'supply',
    'ನೀರು', 'ಪೈಪ್', 'ಸೋರಿಕೆ', 'ಕುಡಿಯುವ ನೀರು', 'ಸರಬರಾಜು',
  ],
  'Construction Waste': [
    'construction', 'debris', 'rubble', 'cement', 'bricks', 'sand', 'dumping', 'building waste', 'gravel',
    'ಕಟ್ಟಡ', 'ತ್ಯಾಜ್ಯ', 'ಸಿಮೆಂಟ್', 'ಮರಳು', 'ಡೆಬ್ರಿಸ್',
  ],
};

export function classifyCivicText(text: string): ClassificationResult {
  if (!text || text.trim().length < 3) {
    return {
      category: 'Other',
      confidence: 50,
      matchedKeywords: [],
      explanation: 'Text too short for automated classification. Please select category manually.',
    };
  }

  const lower = text.toLowerCase();
  let bestCategory = 'Other';
  let bestScore = 0;
  let bestKeywords: string[] = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matched = keywords.filter((kw) => lower.includes(kw.toLowerCase()));
    if (matched.length > 0) {
      // Score based on matched count and length
      const score = Math.min(95, 60 + matched.length * 15);
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
        bestKeywords = matched;
      }
    }
  }

  if (bestScore === 0) {
    return {
      category: 'Other',
      confidence: 45,
      matchedKeywords: [],
      explanation: 'No specific civic keyword matched. Defaulted to Other (Manual Review).',
    };
  }

  return {
    category: bestCategory,
    confidence: bestScore,
    matchedKeywords: bestKeywords,
    explanation: `Identified "${bestCategory}" with ${bestScore}% confidence based on keywords: ${bestKeywords.join(', ')}.`,
  };
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export type DestinationType = 'CN' | 'MY' | 'JP' | 'VN' | 'GLOBAL';

export interface DocentInfo {
  spotName: string;
  summary: string;
  historyAndStory: string;
  mustSeePoints: string[];
  photoSpotTip?: string;
  foodOrTastingTip?: string;
  recommendedDuration: string;
}

export interface ItineraryStop {
  id?: string;
  time?: string;
  title: string;
  description?: string;
  category?: 'transit' | 'food' | 'sightseeing' | 'hotel' | 'flight';
  feeTip?: string;
  smartTip?: string;
  docent?: DocentInfo;
  isRecommended?: boolean;
}

export interface DayPlan {
  dayNumber: number;
  date: string;
  dayOfWeek: string;
  theme: string;
  city: string;
  stops: ItineraryStop[];
  dayHighlights: string[];
  dayReflection?: string;
}

export interface ChecklistItem {
  id: string;
  tier: 'MUST' | 'SAVINGS' | 'IGNORE';
  title: string;
  description: string;
  estimatedSavingKrw?: number;
  category: 'payment' | 'transit' | 'data' | 'prep' | 'entry';
  completed: boolean;
  actionTip?: string;
}

export interface VoiceJournalEntry {
  id: string;
  timestamp: string;
  spotTitle: string;
  category: 'food' | 'culture' | 'insight' | 'tip';
  transcript: string;
  rating?: number; // 1 to 5
  isRecommended?: boolean;
  audioDurationSeconds?: number;
}

export interface BestMoments {
  bestFood: { title: string; desc: string };
  bestPlace: { title: string; desc: string };
  goldenInsight: { title: string; desc: string };
}

export interface TripData {
  id: string;
  title: string;
  subtitle: string;
  dateRange: string;
  durationText: string;
  partyText: string;
  destinationType: DestinationType;
  heroImage: string;
  defaultBudgetKrw: number;
  days: DayPlan[];
  checklist: ChecklistItem[];
  keyRules: {
    title: string;
    description: string;
    tag: string;
  }[];
  bestMoments?: BestMoments;
  initialVoiceNotes?: VoiceJournalEntry[];
  sourceUrl?: string;
}

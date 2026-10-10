export type OrderType = 'points' | 'package';
export type GamingPlatform = 'steam' | 'xbox' | 'playstation';

export interface BracketTier {
  id: number;
  name: string;
  min: number;
  max: number;
  rate: number;
  color: string;
}

export interface CalculationBreakdownItem {
  tierName: string;
  points: number;
  rate: number;
  subtotal: number;
}

export interface PricingCalculationResult {
  initialPoints: number;
  targetPoints: number;
  totalPoints: number;
  totalPrice: number;
  slaDays: number;
  slaText: string;
  breakdown: CalculationBreakdownItem[];
  isValid: boolean;
  errorMessage?: string;
}

export interface JokiPackage {
  id: string;
  title: string;
  badge?: string;
  subtitle: string;
  price: number;
  formattedPrice: string;
  sla: string;
  isPopular?: boolean;
  isDecoy?: boolean;
  benefits: string[];
  ctaText: string;
  colorTheme: 'blue' | 'purple' | 'gold';
}

export interface CaseStudy {
  id: string;
  title: string;
  clientName: string;
  initialRating: number;
  targetRating: number;
  division: string;
  winStreak: number;
  winRate: string;
  slaActual: string;
  tactics: string;
  description: string;
  image: string;
  tags: string[];
  date: string;
  clientFeedback?: string;
}

export interface RecentJoki {
  id: string;
  clientName: string;
  packageName: string;
  initialRating?: number;
  targetRating?: number;
  status: 'Selesai' | 'Sedang Proses';
  duration: string;
  date: string;
  winStreak?: number;
  platform?: GamingPlatform;
  recordType?: 'points' | 'wdl'; // 'points' (default) atau 'wdl' (Weekend Event)
  wdlRecord?: {
    win: number;
    draw: number;
    loss: number;
  };
}

import { tokens } from './tokens';

export interface Identity {
  id: 'primary' | 'college' | 'lycee' | 'adult';
  branding: {
    main: string;
    accent: string;
  };
  ui: {
    hasGradient: boolean;
    gradientColors?: [string, string, ...string[]];
    cardRadius: number;
    showDecorativeShapes: boolean;
  };
  ai: {
    accent: string;
    error: string;
  };
  header: {
    bg: string;
    accent: string;
    emoji: string;
    welcomeText: string;
  };
  dailyWord: {
    bg?: string;
    gradient?: [string, string, ...string[]];
    decoration: 'circles' | 'water-drop' | 'none';
  };
  text: {
    onMain: string;
  };
}

// 🎈 PRIMARY : Joyeux et très rond
export const primaryIdentity: Identity = {
  id: 'primary',
  branding: { main: '#FFCE00', accent: '#FF5722' },
  ui: { 
    hasGradient: false, 
    cardRadius: tokens.borderRadius.xxl, // 24px
    showDecorativeShapes: true 
  },
  ai: { accent: '#9C27B0', error: '#F44336' },
  header: { bg: '#FFCE00', accent: '#FF5722', emoji: '🎈', welcomeText: 'Salut,' },
  dailyWord: { bg: '#FFEB3B', decoration: 'circles' },
  text: { onMain: '#000000' }
};

// 🎓 COLLEGE : Ton code actuel
export const collegeIdentity: Identity = {
  id: 'college',
  branding: { main: '#34495E', accent: '#FFD700' },
  ui: { 
    hasGradient: false, 
    cardRadius: tokens.borderRadius.xl, // 20px
    showDecorativeShapes: true 
  },
  ai: { accent: '#6366F1', error: '#EF4444' },
  header: { bg: '#34495E', accent: '#FFD700', emoji: '🚀', welcomeText: 'Ready,' },
  dailyWord: { bg: '#00D2FF', decoration: 'circles' },
  text: { onMain: '#FFFFFF' }
};

// 🎓 LYCEE : Ton code actuel
export const lyceeIdentity: Identity = {
  id: 'lycee',
  branding: { main: '#1A1A1A', accent: '#00E5FF' },
  ui: { 
    hasGradient: true, 
    gradientColors: ['#2C3E50', '#000000'],
    cardRadius: tokens.borderRadius.md, // 12px
    showDecorativeShapes: true 
  },
  ai: { accent: '#00E5FF', error: '#FF5252' },
  header: { bg: '#1A1A1A', accent: '#00E5FF', emoji: '🎓', welcomeText: 'Welcome,' },
  dailyWord: { gradient: ['#2C3E50', '#000000'], decoration: 'water-drop' },
  text: { onMain: '#00E5FF' }
};

// 💼 ADULT : Minimaliste et sérieux
export const adultIdentity: Identity = {
  id: 'adult',
  branding: { main: '#F3F4F6', accent: '#111827' },
  ui: { 
    hasGradient: false, 
    cardRadius: tokens.borderRadius.sm, // 8px
    showDecorativeShapes: false 
  },
  ai: { accent: '#1F2937', error: '#991B1B' },
  header: { bg: '#FFFFFF', accent: '#111827', emoji: '💼', welcomeText: 'Bonjour,' },
  dailyWord: { bg: '#F3F4F6', decoration: 'none' },
  text: { onMain: '#111827' }
};

export const dashboardIdentities = {
  primary: primaryIdentity,
  college: collegeIdentity,
  lycee: lyceeIdentity,
  adult: adultIdentity
};
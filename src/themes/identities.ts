import { tokens } from './tokens';

export interface Identity {
  id: 'college' | 'lycee';
  branding: {
    main: string;
  };
  ui: {
    hasGradient: boolean;
    gradientColors?: [string, string, ...string[]];
    cardRadius: number;
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

// 🎓 IDENTITY : COLLEGE
export const collegeIdentity: Identity = {
  id: 'college',
  branding: { 
    main: '#34495E' 
  },
  ui: { 
    hasGradient: false, 
    cardRadius: tokens.borderRadius.xl // 20px
  },
  header: {
    bg: '#34495E',
    accent: '#FFD700',
    emoji: '🚀',
    welcomeText: 'Ready,'
  },
  dailyWord: {
    bg: '#00D2FF',
    decoration: 'circles' // Utilise les cercles déco de dailyWordCard.js
  },
  text: { 
    onMain: '#FFFFFF' 
  }
};

// 🎓 IDENTITY : LYCEE
export const lyceeIdentity: Identity = {
  id: 'lycee',
  branding: { 
    main: '#1A1A1A' 
  },
  ui: { 
    hasGradient: true, 
    gradientColors: ['#2C3E50', '#000000'],
    cardRadius: tokens.borderRadius.md // 12px
  },
  header: {
    bg: '#1A1A1A',
    accent: '#00E5FF',
    emoji: '🎓',
    welcomeText: 'Welcome,'
  },
  dailyWord: {
    gradient: ['#2C3E50', '#000000'],
    decoration: 'water-drop' // Changement de look total
  },
  text: { 
    onMain: '#00E5FF' 
  }
};

export const dashboardIdentities = {
  college: collegeIdentity,
  lycee: lyceeIdentity
};
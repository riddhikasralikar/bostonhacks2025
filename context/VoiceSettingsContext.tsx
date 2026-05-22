// context/VoiceSettingsContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface VoiceStylist {
  id: string;
  name: string;
  voiceId: string;
  description: string;
  accent: string;
}

export const AVAILABLE_STYLISTS: VoiceStylist[] = [
  {
    id: 'Miranda Priestly',
    name: 'Miranda',
    voiceId: 'pSLoDT19w0D4NKjmynSw',
    description: 'Fashion icon. Icy, commanding, devastatingly precise.',
    accent: 'Trans-Atlantic'
  },
  {
    id: 'NYC Stylist',
    name: 'Bella',
    voiceId: 'fXC6rtFTWd7FXQm7P1PQ',
    description: 'Friendly and honest, the most NYC Stylist',
    accent: 'American'
  },
  {
    id: 'LA Stylist',
    name: 'Skylar',
    voiceId: 'PayTkRshUknJSMKYOVpA',
    description: 'Laid back, chill yet chic',
    accent: 'American'
  },
  {
    id: 'elli',
    name: 'Elli',
    voiceId: 'MF3mGyEYCl7XYWbV9V6O',
    description: 'Energetic & Young',
    accent: 'American'
  },
  {
    id: 'josh',
    name: 'Josh',
    voiceId: 'TxGEqnHWrfWFTfGW9XjX',
    description: 'Casual & Warm',
    accent: 'American'
  },
];

export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
];

interface VoiceSettings {
  isMuted: boolean;
  selectedStylist: VoiceStylist;
  selectedLanguage: { code: string; name: string; flag: string };
  volume: number;
}

interface VoiceSettingsContextType {
  settings: VoiceSettings;
  setMuted: (muted: boolean) => void;
  setStylist: (stylist: VoiceStylist) => void;
  setLanguage: (language: { code: string; name: string; flag: string }) => void;
  setVolume: (volume: number) => void;
}

const VoiceSettingsContext = createContext<VoiceSettingsContextType | undefined>(undefined);

export const VoiceSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<VoiceSettings>({
    isMuted: true,
    selectedStylist: AVAILABLE_STYLISTS[0],
    selectedLanguage: AVAILABLE_LANGUAGES[0],
    volume: 1.0,
  });

  const setMuted = (muted: boolean) => {
    setSettings(prev => ({ ...prev, isMuted: muted }));
  };

  const setStylist = (stylist: VoiceStylist) => {
    setSettings(prev => ({ ...prev, selectedStylist: stylist }));
  };

  const setLanguage = (language: { code: string; name: string; flag: string }) => {
    setSettings(prev => ({ ...prev, selectedLanguage: language }));
  };

  const setVolume = (volume: number) => {
    setSettings(prev => ({ ...prev, volume }));
  };

  return (
    <VoiceSettingsContext.Provider value={{ settings, setMuted, setStylist, setLanguage, setVolume }}>
      {children}
    </VoiceSettingsContext.Provider>
  );
};

export const useVoiceSettings = () => {
  const context = useContext(VoiceSettingsContext);
  if (!context) {
    throw new Error('useVoiceSettings must be used within VoiceSettingsProvider');
  }
  return context;
};

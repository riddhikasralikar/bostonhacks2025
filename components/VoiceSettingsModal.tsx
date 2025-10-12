// components/VoiceSettingsModal.tsx
import React from 'react';
import { useVoiceSettings, AVAILABLE_STYLISTS, AVAILABLE_LANGUAGES } from '../context/VoiceSettingsContext';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, setMuted, setStylist, setLanguage, setVolume } = useVoiceSettings();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white border-2 border-black max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="border-b-2 border-black p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Voice Settings</h2>
            <button onClick={onClose} className="text-2xl hover:text-gray-600 transition-colors">×</button>
          </div>

          <div className="p-6 space-y-8">
            
            <div>
              <h3 className="text-lg font-semibold mb-4 uppercase tracking-wider">Audio Control</h3>
              <div className="flex items-center justify-between p-4 border border-gray-300">
                <div>
                  <p className="font-medium">Voice Assistant</p>
                  <p className="text-sm text-gray-600">Enable or disable AI stylist voiceover</p>
                </div>
                <button
                  onClick={() => setMuted(!settings.isMuted)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.isMuted ? 'bg-gray-300' : 'bg-black'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.isMuted ? 'translate-x-1' : 'translate-x-6'
                  }`} />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 uppercase tracking-wider">Choose Your Stylist</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AVAILABLE_STYLISTS.map((stylist) => (
                  <button
                    key={stylist.id}
                    onClick={() => setStylist(stylist)}
                    className={`p-4 border-2 text-left transition-all ${
                      settings.selectedStylist.id === stylist.id
                        ? 'border-black bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-bold text-lg">{stylist.name}</p>
                      {settings.selectedStylist.id === stylist.id && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{stylist.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{stylist.accent} accent</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 uppercase tracking-wider">Language</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {AVAILABLE_LANGUAGES.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => setLanguage(language)}
                    className={`p-3 border-2 transition-all ${
                      settings.selectedLanguage.code === language.code
                        ? 'border-black bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">{language.flag}</div>
                    <p className="text-xs font-medium">{language.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 uppercase tracking-wider">Volume</h3>
              <div className="flex items-center gap-4">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium w-12 text-right">{Math.round(settings.volume * 100)}%</span>
              </div>
            </div>

          </div>

          <div className="border-t-2 border-black p-6">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-black text-white font-semibold tracking-wider uppercase hover:bg-gray-800 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VoiceSettingsModal;
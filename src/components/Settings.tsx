import React, { useState, useEffect } from 'react';
import BottomNav from './BottomNav';
import { DictationSettings, View } from '../types';

interface SettingsProps {
  settings: DictationSettings;
  onSettingsChange: (settings: DictationSettings) => void;
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function Settings({ settings, onSettingsChange, currentView, onViewChange }: SettingsProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    let retryCount = 0;
    const loadVoices = () => {
      if (!window.speechSynthesis) return;
      try {
        const availableVoices = window.speechSynthesis.getVoices() || [];
        if (availableVoices.length > 0) {
          const zhVoices = availableVoices.filter(v => v && v.lang && typeof v.lang === 'string' && v.lang.startsWith('zh'));
          setVoices(zhVoices);
        } else if (retryCount < 10) {
          retryCount++;
          setTimeout(loadVoices, 200);
        }
      } catch (e) {
        console.error("Error loading voices:", e);
      }
    };

    loadVoices();
    if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    if (voices.length > 0 && !settings.voiceName) {
      // Prioritize known iOS Mandarin voices like Tingting
      const defaultVoice = voices.find(v => v && v.name && (v.name.includes('Tingting') || v.name.includes('Ting-Ting'))) ||
        voices.find(v => 
        v && v.lang === 'zh-CN' && 
        v.name &&
        !v.name.toLowerCase().includes('cantonese') && 
        !v.name.toLowerCase().includes('hk') &&
        !v.name.toLowerCase().includes('tw') &&
        !v.name.includes('粤') &&
        !v.name.includes('Sin-Ji') &&
        !v.name.includes('Sinji')
      ) || voices.find(v => v && v.lang === 'zh-CN') || voices[0];
      
      if (defaultVoice && defaultVoice.name) {
        onSettingsChange({ ...settings, voiceName: defaultVoice.name });
      }
    }
  }, [voices, settings.voiceName, onSettingsChange, settings]);

  const updateSetting = (key: keyof DictationSettings, value: number | string) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleTestVoice = () => {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance("测试普通话声音，春暖花开");
        
        // CRITICAL FOR iOS: Always fetch fresh voice objects from the API.
        // Do not use the voices from React state, as they might be detached/stale in WebKit.
        const freshVoices = window.speechSynthesis.getVoices() || [];
        const selectedVoice = freshVoices.find(v => v && v.name === settings.voiceName);
        
        if (selectedVoice) {
          if (selectedVoice.lang) utterance.lang = selectedVoice.lang; // Order matters: set lang FIRST
          utterance.voice = selectedVoice;     // Set voice SECOND
        } else {
          utterance.lang = 'zh-CN';
        }
        
        utterance.volume = 1;
        utterance.pitch = 1;
        
        window.speechSynthesis.speak(utterance);
      }, 50);
    } catch (e) {
      console.error("Test voice error:", e);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 bg-background-light font-display">
      <header className="sticky top-0 z-50 flex items-center bg-background-light/80 backdrop-blur-md px-4 py-4 border-b border-primary/10">
        <h1 className="flex-1 text-center text-xl font-bold tracking-tight text-slate-900">播放设置</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <h3 className="text-slate-900 text-xl font-bold leading-tight tracking-tight mb-6">听写参数设置</h3>

        <div className="bg-white p-4 rounded-xl mb-4 shadow-sm">
          <div className="flex w-full items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">record_voice_over</span>
              <p className="text-slate-900 text-base font-medium">朗读声音 (普通话)</p>
            </div>
          </div>
          <div className="flex w-full items-center gap-2">
            <select 
              value={settings.voiceName || ''}
              onChange={(e) => updateSetting('voiceName', e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-primary/40 outline-none"
            >
              {voices.length === 0 && <option value="">加载声音中...</option>}
              {voices.map(voice => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
            <button 
              onClick={handleTestVoice}
              className="shrink-0 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors active:scale-95"
            >
              试听
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded-xl mb-4 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
              <span className="material-symbols-outlined text-xl">repeat</span>
            </div>
            <p className="text-slate-900 text-base font-medium">每个词语重复次数</p>
          </div>
          <div className="shrink-0">
            <div className="flex items-center gap-3 text-slate-900">
              <button 
                onClick={() => updateSetting('repeatCount', Math.max(1, settings.repeatCount - 1))}
                className="text-xl font-bold flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors active:scale-95"
              >-</button>
              <span className="text-lg font-semibold w-6 text-center">{settings.repeatCount}</span>
              <button 
                onClick={() => updateSetting('repeatCount', Math.min(5, settings.repeatCount + 1))}
                className="text-xl font-bold flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors active:scale-95"
              >+</button>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl mb-4 shadow-sm">
          <div className="flex w-full items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">timer</span>
              <p className="text-slate-900 text-base font-medium">单词重复间隔 (秒)</p>
            </div>
            <p className="text-primary text-sm font-bold">{settings.repeatInterval}s</p>
          </div>
          <div className="flex h-6 w-full items-center gap-4">
            <input 
              type="range" 
              min="1" max="10" step="1"
              value={settings.repeatInterval}
              onChange={(e) => updateSetting('repeatInterval', parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl mb-4 shadow-sm">
          <div className="flex w-full items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">last_page</span>
              <p className="text-slate-900 text-base font-medium">词语切换间隔 (秒)</p>
            </div>
            <p className="text-primary text-sm font-bold">{settings.switchInterval}s</p>
          </div>
          <div className="flex h-6 w-full items-center gap-4">
            <input 
              type="range" 
              min="2" max="20" step="1"
              value={settings.switchInterval}
              onChange={(e) => updateSetting('switchInterval', parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl mb-4 shadow-sm">
          <div className="flex w-full items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">speed</span>
              <p className="text-slate-900 text-base font-medium">语速调节</p>
            </div>
            <p className="text-primary text-sm font-bold">{settings.speechSpeed.toFixed(1)}x</p>
          </div>
          <div className="flex h-6 w-full items-center gap-4">
            <input 
              type="range" 
              min="0.5" max="1.5" step="0.1"
              value={settings.speechSpeed}
              onChange={(e) => updateSetting('speechSpeed', parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div className="flex justify-between mt-2 px-1">
            <span className="text-xs text-slate-400">0.5x</span>
            <span className="text-xs text-slate-400">1.0x</span>
            <span className="text-xs text-slate-400">1.5x</span>
          </div>
        </div>

        <div className="mt-8 flex justify-center opacity-40">
          <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-6xl">settings_voice</span>
          </div>
        </div>
      </main>

      <BottomNav currentView={currentView} onViewChange={onViewChange} />
    </div>
  );
}

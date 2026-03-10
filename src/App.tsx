import React, { useState } from 'react';
import Home from './components/Home';
import Settings from './components/Settings';
import Dictation from './components/Dictation';
import History from './components/History';
import { View, DictationSettings, defaultSettings, HistoryRecord } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [words, setWords] = useState<string[]>([]);
  const [settings, setSettings] = useState<DictationSettings>(defaultSettings);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  const handleStartDictation = (title: string, selectedWords: string[]) => {
    const newRecord: HistoryRecord = {
      id: Date.now().toString(),
      title,
      date: Date.now(),
      words: selectedWords
    };
    setHistory([newRecord, ...history]);
    setWords(selectedWords);
    setCurrentView('dictation');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-background-light">
      {currentView === 'home' && (
        <Home 
          onStartDictation={handleStartDictation} 
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      )}
      {currentView === 'settings' && (
        <Settings 
          settings={settings} 
          onSettingsChange={setSettings} 
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      )}
      {currentView === 'history' && (
        <History 
          history={history}
          currentView={currentView}
          onViewChange={setCurrentView}
          onReplay={handleStartDictation}
        />
      )}
      {currentView === 'dictation' && (
        <Dictation 
          words={words} 
          settings={settings} 
          onBack={handleBackToHome} 
        />
      )}
    </div>
  );
}

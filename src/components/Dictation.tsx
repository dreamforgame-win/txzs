import React, { useState, useEffect, useRef } from 'react';
import { DictationSettings } from '../types';

interface DictationProps {
  words: string[];
  settings: DictationSettings;
  onBack: () => void;
}

export default function Dictation({ words, settings, onBack }: DictationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [countdownType, setCountdownType] = useState<'none' | 'repeat' | 'next'>('none');
  
  const playbackRef = useRef({ active: false, cancelled: false });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resolveSleepRef = useRef<(() => void) | null>(null);

  const sleep = (ms: number) => new Promise<void>(resolve => {
    resolveSleepRef.current = resolve;
    timeoutRef.current = setTimeout(() => {
      resolveSleepRef.current = null;
      resolve();
    }, ms);
  });

  const cancelSleep = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (resolveSleepRef.current) {
      resolveSleepRef.current();
      resolveSleepRef.current = null;
    }
  };

  const speak = (text: string, speed: number): Promise<void> => {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = speed;
      
      const voices = window.speechSynthesis.getVoices();
      if (settings.voiceName) {
        const selectedVoice = voices.find(v => v.name === settings.voiceName);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else {
        // Fallback to finding a Mandarin voice if none selected
        const zhVoices = voices.filter(v => v.lang.startsWith('zh'));
        const defaultVoice = zhVoices.find(v => v.name.includes('Tingting') || v.name.includes('Ting-Ting')) ||
          zhVoices.find(v => 
          v.lang === 'zh-CN' && 
          !v.name.toLowerCase().includes('cantonese') && 
          !v.name.toLowerCase().includes('hk') &&
          !v.name.toLowerCase().includes('tw') &&
          !v.name.includes('粤') &&
          !v.name.includes('Sin-Ji') &&
          !v.name.includes('Sinji')
        ) || zhVoices.find(v => v.lang === 'zh-CN');
        
        if (defaultVoice) {
          utterance.voice = defaultVoice;
        }
      }
      
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      
      window.speechSynthesis.speak(utterance);
    });
  };

  const wait = async (seconds: number, type: 'repeat' | 'next') => {
    setCountdownType(type);
    for (let s = seconds; s > 0; s--) {
      if (playbackRef.current.cancelled) break;
      setCountdown(s);
      await sleep(1000);
    }
    setCountdownType('none');
  };

  const playLoop = async (startIndex: number) => {
    playbackRef.current.active = true;
    playbackRef.current.cancelled = false;
    setIsPlaying(true);
    setIsFinished(false);
    setCountdownType('none');
    
    let i = startIndex;
    
    while (playbackRef.current.active && i < words.length) {
      setCurrentIndex(i);
      
      for (let r = 0; r < settings.repeatCount; r++) {
        if (playbackRef.current.cancelled) break;
        
        await speak(words[i], settings.speechSpeed);
        if (playbackRef.current.cancelled) break;
        
        if (r < settings.repeatCount - 1) {
          await wait(settings.repeatInterval, 'repeat');
        }
      }
      
      if (playbackRef.current.cancelled) break;
      
      if (i < words.length - 1) {
        await wait(settings.switchInterval, 'next');
      }
      
      if (playbackRef.current.cancelled) break;
      i++;
    }
    
    if (i >= words.length && !playbackRef.current.cancelled) {
      setIsPlaying(false);
      setIsFinished(true);
      setCurrentIndex(words.length - 1);
      setCountdownType('none');
    }
  };

  const pause = () => {
    playbackRef.current.active = false;
    playbackRef.current.cancelled = true;
    window.speechSynthesis.cancel();
    cancelSleep();
    setIsPlaying(false);
    setCountdownType('none');
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      if (isFinished) {
        playLoop(0);
      } else {
        playLoop(currentIndex);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      pause();
      setCurrentIndex(prev => prev + 1);
      setIsFinished(false);
      if (isPlaying) {
        setTimeout(() => playLoop(currentIndex + 1), 50);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      pause();
      setCurrentIndex(prev => prev - 1);
      setIsFinished(false);
      if (isPlaying) {
        setTimeout(() => playLoop(currentIndex - 1), 50);
      }
    }
  };

  const handleStopAndReturn = () => {
    pause();
    onBack();
  };

  useEffect(() => {
    return () => {
      pause();
    };
  }, []);

  const progressPercentage = Math.round(((currentIndex + (isFinished ? 1 : 0)) / words.length) * 100);

  return (
    <div className="relative flex flex-col min-h-screen w-full max-w-md mx-auto shadow-2xl bg-background-light overflow-hidden font-display">
      <header className="flex items-center px-4 py-4 justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <button 
          onClick={handleStopAndReturn}
          className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors"
        >
          <span className="material-symbols-outlined text-slate-900">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold flex-1 text-center pr-10">
          {isFinished ? '听写完成' : '听写进行中'}
        </h2>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full text-center space-y-2 mb-12">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary/60">当前词语</span>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-slate-900 break-words">
            {words[currentIndex]}
          </h1>
          
          {/* Countdown Display */}
          <div className="h-8 mt-6 flex items-center justify-center">
            {countdownType !== 'none' && isPlaying && (
              <span className="text-sm font-medium text-slate-600 bg-slate-200/60 px-4 py-1.5 rounded-full flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">timer</span>
                {countdownType === 'next' ? '下一个词语' : '重复朗读'}倒计时: <span className="text-primary font-bold">{countdown}s</span>
              </span>
            )}
            {!isPlaying && !isFinished && currentIndex === 0 && (
              <span className="text-sm font-medium text-slate-500 bg-slate-200/60 px-4 py-1.5 rounded-full flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                点击下方播放按钮开始
              </span>
            )}
            {!isPlaying && !isFinished && currentIndex > 0 && (
              <span className="text-sm font-medium text-slate-500 bg-slate-200/60 px-4 py-1.5 rounded-full flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">pause_circle</span>
                已暂停
              </span>
            )}
          </div>
        </div>

        <div className="w-full max-w-sm p-6 bg-white rounded-xl border border-primary/10 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500 uppercase">当前进度</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-primary">{isFinished ? words.length : currentIndex + 1}</span>
                <span className="text-slate-400">/ {words.length}</span>
              </div>
            </div>
            <div className="bg-primary/10 px-3 py-1 rounded-full">
              <span className="text-primary font-bold text-sm">{progressPercentage}%</span>
            </div>
          </div>
          <div className="relative h-3 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="mt-3 text-sm text-slate-500 text-center">
            共 {words.length} 个词语，还剩 {isFinished ? 0 : words.length - currentIndex - 1} 个
          </p>
        </div>
      </main>

      <footer className="p-6 bg-white border-t border-slate-100">
        <div className="flex items-center justify-between gap-4 mb-6">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0 && !isFinished}
            className="flex flex-1 flex-col items-center justify-center py-4 rounded-xl bg-slate-100 text-slate-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
          >
            <span className="material-symbols-outlined text-[32px]">skip_previous</span>
            <span className="text-xs font-bold mt-1">上一个</span>
          </button>
          <button 
            onClick={togglePlay}
            className="flex flex-[1.5] items-center justify-center h-20 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[48px] fill">
              {isPlaying ? 'pause_circle' : (isFinished ? 'replay' : 'play_circle')}
            </span>
          </button>
          <button 
            onClick={handleNext}
            disabled={currentIndex === words.length - 1 || isFinished}
            className="flex flex-1 flex-col items-center justify-center py-4 rounded-xl bg-slate-100 text-slate-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
          >
            <span className="material-symbols-outlined text-[32px]">skip_next</span>
            <span className="text-xs font-bold mt-1">下一个</span>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={handleStopAndReturn}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">stop_circle</span>
            <span>停止并返回</span>
          </button>
        </div>
      </footer>

      <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl -ml-24 -mb-24"></div>
    </div>
  );
}

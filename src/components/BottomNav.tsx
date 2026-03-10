import React from 'react';
import { View } from '../types';

interface BottomNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white/90 backdrop-blur-xl border-t border-slate-200 px-2 pb-6 pt-3 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
      <button onClick={() => onViewChange('home')} className={`flex flex-1 flex-col items-center gap-1 ${currentView === 'home' ? 'text-primary' : 'text-slate-400 hover:text-primary transition-colors'}`}>
        <span className={`material-symbols-outlined text-[28px] ${currentView === 'home' ? 'fill' : ''}`}>home</span>
        <span className="text-[10px] font-bold">首页</span>
      </button>
      <button onClick={() => onViewChange('history')} className={`flex flex-1 flex-col items-center gap-1 ${currentView === 'history' ? 'text-primary' : 'text-slate-400 hover:text-primary transition-colors'}`}>
        <span className={`material-symbols-outlined text-[28px] ${currentView === 'history' ? 'fill' : ''}`}>history</span>
        <span className="text-[10px] font-medium">历史记录</span>
      </button>
      <button onClick={() => onViewChange('settings')} className={`flex flex-1 flex-col items-center gap-1 ${currentView === 'settings' ? 'text-primary' : 'text-slate-400 hover:text-primary transition-colors'}`}>
        <span className={`material-symbols-outlined text-[28px] ${currentView === 'settings' ? 'fill' : ''}`}>settings</span>
        <span className="text-[10px] font-medium">设置</span>
      </button>
    </nav>
  );
}

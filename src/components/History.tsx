import React, { useState } from 'react';
import BottomNav from './BottomNav';
import { View, HistoryRecord } from '../types';

interface HistoryProps {
  history: HistoryRecord[];
  currentView: View;
  onViewChange: (view: View) => void;
  onReplay: (title: string, words: string[]) => void;
}

export default function History({ history, currentView, onViewChange, onReplay }: HistoryProps) {
  const [viewingRecord, setViewingRecord] = useState<HistoryRecord | null>(null);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 bg-background-light font-display text-slate-900">
      <header className="sticky top-0 z-50 flex items-center bg-background-light/80 backdrop-blur-md px-4 py-4 border-b border-primary/10">
        <h1 className="flex-1 text-center text-xl font-bold tracking-tight text-slate-900">历史记录</h1>
      </header>

      <main className="flex flex-col gap-4 p-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-50">history</span>
            <p>暂无听写记录</p>
          </div>
        ) : (
          history.map(record => (
            <div key={record.id} className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm border border-primary/5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base">{record.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(record.date).toLocaleString()} · 共 {record.words.length} 词
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => setViewingRecord(record)}
                  className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium text-sm hover:bg-slate-200 transition-colors"
                >
                  查看词语
                </button>
                <button 
                  onClick={() => onReplay(record.title, record.words)}
                  className="flex-1 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">replay</span>
                  重听
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {viewingRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg">{viewingRecord.title}</h3>
              <button onClick={() => setViewingRecord(null)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {viewingRecord.words.map((word, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-primary/5 text-primary rounded-lg text-sm font-medium">
                    {word}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100">
              <button 
                onClick={() => setViewingRecord(null)}
                className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav currentView={currentView} onViewChange={onViewChange} />
    </div>
  );
}

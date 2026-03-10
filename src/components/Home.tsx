import React, { useState } from 'react';
import BottomNav from './BottomNav';
import { View } from '../types';

interface HomeProps {
  onStartDictation: (title: string, words: string[]) => void;
  currentView: View;
  onViewChange: (view: View) => void;
}

const PRESETS = [
  { title: '第一单元生字', count: 20, words: ['春暖花开', '万物复苏', '百鸟争鸣', '冰雪融化', '泉水叮咚', '百花齐放', '柳绿花红', '莺歌燕舞', '草长莺飞', '鸟语花香'] },
  { title: '期中复习', count: 50, words: ['测试', '复习', '考试', '努力', '进步'] },
  { title: '三年级上册期末', count: 120, words: ['期末', '总结', '寒假', '新年', '快乐'] },
  { title: '四年级下册古诗', count: 15, words: ['宿建德江', '六月二十七日望湖楼醉书', '西江月'] },
  { title: '五年级易错词', count: 30, words: ['踌躇', '黯然', '破绽', '簇拥', '手腕'] },
];

export default function Home({ onStartDictation, currentView, onViewChange }: HomeProps) {
  const [customInput, setCustomInput] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const handleStartCustom = () => {
    const words = customInput.split(/[,，\s]+/).filter(w => w.trim().length > 0);
    if (words.length > 0) {
      onStartDictation('临时听写', words);
      setCustomInput('');
    } else {
      alert('请输入至少一个词语');
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 bg-background-light font-display text-slate-900">
      <header className="sticky top-0 z-50 flex items-center bg-background-light/80 backdrop-blur-md px-4 py-4 border-b border-primary/10">
        <h1 className="flex-1 text-center text-xl font-bold tracking-tight text-slate-900">听写助手</h1>
      </header>

      <main className="flex flex-col gap-6 p-4">
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">预设模版</h2>
            <button 
              onClick={() => setShowTemplates(true)}
              className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full cursor-pointer hover:bg-primary/20 transition-colors"
            >
              查看全部
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {PRESETS.slice(0, 3).map((preset, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-primary/5">
                <div className="flex flex-col gap-1 flex-1">
                  <p className="text-base font-bold text-slate-900">{preset.title}</p>
                  <p className="text-sm text-slate-500">共 {preset.words.length} 个词语</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onStartDictation(preset.title, preset.words)}
                    className="flex h-10 px-4 items-center justify-center gap-2 rounded-lg bg-primary text-white font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                    <span>开始</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold">临时添加</h2>
          <div className="flex flex-col gap-4 p-5 rounded-xl bg-white border border-primary/10 shadow-sm">
            <button 
              onClick={handleStartCustom}
              className="flex w-full h-14 items-center justify-center gap-3 rounded-xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/25 active:scale-[0.98] transition-all hover:bg-primary/90"
            >
              <span className="material-symbols-outlined font-bold text-[24px]">add</span>
              <span>新建听写</span>
            </button>
            <div className="relative">
              <textarea 
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full min-h-[160px] p-4 rounded-lg bg-background-light border-none focus:ring-2 focus:ring-primary/40 text-sm leading-relaxed placeholder:text-slate-400 resize-none outline-none" 
                placeholder="输入或粘贴词语，用逗号或空格分隔..."
              ></textarea>
              <div className="absolute bottom-3 right-3 flex items-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px]">info</span>
                自动识别分隔符
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg">全部模版</h3>
              <button onClick={() => setShowTemplates(false)} className="text-slate-400 hover:text-slate-700 bg-slate-200/50 rounded-full p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex flex-col gap-3">
              {PRESETS.map((preset, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <div className="flex flex-col gap-1 flex-1">
                    <p className="text-base font-bold text-slate-900">{preset.title}</p>
                    <p className="text-sm text-slate-500">共 {preset.words.length} 个词语</p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowTemplates(false);
                      onStartDictation(preset.title, preset.words);
                    }}
                    className="flex h-10 px-4 items-center justify-center gap-2 rounded-lg bg-primary text-white font-medium shadow-md hover:bg-primary/90 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                    <span>开始</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav currentView={currentView} onViewChange={onViewChange} />
    </div>
  );
}

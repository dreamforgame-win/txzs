export type View = 'home' | 'settings' | 'dictation' | 'history';

export interface DictationSettings {
  repeatCount: number;
  repeatInterval: number;
  switchInterval: number;
  speechSpeed: number;
}

export const defaultSettings: DictationSettings = {
  repeatCount: 2,
  repeatInterval: 2,
  switchInterval: 8,
  speechSpeed: 0.9,
};

export interface HistoryRecord {
  id: string;
  title: string;
  date: number;
  words: string[];
}

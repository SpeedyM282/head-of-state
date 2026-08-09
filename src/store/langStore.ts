import { create } from 'zustand';
import type { Lang } from '../core/types';
import type { Ui } from '../i18n';
import { uiStrings } from '../i18n';
import { loadLang, saveLang } from './persistence';

interface LangStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

/** Reflect the active language on <html lang> for accessibility / correct rendering. */
function applyHtmlLang(lang: Lang): void {
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
}

const initialLang = loadLang();
applyHtmlLang(initialLang);

export const useLang = create<LangStore>((set) => ({
  lang: initialLang,
  setLang: (lang) => {
    saveLang(lang);
    applyHtmlLang(lang);
    set({ lang });
  },
}));

/** Convenience: the fixed ui strings for the active language. */
export function useUi(): Ui {
  return uiStrings[useLang((s) => s.lang)];
}

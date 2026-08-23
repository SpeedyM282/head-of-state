import { create } from 'zustand';
import { loadTheme, saveTheme } from './persistence';

/** 'system' resolves live from prefers-color-scheme; 'light'/'dark' are explicit and persist. */
export type Theme = 'light' | 'dark' | 'system';

function resolveEffective(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return theme;
}

/** Writes the RESOLVED theme ('light'/'dark', never 'system' itself) onto <html data-theme>,
 * so index.css only ever needs to key off `[data-theme="dark"]` — no prefers-color-scheme
 * logic duplicated in CSS. */
function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', resolveEffective(theme));
}

const initialTheme = loadTheme();
applyTheme(initialTheme);

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useTheme = create<ThemeStore>((set) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    saveTheme(theme);
    applyTheme(theme);
    set({ theme });
  },
}));

// While theme === 'system', follow the OS preference live (not just at load time) — e.g. the
// device switches to night mode while the game is already open.
if (typeof window !== 'undefined') {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onSystemChange = () => {
    if (useTheme.getState().theme === 'system') applyTheme('system');
  };
  // Safari < 14 lacks addEventListener on MediaQueryList; addListener is its deprecated
  // equivalent — same fallback pattern as ui/hooks/useViewport.ts.
  media.addEventListener?.('change', onSystemChange);
  media.addListener?.(onSystemChange);
}

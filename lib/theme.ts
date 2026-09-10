export type Theme = 'light' | 'dark';
export const THEME_STORAGE_KEY = 'planeon-theme';
export const THEME_CHANGE_EVENT = 'planeon-theme-change';

/** Light remains the original default; only an explicit choice enables dark. */
export const resolveTheme = (value: string | null | undefined): Theme =>
  value === 'dark' ? 'dark' : 'light';

// Static, allowlisted input only. Runs in <head> before the first body paint.
// No URL, user content, cookie, account state or network request is involved.
export const THEME_BOOTSTRAP = `(()=>{let theme='light';try{if(localStorage.getItem('${THEME_STORAGE_KEY}')==='dark')theme='dark'}catch{}const root=document.documentElement;root.dataset.theme=theme;root.classList.toggle('dark',theme==='dark')})();`;

export function readTheme(): Theme {
  return typeof document === 'undefined'
    ? 'light'
    : resolveTheme(document.documentElement.dataset.theme);
}

export function applyTheme(theme: Theme, persist = true) {
  const next = resolveTheme(theme);
  document.documentElement.dataset.theme = next;
  document.documentElement.classList.toggle('dark', next === 'dark');
  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // The control still works for this page when storage is unavailable.
    }
  }
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function subscribeTheme(notify: () => void) {
  const storageChanged = (event: StorageEvent) => {
    try {
      if (event.storageArea !== localStorage) return;
    } catch {
      return;
    }
    if (event.key === THEME_STORAGE_KEY || event.key === null)
      applyTheme(resolveTheme(event.newValue), false);
  };
  window.addEventListener(THEME_CHANGE_EVENT, notify);
  window.addEventListener('storage', storageChanged);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, notify);
    window.removeEventListener('storage', storageChanged);
  };
}

/** Presentation only: documentary source colors stay in the harness registry. */
export function planePaint(
  plane: 'runtime' | 'trust' | 'execution' | 'knowledge',
) {
  return { color: `var(--${plane})`, tint: `var(--${plane}-tint)` };
}

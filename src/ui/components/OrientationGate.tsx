import { useEffect } from 'react';
import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { isPhonePortrait, useViewport } from '../hooks/useViewport';

/** A phone rotating from portrait to landscape — the two states drawn directly, no CSS
 * rotation animation (keeps it legible and motion-safe under prefers-reduced-motion). */
function RotateDeviceIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
      <rect x="27" y="6" width="18" height="30" rx="2.5" stroke="var(--paper-line)" strokeWidth="2" opacity="0.5" />
      <rect x="18" y="30" width="36" height="20" rx="2.5" stroke="var(--gold)" strokeWidth="2.5" fill="var(--ink-soft)" />
      <circle cx="36" cy="40" r="1.6" fill="var(--gold)" />
      <path
        d="M52 16 A20 20 0 0 1 60 30"
        stroke="var(--gold)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M60 30 L61 22 M60 30 L53 27" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Web fallback for phone orientation lock (Capacitor's @capacitor/screen-orientation isn't
 * wired in yet — see ARCHITECTURE.md's stage-4 TODO). Mounted once at the app root so it can
 * cover any screen/phase; hides the whole app and auto-pauses the game clock (manual-pause-wins
 * rules unaffected — this is just another auto-pause reason, same mechanism as an event or the
 * open reforms panel) whenever a phone is held portrait. Tablets are exempt (isPhonePortrait
 * only trips below the tablet width threshold), matching the "phone landscape-only, tablet
 * either orientation" rule.
 */
export function OrientationGate() {
  const viewport = useViewport();
  const setOrientationPaused = useGameStore((s) => s.setOrientationPaused);
  const ui = useUi();
  const blocked = isPhonePortrait(viewport);

  useEffect(() => {
    setOrientationPaused(blocked);
  }, [blocked, setOrientationPaused]);

  if (!blocked) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 px-[max(2rem,calc(1rem+env(safe-area-inset-left,0px)))] text-center"
      style={{ background: 'var(--ink)', color: 'var(--paper)' }}
      role="alert"
    >
      <RotateDeviceIcon />
      <div>
        <p className="text-lg font-bold tracking-wide">{ui.orientationGate.title}</p>
        <p className="mt-1 text-sm opacity-70">{ui.orientationGate.hint}</p>
      </div>
    </div>
  );
}

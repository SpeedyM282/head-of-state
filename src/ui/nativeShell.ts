import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar } from '@capacitor/status-bar';
import { PHONE_MAX_WIDTH } from './hooks/useViewport';

/** Native-only window setup, run once at boot (main.tsx). No-op on the web. */
export function initNativeShell(): void {
  if (!Capacitor.isNativePlatform()) return;
  void lockPhoneOrientation();
  // Full-screen game: the status bar only steals height from a landscape layout. A swipe
  // from the edge still reveals it temporarily (system behavior).
  StatusBar.hide().catch(() => {});
}

/**
 * Native phones are locked to landscape (ARCHITECTURE.md §7); tablets keep both orientations.
 * The lock replaces OrientationGate on native phones — the gate stays mounted as the web
 * fallback and for platforms where the lock fails. Uses the screen's short side so the
 * phone/tablet decision doesn't depend on how the device is held at launch.
 */
async function lockPhoneOrientation(): Promise<void> {
  const shortSide = Math.min(window.screen.width, window.screen.height);
  if (shortSide >= PHONE_MAX_WIDTH) return;
  try {
    await ScreenOrientation.lock({ orientation: 'landscape' });
  } catch {
    // Lock unsupported — OrientationGate covers portrait instead.
  }
}

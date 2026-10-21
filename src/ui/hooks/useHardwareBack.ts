import { useEffect } from 'react';
import { App as NativeApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useGameStore } from '../../store/gameStore';

/**
 * Android's hardware/gesture back. Every screen already treats Esc as "back" (close the open
 * panel/modal, then leave the screen), so back is replayed as a synthetic Esc keydown and
 * those handlers stay the single source of truth; a handler that acts calls preventDefault().
 * Unhandled: from the menu the app goes to the background (Android's root-screen convention),
 * from anywhere else back returns to the menu — the same as each screen's on-screen menu
 * button, and safe mid-game because every tick and action is already saved.
 */
export function useHardwareBack(): void {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listener = NativeApp.addListener('backButton', () => {
      const escape = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true });
      // Dispatched where a real key press would land, so capture-phase listeners on window
      // (TutorialOverlay) still run first and can stop it reaching the screens.
      (document.activeElement ?? document.body).dispatchEvent(escape);
      if (escape.defaultPrevented) return;
      const { phase, toMenu } = useGameStore.getState();
      if (phase === 'menu') NativeApp.minimizeApp().catch(() => {});
      else toMenu();
    });
    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, []);
}

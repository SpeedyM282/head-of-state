import { useEffect, useRef } from 'react';
import { vectorZone } from '../../core';
import { loc } from '../../i18n';
import { useGameStore } from '../../store/gameStore';
import { useLang, useUi } from '../../store/langStore';
import { useTutorialStore } from '../../store/tutorialStore';
import { AdvisorPanel } from './AdvisorPanel';
import { JIT_TIPS, SCRIPTED_STEPS } from './content';
import { Spotlight } from './Spotlight';
import { useAnchorRect } from './useAnchorRect';

/**
 * Mounted once at the app root (see App.tsx), same as OrientationGate — observes the game store
 * and the tutorial store, renders whichever of "scripted step" / "one-time JIT tip" is currently
 * active (never both; a scripted step always takes priority), and drives the store transitions
 * that depend on live game state: capturing the session's starting zone, detecting the reforms
 * panel opening, detecting a reform purchase, and evaluating JIT tip predicates. Nothing here
 * touches core/ — every predicate is a pure read of already-observable GameState/GameContent.
 */
export function TutorialOverlay() {
  const { state, content, reformsOpen } = useGameStore();
  const lang = useLang((s) => s.lang);
  const ui = useUi();
  const {
    scriptedStep,
    jitEnabled,
    activeTipId,
    seenTips,
    initialZone,
    reformsCountAtStepStart,
    advanceScripted,
    notifyReformsOpened,
    notifyReformPurchased,
    skip,
    captureInitialZone,
    showTip,
    dismissActiveTip,
  } = useTutorialStore();

  // Capture the session's starting zone once per game — keyed on the seed, which is unique per
  // startGame() call — so the "vector zone changed" tip has a fixed baseline to compare against.
  useEffect(() => {
    if (!state) return;
    captureInitialZone(vectorZone(state.vector));
  }, [state?.seed, captureInitialZone]);

  useEffect(() => {
    if (reformsOpen) notifyReformsOpened();
  }, [reformsOpen, notifyReformsOpened]);

  useEffect(() => {
    if (!state) return;
    if (state.ownedReforms.length > reformsCountAtStepStart) notifyReformPurchased();
  }, [state, reformsCountAtStepStart, notifyReformPurchased]);

  // JIT tips only ever evaluate once the scripted opening has released control (or was
  // skipped), and only when nothing else is already being shown — first predicate match in
  // declaration order, one-time per id.
  useEffect(() => {
    if (!jitEnabled || scriptedStep || activeTipId || !state || !content || !initialZone) return;
    const tip = JIT_TIPS.find((t) => !seenTips.includes(t.id) && t.predicate(state, content, { initialZone }));
    if (tip) showTip(tip.id);
  }, [jitEnabled, scriptedStep, activeTipId, state, content, initialZone, seenTips, showTip]);

  const active = scriptedStep ? (SCRIPTED_STEPS.find((s) => s.id === scriptedStep) ?? null) : null;
  const activeTip = !active && activeTipId ? (JIT_TIPS.find((t) => t.id === activeTipId) ?? null) : null;
  const anchor = active?.anchor ?? activeTip?.anchor ?? null;
  const rect = useAnchorRect(anchor);

  // Esc/back closes the current step or tip, same as pressing "Дальше" — capture phase so it
  // wins over screen-level Esc handlers (e.g. MainScreen closing the reforms panel) regardless
  // of effect mount ordering between sibling components.
  const dismissRef = useRef<() => void>(() => {});
  dismissRef.current = () => {
    if (active && !active.advanceOn) advanceScripted();
    else if (activeTip) dismissActiveTip();
  };
  useEffect(() => {
    if (!active && !activeTip) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      dismissRef.current();
    }
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [active, activeTip]);

  if (!active && !activeTip) return null;

  const text = active ? loc(active.text, lang) : activeTip ? loc(activeTip.text, lang) : '';
  const showNext = !!active && !active.advanceOn;

  return (
    <>
      <Spotlight rect={rect} />
      <AdvisorPanel
        rect={rect}
        advisorLabel={ui.tutorial.advisorLabel}
        text={text}
        primaryLabel={showNext || !!activeTip ? ui.tutorial.next : undefined}
        onPrimary={showNext ? advanceScripted : activeTip ? dismissActiveTip : undefined}
        skipLabel={active ? ui.tutorial.skip : undefined}
        onSkip={active ? skip : undefined}
      />
    </>
  );
}

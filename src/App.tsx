import { useGameStore } from './store/gameStore';
import { MenuScreen } from './ui/screens/MenuScreen';
import { MainScreen } from './ui/screens/MainScreen';
import { GameOverScreen } from './ui/screens/GameOverScreen';
import { InterTermScreen } from './ui/screens/InterTermScreen';
import { LangSwitcher } from './ui/components/LangSwitcher';

export function App() {
  const phase = useGameStore((s) => s.phase);
  return (
    <div className="relative mx-auto min-h-dvh max-w-150 px-3 py-4">
      {phase === 'menu' && <MenuScreen />}
      {phase === 'playing' && <MainScreen />}
      {phase === 'interTerm' && <InterTermScreen />}
      {phase === 'over' && <GameOverScreen />}
      {/* Global top-right language selector. z-auto keeps it under the reforms/event overlays. */}
      <LangSwitcher className="absolute right-3 top-3" />
    </div>
  );
}

import { lazy, Suspense } from 'react';
import { useGameStore } from './store/gameStore';
import { useUi } from './store/langStore';
import { MenuScreen } from './ui/screens/MenuScreen';
import { MainScreen } from './ui/screens/MainScreen';
import { GameOverScreen } from './ui/screens/GameOverScreen';
import { InterTermScreen } from './ui/screens/InterTermScreen';
import { SettingsScreen } from './ui/screens/SettingsScreen';
import { OrientationGate } from './ui/components/OrientationGate';
import { TutorialOverlay } from './ui/tutorial/TutorialOverlay';

// react-simple-maps + the vendored TopoJSON are heavy; split them into their own
// chunk so the menu/gameplay screens (the common path) load fast.
const MapScreen = lazy(() => import('./ui/screens/MapScreen').then((m) => ({ default: m.MapScreen })));

function MapScreenFallback() {
  const ui = useUi();
  return <p className="mt-8 text-center text-sm text-(--text-faint)">{ui.map.loading}</p>;
}

export function App() {
  const phase = useGameStore((s) => s.phase);
  return (
    <>
      {/* Phone-landscape/tablet: unconstrained width, the screens themselves fill the
          viewport. Desktop: centered canvas on the --ink backdrop, not stretched edge-to-edge. */}
      <div className="safe-area-x relative mx-auto flex min-h-dvh flex-col py-1 tablet:py-3 desktop:max-w-[1150px] desktop:py-6">
        {phase === 'menu' && <MenuScreen />}
        {phase === 'map' && (
          <Suspense fallback={<MapScreenFallback />}>
            <MapScreen />
          </Suspense>
        )}
        {phase === 'settings' && <SettingsScreen />}
        {phase === 'playing' && <MainScreen />}
        {phase === 'interTerm' && <InterTermScreen />}
        {phase === 'over' && <GameOverScreen />}
      </div>
      <TutorialOverlay />
      <OrientationGate />
    </>
  );
}

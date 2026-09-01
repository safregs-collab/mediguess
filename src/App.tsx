import { useEffect, useState, lazy, Suspense } from 'react';
import { useGameStore } from './shared/store/gameStore';
import { Header } from './shared/components/Header';
import { HomeScreen } from './features/home';
import { GameBoard } from './features/games/components/GameBoard';
import { ArchiveGrid } from './features/games/components/ArchiveGrid';
import { ProfessionScreen } from './features/games/components/ProfessionScreen';
import { ProfessionModeScreen } from './features/games/components/ProfessionModeScreen';
import { SimulatorBoard } from './features/games/components/SimulatorBoard';
import { StatsModal } from './shared/components/StatsModal';
import { HowToModal } from './shared/components/HowToModal';
import { ToastContainer } from './shared/components/ToastContainer';
import { Confetti } from './shared/components/Confetti';
import { MetaSkeleton } from './shared/components/skeletons/MetaSkeleton';
import { GameBoardSkeleton } from './shared/components/skeletons/GameBoardSkeleton';
import { OnboardingTour } from './shared/components/OnboardingTour';
import { ErrorBoundary } from './features/meta';
import { I18nProvider } from './features/meta/i18n';

const MetaZonePage = lazy(() => import('./features/meta/components/MetaZonePage').then(m => ({ default: m.MetaZonePage })));

function isMetaZonePath(): boolean {
  const path = window.location.pathname;
  const search = window.location.search;
  return path.includes('medical-meta-zone') || search.includes('noso=');
}

export function App() {
  const [isMetaZoneRoute] = useState(() => isMetaZonePath());
  const { init, loading, currentMode, currentScreen } = useGameStore();

  useEffect(() => {
    if (!isMetaZoneRoute) init();
  }, [init, isMetaZoneRoute]);

  if (isMetaZoneRoute) {
    return (
      <I18nProvider>
        <ErrorBoundary>
          <Suspense fallback={<MetaSkeleton />}><MetaZonePage /></Suspense>
        </ErrorBoundary>
      </I18nProvider>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--primary)' }}>
        <GameBoardSkeleton />
      </div>
    );
  }

  if (currentScreen === 'home') return <I18nProvider><HomeScreen /></I18nProvider>;
  if (currentScreen === 'metaZone') return (
    <I18nProvider>
      <ErrorBoundary>
        <Suspense fallback={<MetaSkeleton />}><MetaZonePage /></Suspense>
      </ErrorBoundary>
    </I18nProvider>
  );
  if (currentMode === 'professionSelect') return <I18nProvider><ProfessionScreen key='professionSelect' /></I18nProvider>;
  if (currentMode === 'specialtySelect') return <I18nProvider><ProfessionModeScreen key='specialtySelect' /></I18nProvider>;

  return (
    <I18nProvider>
      <>
        <Header />
        <div className='disclaimer'>
          <span>⚠️</span>
          <span>Не используйте для самодиагностики.</span>
        </div>
        <main>
          {(currentMode === 'daily' || currentMode === 'endless') && <GameBoard key={currentMode} />}
          {currentMode === 'simulator' && <SimulatorBoard key='simulator' />}
          {currentMode === 'archive' && <ArchiveGrid />}
        </main>
        <footer>
          <p>DOCW © 2026 — Игровая медицинская платформа</p>
        </footer>
        <StatsModal /><HowToModal /><ToastContainer /><Confetti /><OnboardingTour />
      </>
    </I18nProvider>
  );
}

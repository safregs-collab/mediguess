import { useEffect } from 'react';
import { useGameStore } from './shared/store/gameStore';
import { Header } from './shared/components/Header';
import { HomeScreen } from './features/home/HomeScreen';
import { GameBoard } from './features/games/components/GameBoard';
import { ArchiveGrid } from './features/games/components/ArchiveGrid';
import { RoleplayBoard } from './features/games/components/RoleplayBoard';
import { RoleplayArchive } from './features/games/components/RoleplayArchive';
import { SimulationBoard } from './features/games/components/SimulationBoard';
import { StatsModal } from './shared/components/StatsModal';
import { HowToModal } from './shared/components/HowToModal';
import { ToastContainer } from './shared/components/ToastContainer';
import { Confetti } from './shared/components/Confetti';
import { OnboardingTour } from './shared/components/OnboardingTour';

export function App() {
  const { init, loading, currentMode, currentScreen } = useGameStore();

  useEffect(() => {
    init();
  }, [init]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--primary)' }}>
        <span style={{ fontWeight: 700 }}>Загрузка кейсов…</span>
      </div>
    );
  }

  if (currentScreen === 'home') {
    return <HomeScreen />;
  }

  return (
    <>
      <Header />
      <div className="disclaimer">
        <span>⚠️</span>
        <span>MediGuess — образовательная игра. Не используйте для самодиагностики или самолечения. При симптомах обращайтесь к врачу.</span>
      </div>
      <main>
        {currentMode === 'daily' && <GameBoard mode="daily" key="daily" />}
        {currentMode === 'endless' && <GameBoard mode="endless" key="endless" />}
        {currentMode === 'archive' && <ArchiveGrid />}
        {currentMode === 'roleplay' && <RoleplayBoard key="roleplay" />}
        {currentMode === 'roleplayArchive' && <RoleplayArchive />}
        {currentMode === 'simulation' && <SimulationBoard key="simulation" />}
      </main>
      <footer>
        <p>MediGuess © 2026 — Образовательная медицинская игра</p>
        <p>Информация предоставлена исключительно в образовательных целях.</p>
        <div className="age-warning">🔞 16+ Медицинский контент</div>
      </footer>
      <StatsModal />
      <HowToModal />
      <ToastContainer />
      <Confetti />
      <OnboardingTour />
    </>
  );
}

import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Header } from './Header';
import { GameBoard } from './GameBoard';
import { ArchiveGrid } from './ArchiveGrid';
import { RoleplayBoard } from './RoleplayBoard';
import { RoleplayArchive } from './RoleplayArchive';
import { SimulationBoard } from './SimulationBoard';
import { StatsModal } from './StatsModal';
import { HowToModal } from './HowToModal';
import { ToastContainer } from './ToastContainer';
import { Confetti } from './Confetti';

export function App() {
  const { init, loading, currentMode } = useGameStore();

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
    </>
  );
}

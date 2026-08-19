import { useEffect, useState, useCallback } from 'react';

interface TourStep {
  title: string;
  content: string;
  emoji: string;
  targetSelector?: string;
  position?: 'top' | 'center' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Добро пожаловать в MediGuess!',
    content: 'Тренажёр диагностики на реальных клинических кейсах. Вы будете читать жалобы пациента, анализировать подсказки и ставить диагноз — как настоящий врач.',
    emoji: '🩺',
    position: 'center',
  },
  {
    title: 'Выберите режим',
    content: '📅 Ежедневный — один кейс в день, серия побед.\n♾️ Бесконечный — тренируйтесь без ограничений.\n🎭 Ролевой — играйте за медсестру, интерна или хирурга.\n🏥 Симулятор — полноценный приём пациента.',
    emoji: '🎮',
    targetSelector: 'nav',
    position: 'bottom',
  },
  {
    title: 'Угадайте диагноз',
    content: 'У вас 6 попыток. После каждой неправильной открывается новая подсказка — от общих симптомов к конкретным лабораторным данным.',
    emoji: '🧩',
    targetSelector: '.game-card',
    position: 'top',
  },
  {
    title: 'Вводите диагноз',
    content: 'Начните печатать — появится автодополнение. Система понимает синонимы и разные варианты названия диагноза.',
    emoji: '⌨️',
    targetSelector: '.diagnosis-input',
    position: 'bottom',
  },
  {
    title: 'Архив кейсов',
    content: 'В архиве отслеживается прогресс по каждому режиму: пройденные ✅ и непройденные ⬜ кейсы. Можно повторить любой кейс для закрепления.',
    emoji: '📚',
    targetSelector: '.nav-tab:nth-child(3)',
    position: 'bottom',
  },
  {
    title: 'Следите за ростом',
    content: 'Серия побед, распределение попыток, прогресс по специальностям и ролям — вся статистика всегда под рукой.',
    emoji: '📊',
    targetSelector: '.streak-badge',
    position: 'bottom',
  },
];

const ONBOARDING_KEY = 'mediguess_onboarding_v1';

export function isOnboardingSeen(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === '1';
  } catch {
    return true;
  }
}

export function markOnboardingSeen(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, '1');
  } catch {
    // ignore
  }
}

export function resetOnboarding(): void {
  try {
    localStorage.removeItem(ONBOARDING_KEY);
  } catch {
    // ignore
  }
}

export function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(!isOnboardingSeen());
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = TOUR_STEPS[step];

  const updateTarget = useCallback(() => {
    if (!currentStep.targetSelector) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
      el.classList.add('onboarding-highlight');
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!visible) return;
    // Remove old highlights
    document.querySelectorAll('.onboarding-highlight').forEach((el) => {
      el.classList.remove('onboarding-highlight');
    });
    const timer = setTimeout(updateTarget, 100);
    return () => {
      clearTimeout(timer);
      document.querySelectorAll('.onboarding-highlight').forEach((el) => {
        el.classList.remove('onboarding-highlight');
      });
    };
  }, [visible, step, updateTarget]);

  useEffect(() => {
    const onResize = () => updateTarget();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [updateTarget]);

  if (!visible) return null;

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      markOnboardingSeen();
      setVisible(false);
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = () => {
    markOnboardingSeen();
    setVisible(false);
  };

  // Compute tooltip position
  let tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 10001,
    maxWidth: '360px',
    width: '90%',
  };

  if (currentStep.position === 'center' || !targetRect) {
    tooltipStyle = {
      ...tooltipStyle,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  } else if (currentStep.position === 'bottom') {
    tooltipStyle = {
      ...tooltipStyle,
      top: targetRect.bottom + 16,
      left: Math.min(targetRect.left + targetRect.width / 2, window.innerWidth - 200),
      transform: 'translateX(-50%)',
    };
  } else if (currentStep.position === 'top') {
    tooltipStyle = {
      ...tooltipStyle,
      bottom: window.innerHeight - targetRect.top + 16,
      left: Math.min(targetRect.left + targetRect.width / 2, window.innerWidth - 200),
      transform: 'translateX(-50%)',
    };
  } else if (currentStep.position === 'left') {
    tooltipStyle = {
      ...tooltipStyle,
      top: targetRect.top + targetRect.height / 2,
      right: window.innerWidth - targetRect.left + 16,
      transform: 'translateY(-50%)',
    };
  } else if (currentStep.position === 'right') {
    tooltipStyle = {
      ...tooltipStyle,
      top: targetRect.top + targetRect.height / 2,
      left: targetRect.right + 16,
      transform: 'translateY(-50%)',
    };
  }

  // Clamp tooltip to viewport
  if (typeof tooltipStyle.top === 'number' && tooltipStyle.top < 10) {
    tooltipStyle.top = 10;
  }
  if (typeof tooltipStyle.bottom === 'number' && tooltipStyle.bottom < 10) {
    tooltipStyle.bottom = 10;
  }

  return (
    <div className="onboarding-overlay">
      {/* Spotlight cutout */}
      {targetRect && (
        <>
          <div className="onboarding-spotlight onboarding-spotlight-top" style={{ height: targetRect.top }} />
          <div
            className="onboarding-spotlight onboarding-spotlight-bottom"
            style={{ top: targetRect.bottom }}
          />
          <div
            className="onboarding-spotlight onboarding-spotlight-left"
            style={{ top: targetRect.top, height: targetRect.height, width: targetRect.left }}
          />
          <div
            className="onboarding-spotlight onboarding-spotlight-right"
            style={{ top: targetRect.top, height: targetRect.height, left: targetRect.right }}
          />
        </>
      )}

      {/* Tooltip */}
      <div className="onboarding-tooltip" style={tooltipStyle}>
        <div className="onboarding-tooltip-header">
          <span className="onboarding-emoji">{currentStep.emoji}</span>
          <h3 className="onboarding-tooltip-title">{currentStep.title}</h3>
        </div>
        <div className="onboarding-tooltip-body">
          {currentStep.content.split('\n').map((line, i) => (
            <p key={i} className="onboarding-tooltip-line">{line}</p>
          ))}
        </div>
        <div className="onboarding-tooltip-footer">
          <div className="onboarding-dots">
            {TOUR_STEPS.map((_, i) => (
              <span key={i} className={`onboarding-dot${i === step ? ' active' : ''}`} />
            ))}
          </div>
          <div className="onboarding-actions">
            {step > 0 ? (
              <button className="onboarding-btn onboarding-btn-secondary" onClick={handlePrev}>
                Назад
              </button>
            ) : (
              <button className="onboarding-btn onboarding-btn-secondary" onClick={handleSkip}>
                Пропустить
              </button>
            )}
            <button className="onboarding-btn onboarding-btn-primary" onClick={handleNext}>
              {step === TOUR_STEPS.length - 1 ? 'Начать игру 🚀' : `Далее (${step + 1}/${TOUR_STEPS.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



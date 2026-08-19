import { useState, useRef, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { normalize } from '../../lib/gameLogic';
import { getAllDiagnoses } from '../../data/cases';

interface Props {
  mode: 'daily' | 'endless' | 'roleplay';
  disabled: boolean;
}

export function DiagnosisInput({ mode, disabled }: Props) {
  const { makeGuess, makeRoleplayGuess } = useGameStore();
  const [value, setValue] = useState('');
  const [matches, setMatches] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const diagnoses = getAllDiagnoses();

  const handleInput = useCallback((val: string) => {
    setValue(val);
    setSelectedIdx(-1);
    if (val.trim().length < 2) {
      setMatches([]);
      return;
    }
    const norm = normalize(val);
    const m = diagnoses.filter(d => normalize(d).includes(norm));
    setMatches(m.slice(0, 8));
  }, [diagnoses]);

  const submit = () => {
    if (!value.trim()) {
      inputRef.current?.classList.add('shake');
      setTimeout(() => inputRef.current?.classList.remove('shake'), 400);
      return;
    }
    if (mode === 'roleplay') {
      makeRoleplayGuess(value);
    } else {
      makeGuess(mode, value);
    }
    setValue('');
    setMatches([]);
    setSelectedIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIdx >= 0 && matches[selectedIdx]) {
        setValue(matches[selectedIdx]);
        setMatches([]);
        setSelectedIdx(-1);
      } else {
        submit();
      }
    } else if (e.key === 'Escape') {
      setMatches([]);
    }
  };

  return (
    <div className="input-area">
      <input
        ref={inputRef}
        type="text"
        className="diagnosis-input"
        placeholder="Введите диагноз..."
        autoComplete="off"
        disabled={disabled}
        value={value}
        onChange={e => handleInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {matches.length > 0 && (
        <div className="autocomplete-list visible">
          {matches.map((m, i) => (
            <div
              key={m}
              className={`autocomplete-item${i === selectedIdx ? ' selected' : ''}`}
              onMouseDown={e => {
                e.preventDefault();
                setValue(m);
                setMatches([]);
                inputRef.current?.focus();
              }}
            >
              {m}
            </div>
          ))}
        </div>
      )}
      <button className="btn-primary" onClick={submit} disabled={disabled}>
        🔍 Проверить диагноз
      </button>
    </div>
  );
}

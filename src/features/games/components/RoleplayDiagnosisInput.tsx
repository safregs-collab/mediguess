import { useRef, useState, useCallback } from 'react';
import { useGameStore } from '../../../shared/store/gameStore';
import { normalize } from '../logic/gameLogic';
import { getAllRoleplayDiagnoses } from '../logic/roleplayCases';

interface Props {
  disabled: boolean;
}

export function RoleplayDiagnosisInput({ disabled }: Props) {
  const { checkRoleplayDiagnosis, selectedAutocomplete, setSelectedAutocomplete, currentMatches, setCurrentMatches, showToast } = useGameStore();
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInput = useCallback((val: string) => {
    setValue(val);
    setSelectedAutocomplete(-1);
    if (val.trim().length < 2) {
      setCurrentMatches([]);
      return;
    }
    const norm = normalize(val);
    const matches = getAllRoleplayDiagnoses().filter((d) => normalize(d).includes(norm));
    setCurrentMatches(matches);
  }, [setSelectedAutocomplete, setCurrentMatches]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (currentMatches.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedAutocomplete(Math.min(selectedAutocomplete + 1, currentMatches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedAutocomplete(Math.max(selectedAutocomplete - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedAutocomplete >= 0 && currentMatches[selectedAutocomplete]) {
        setValue(currentMatches[selectedAutocomplete]);
        setCurrentMatches([]);
        setSelectedAutocomplete(-1);
        inputRef.current?.focus();
      } else {
        submit();
      }
    } else if (e.key === 'Escape') {
      setCurrentMatches([]);
    }
  };

  const submit = () => {
    if (!value.trim()) {
      inputRef.current?.classList.add('shake');
      setTimeout(() => inputRef.current?.classList.remove('shake'), 400);
      showToast('Введите диагноз');
      return;
    }
    checkRoleplayDiagnosis(value);
    setValue('');
    setCurrentMatches([]);
    setSelectedAutocomplete(-1);
  };

  return (
    <>
      <div className="input-area">
        <input
          ref={inputRef}
          type="text"
          className="diagnosis-input"
          placeholder="Введите диагноз..."
          autoComplete="off"
          disabled={disabled}
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {currentMatches.length > 0 && (
          <div className="autocomplete-list visible">
            {currentMatches.slice(0, 8).map((m, i) => (
              <div
                key={m}
                className={`autocomplete-item${i === selectedAutocomplete ? ' selected' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setValue(m);
                  setCurrentMatches([]);
                  inputRef.current?.focus();
                }}
              >
                {m}
              </div>
            ))}
          </div>
        )}
      </div>
      <button className="btn-primary" onClick={submit} disabled={disabled}>
        🔍 Проверить диагноз
      </button>
    </>
  );
}

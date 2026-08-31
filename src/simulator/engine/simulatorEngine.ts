import type { SimulatorScenario, SimStage, SimulatorState, SimulatorResult, SimHistoryEntry } from '../../professions/types';

export function initSimulator(scenario: SimulatorScenario): SimulatorState {
  const maxScore = { assessment: 0, action: 0, documentation: 0, communication: 0 };
  Object.values(scenario.stages).forEach((stage: SimStage) => {
    stage.options.forEach((opt) => {
      if (opt.score) {
        Object.entries(opt.score).forEach(([cat, val]) => {
          if (val && val > 0) maxScore[cat as keyof typeof maxScore] += val;
        });
      }
    });
  });
  const startStage = scenario.stages[scenario.startStage];
  return {
    scenario, currentStage: scenario.startStage,
    patient: JSON.parse(JSON.stringify(scenario.initialPatient)),
    inventory: [...scenario.inventory], selectedItems: [],
    score: { assessment: 0, action: 0, documentation: 0, communication: 0 },
    maxScore, history: [], startTime: Date.now(), elapsedSeconds: 0,
    stepsTaken: 0, totalSteps: countSteps(scenario),
    patientAlive: true, gameOver: false, timeLeft: startStage?.timeLimit ?? 0,
  };
}

export function countSteps(scenario: SimulatorScenario): number {
  const visited = new Set<string>();
  let count = 0;
  function dfs(stageId: string) {
    if (visited.has(stageId)) return;
    visited.add(stageId);
    const stage = scenario.stages[stageId];
    if (!stage || stage.final) return;
    count++;
    stage.options.forEach((opt) => { if (opt.nextStage) dfs(opt.nextStage); });
  }
  dfs(scenario.startStage);
  return count;
}

export function canSelectOption(state: SimulatorState, option: SimStage['options'][number]): boolean {
  if (!option.requires || option.requires.length === 0) return true;
  return option.requires.every((item) => state.selectedItems.includes(item));
}

export function updatePatientVitals(
  patient: SimulatorState['patient'],
  deltas: SimStage['options'][number]['patientEffect']
): SimulatorState['patient'] {
  if (!patient || !deltas) return patient;
  const updated = JSON.parse(JSON.stringify(patient)) as NonNullable<SimulatorState['patient']>;
  if (deltas.bp_sys !== undefined) updated.vitals.bp_sys = Math.max(0, updated.vitals.bp_sys + deltas.bp_sys);
  if (deltas.bp_dia !== undefined) updated.vitals.bp_dia = Math.max(0, updated.vitals.bp_dia + deltas.bp_dia);
  if (deltas.pulse !== undefined) updated.vitals.pulse = Math.max(0, updated.vitals.pulse + deltas.pulse);
  if (deltas.spo2 !== undefined) updated.vitals.spo2 = Math.min(100, Math.max(0, updated.vitals.spo2 + deltas.spo2));
  if (deltas.rr !== undefined) updated.vitals.rr = Math.max(0, updated.vitals.rr + deltas.rr);
  if (deltas.temp !== undefined) updated.vitals.temp = updated.vitals.temp + deltas.temp;
  if (deltas.pain !== undefined) updated.vitals.pain = Math.max(0, Math.min(10, updated.vitals.pain + deltas.pain));
  if (deltas.consciousness !== undefined) updated.consciousness = Math.max(0, Math.min(4, deltas.consciousness));
  if (deltas.consciousnessText !== undefined) updated.consciousnessText = deltas.consciousnessText;
  if (deltas.status !== undefined) updated.status = deltas.status;
  return updated;
}

export function selectOption(state: SimulatorState, optionIndex: number): SimulatorState {
  const scenario = state.scenario;
  if (!scenario) return state;
  const stage = scenario.stages[state.currentStage];
  if (!stage) return state;
  const option = stage.options[optionIndex];
  if (!option) return state;
  const newState = JSON.parse(JSON.stringify(state)) as SimulatorState;
  newState.stepsTaken++;
  if (option.score) {
    Object.entries(option.score).forEach(([cat, val]) => {
      if (val) newState.score[cat as keyof typeof newState.score] += val;
    });
  }
  if (option.patientEffect) {
    newState.patient = updatePatientVitals(newState.patient, option.patientEffect);
  }
  const entry: SimHistoryEntry = {
    stageTitle: stage.title, chosenText: option.text, correct: option.correct,
    score: option.score || {}, feedback: option.feedback, timestamp: Date.now(),
  };
  newState.history.push(entry);
  newState.currentStage = option.nextStage;
  const nextStage = scenario.stages[option.nextStage];
  if (nextStage?.final) {
    newState.gameOver = true;
    newState.patientAlive = nextStage.result !== 'death';
  }
  newState.timeLeft = nextStage?.timeLimit ?? 0;
  newState.elapsedSeconds = Math.floor((Date.now() - newState.startTime) / 1000);
  return newState;
}

export function autoSelectWorstOption(state: SimulatorState): number {
  const scenario = state.scenario;
  if (!scenario) return 0;
  const stage = scenario.stages[state.currentStage];
  if (!stage) return 0;
  let worstIndex = 0;
  let worstScore = Infinity;
  stage.options.forEach((opt, idx) => {
    let optionScore = 0;
    if (opt.correct) optionScore += 100;
    if (opt.score) {
      const total = Object.values(opt.score).reduce((a, b) => a + (b ?? 0), 0);
      optionScore += total * 10;
    }
    if (opt.patientEffect) {
      const p = opt.patientEffect;
      if (p.pulse !== undefined && p.pulse < 0) optionScore += p.pulse;
      if (p.bp_sys !== undefined && p.bp_sys < 0) optionScore += p.bp_sys;
      if (p.spo2 !== undefined && p.spo2 < 0) optionScore += p.spo2;
      if (p.status === 'critical') optionScore -= 50;
    }
    if (optionScore < worstScore) { worstScore = optionScore; worstIndex = idx; }
  });
  return worstIndex;
}

export function calculateResult(state: SimulatorState): SimulatorResult {
  const totalScore = Object.values(state.score).reduce((a, b) => a + b, 0);
  const maxTotalScore = Object.values(state.maxScore).reduce((a, b) => a + b, 0);
  const percent = maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 100) : 0;
  const categoryScores = {
    assessment: { value: state.score.assessment, max: state.maxScore.assessment, percent: state.maxScore.assessment > 0 ? Math.round((state.score.assessment / state.maxScore.assessment) * 100) : 0 },
    action: { value: state.score.action, max: state.maxScore.action, percent: state.maxScore.action > 0 ? Math.round((state.score.action / state.maxScore.action) * 100) : 0 },
    documentation: { value: state.score.documentation, max: state.maxScore.documentation, percent: state.maxScore.documentation > 0 ? Math.round((state.score.documentation / state.maxScore.documentation) * 100) : 0 },
    communication: { value: state.score.communication, max: state.maxScore.communication, percent: state.maxScore.communication > 0 ? Math.round((state.score.communication / state.maxScore.communication) * 100) : 0 },
  };
  const elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
  let resultType: SimulatorResult['resultType'] = 'needs-work';
  const currentStage = state.scenario?.stages[state.currentStage];
  if (!state.patientAlive || currentStage?.result === 'death') resultType = 'death';
  else if (percent >= 85) resultType = 'excellent';
  else if (percent >= 60) resultType = 'good';
  return { totalScore, maxTotalScore, percent, resultType, categoryScores, history: state.history, elapsedSeconds, learningOutcomes: state.scenario?.learningOutcomes || [] };
}

export function getAvailableOptions(state: SimulatorState) {
  const scenario = state.scenario;
  if (!scenario) return [];
  const stage = scenario.stages[state.currentStage];
  if (!stage) return [];
  return stage.options.map((opt, idx) => {
    const hasItems = canSelectOption(state, opt);
    return { option: opt, index: idx, disabled: !hasItems, reason: !hasItems ? `Требуется: ${opt.requires?.join(', ')}` : undefined };
  });
}

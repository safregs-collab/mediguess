import type {
  NodeScenario, NodeSimState, NodeSimResult, SimHistoryEntry,
  ScoreCategory, NodePatient, NodePatientVitals, SimulationNode, NodeOption
} from '../../../types/nodeSimulation';

// =============================================================================
// ИНИЦИАЛИЗАЦИЯ СЦЕНАРИЯ
// =============================================================================
export function initScenario(scenario: NodeScenario): NodeSimState {
  const maxScore: Record<ScoreCategory, number> = { diagnosis: 0, treatment: 0, docs: 0, comm: 0 };

  // Подсчет максимальных баллов по всем узлам
  Object.values(scenario.nodes).forEach((node: SimulationNode) => {
    node.options.forEach((opt: NodeOption) => {
      if (opt.effects.score) {
        (Object.keys(opt.effects.score) as ScoreCategory[]).forEach(cat => {
          const val = opt.effects.score![cat] ?? 0;
          if (val > 0) maxScore[cat] += val;
        });
      }
    });
  });

  return {
    scenario,
    currentNode: scenario.startNode,
    patient: JSON.parse(JSON.stringify(scenario.initialPatient)),
    inventory: [...scenario.inventory],
    selectedItems: [],
    score: { diagnosis: 0, treatment: 0, docs: 0, comm: 0 },
    maxScore,
    history: [],
    startTime: Date.now(),
    globalTimer: null,
    stepTimer: null,
    stepTimeLeft: scenario.nodes[scenario.startNode].timeLimit ?? 0,
    totalSteps: countSteps(scenario),
    stepsTaken: 0,
    patientAlive: true,
    gameOver: false,
    nextNode: null,
  };
}

// =============================================================================
// ПОДСЧЕТ ШАГОВ
// =============================================================================
export function countSteps(scenario: NodeScenario): number {
  const visited = new Set<string>();
  let count = 0;

  function dfs(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    const node = scenario.nodes[nodeId];
    if (!node || node.final) return;
    count++;
    node.options.forEach((opt: NodeOption) => {
      if (opt.effects.nextNode) dfs(opt.effects.nextNode);
    });
  }

  dfs(scenario.startNode);
  return count;
}

// =============================================================================
// ПРОВЕРКА ИНВЕНТАРЯ
// =============================================================================
export function checkInventory(state: NodeSimState, option: NodeOption): boolean {
  if (!option.requires || option.requires.length === 0) return true;
  return option.requires.every((item: string) => state.selectedItems.includes(item));
}

// =============================================================================
// ОБНОВЛЕНИЕ ВИТАЛЬНЫХ ПОКАЗАТЕЛЕЙ
// =============================================================================
export function updateVitals(patient: NodePatient, deltas: Partial<NodePatientVitals> & { consciousness?: number; consciousnessText?: string; status?: string }): NodePatient {
  const updated = JSON.parse(JSON.stringify(patient)) as NodePatient;

  if (deltas.bp_sys !== undefined) updated.vitals.bp_sys = Math.max(0, updated.vitals.bp_sys + deltas.bp_sys);
  if (deltas.bp_dia !== undefined) updated.vitals.bp_dia = Math.max(0, updated.vitals.bp_dia + deltas.bp_dia);
  if (deltas.pulse !== undefined) updated.vitals.pulse = Math.max(0, updated.vitals.pulse + deltas.pulse);
  if (deltas.spo2 !== undefined) updated.vitals.spo2 = Math.min(100, Math.max(0, updated.vitals.spo2 + deltas.spo2));
  if (deltas.rr !== undefined) updated.vitals.rr = Math.max(0, updated.vitals.rr + deltas.rr);
  if (deltas.temp !== undefined) updated.vitals.temp = updated.vitals.temp + deltas.temp;
  if (deltas.pain !== undefined) updated.vitals.pain = Math.max(0, Math.min(10, updated.vitals.pain + deltas.pain));

  if (deltas.consciousness !== undefined) updated.consciousness = Math.max(0, Math.min(4, deltas.consciousness)) as 0|1|2|3|4;
  if (deltas.consciousnessText !== undefined) updated.consciousnessText = deltas.consciousnessText;
  if (deltas.status !== undefined) updated.status = deltas.status as 'stable'|'warning'|'critical';

  return updated;
}

// =============================================================================
// ВЫБОР ВАРИАНТА
// =============================================================================
export function selectOption(state: NodeSimState, optionIndex: number): NodeSimState {
  const scenario = state.scenario!;
  const node = scenario.nodes[state.currentNode];
  const option = node.options[optionIndex];

  if (!option) return state;

  const newState = JSON.parse(JSON.stringify(state)) as NodeSimState;
  newState.stepsTaken++;

  // Применение score
  if (option.effects.score) {
    (Object.keys(option.effects.score) as ScoreCategory[]).forEach(cat => {
      const val = option.effects.score![cat] ?? 0;
      newState.score[cat] += val;
    });
  }

  // Применение эффектов на пациента
  if (option.effects.patient) {
    newState.patient = updateVitals(newState.patient, option.effects.patient);
  }

  // Запись в журнал
  if (option.effects.log) {
    const entry: SimHistoryEntry = {
      nodeTitle: node.title,
      chosenText: option.text,
      correct: option.correct,
      score: option.effects.score || {},
      feedback: option.feedback,
    };
    newState.history.push(entry);
  }

  // Переход к следующему узлу
  newState.currentNode = option.effects.nextNode;
  newState.nextNode = option.effects.nextNode;

  // Проверка финального узла
  const nextNode = scenario.nodes[option.effects.nextNode];
  if (nextNode?.final) {
    newState.gameOver = true;
    newState.patientAlive = nextNode.result !== 'death';
  }

  // Обновление таймера
  const nextNodeObj = scenario.nodes[option.effects.nextNode];
  newState.stepTimeLeft = nextNodeObj?.timeLimit ?? 0;

  return newState;
}

// =============================================================================
// АВТОВЫБОР ХУДШЕГО ВАРИАНТА (при истечении времени)
// =============================================================================
export function autoSelectWorstOption(state: NodeSimState): number {
  const scenario = state.scenario!;
  const node = scenario.nodes[state.currentNode];

  // Находим худший вариант: некорректный с наибольшим уроном пациенту
  let worstIndex = 0;
  let worstScore = Infinity;

  node.options.forEach((opt: NodeOption, idx: number) => {
    let optionScore = 0;
    if (opt.correct) optionScore += 100;
    if (opt.effects.score) {
      const total = Object.values(opt.effects.score).reduce((a: number, b: unknown) => a + ((b as number) ?? 0), 0);
      optionScore += total * 10;
    }
    if (opt.effects.patient) {
      const p = opt.effects.patient;
      if (p.pulse !== undefined && p.pulse < 0) optionScore += p.pulse;
      if (p.bp_sys !== undefined && p.bp_sys < 0) optionScore += p.bp_sys;
      if (p.spo2 !== undefined && p.spo2 < 0) optionScore += p.spo2;
      if (p.status === 'critical') optionScore -= 50;
    }

    if (optionScore < worstScore) {
      worstScore = optionScore;
      worstIndex = idx;
    }
  });

  return worstIndex;
}

// =============================================================================
// ПОДСЧЕТ ИТОГОВОГО РЕЗУЛЬТАТА
// =============================================================================
export function calculateFinalScore(state: NodeSimState): NodeSimResult {
  const totalScore = Object.values(state.score).reduce((a: number, b: unknown) => a + (b as number), 0);
  const maxTotalScore = Object.values(state.maxScore).reduce((a: number, b: unknown) => a + (b as number), 0);
  const percent = (maxTotalScore as number) > 0 ? Math.round(((totalScore as number) / (maxTotalScore as number)) * 100) : 0;

  const categoryScores = {
    diagnosis: { value: state.score.diagnosis, max: state.maxScore.diagnosis, percent: state.maxScore.diagnosis > 0 ? Math.round((state.score.diagnosis / state.maxScore.diagnosis) * 100) : 0 },
    treatment: { value: state.score.treatment, max: state.maxScore.treatment, percent: state.maxScore.treatment > 0 ? Math.round((state.score.treatment / state.maxScore.treatment) * 100) : 0 },
    docs: { value: state.score.docs, max: state.maxScore.docs, percent: state.maxScore.docs > 0 ? Math.round((state.score.docs / state.maxScore.docs) * 100) : 0 },
    comm: { value: state.score.comm, max: state.maxScore.comm, percent: state.maxScore.comm > 0 ? Math.round((state.score.comm / state.maxScore.comm) * 100) : 0 },
  };

  const elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);

  // Определение результата
  let resultType = state.scenario!.nodes[state.currentNode]?.result ?? 'poor';
  if (!state.patientAlive) resultType = 'death';

  return {
    totalScore,
    maxTotalScore,
    percent,
    resultType,
    categoryScores,
    history: state.history,
    elapsedSeconds,
  };
}

// =============================================================================
// ФИЛЬТРАЦИЯ СЦЕНАРИЕВ ПО РОЛИ
// =============================================================================
export function filterScenariosByRole(scenarios: NodeScenario[], role: 'nurse' | 'doctor' | 'both'): NodeScenario[] {
  if (role === 'both') return scenarios;
  return scenarios.filter(s => s.role === role || s.role === 'both');
}

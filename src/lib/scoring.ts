import type { SimulatorCase, SimulatorState } from '../types';

export function calculateSimulatorScore(
  scenario: SimulatorCase,
  state: Pick<SimulatorState, 'selectedTests' | 'diagnosisInput' | 'treatmentInput'>
): SimulatorState['score'] {
  const { availableTests, correctDiagnosis, correctTreatment } = scenario;

  const keyTests = availableTests.filter(t => t.results.some(r => r.isAbnormal));
  const keyTestIds = new Set(keyTests.map(t => t.id));
  const selectedSet = new Set(state.selectedTests);

  const missedKeyTests = Array.from(keyTestIds).filter(id => !selectedSet.has(id)).length;
  const unnecessaryTests = state.selectedTests.filter(id => !keyTestIds.has(id)).length;

  const normDiag = state.diagnosisInput.trim().toLowerCase();
  const diagnosisCorrect = correctDiagnosis.some(d => d.toLowerCase() === normDiag);

  const normTreat = state.treatmentInput.trim().toLowerCase();
  const drugNames = correctTreatment.drugs.map(d => d.name.toLowerCase());
  const procedureNames = (correctTreatment.procedures || []).map(p => p.toLowerCase());
  const allTreatments = [...drugNames, ...procedureNames];
  const treatmentCorrect = allTreatments.length > 0 && allTreatments.some(t => normTreat.includes(t));

  let total = 0;
  if (diagnosisCorrect) total += 40;
  if (treatmentCorrect) total += 40;
  total += Math.max(0, 20 - missedKeyTests * 5 - unnecessaryTests * 3);

  return {
    total: Math.min(100, total),
    diagnosisCorrect,
    treatmentCorrect,
    missedKeyTests,
    unnecessaryTests,
  };
}

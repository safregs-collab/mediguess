import type { SimulatorScenario, Profession } from './types';
import nurseScenarios from './nurse/simulations';
import paramedicScenarios from './paramedic/simulations';
import doctorScenarios from './doctor/simulations';

export const ALL_SIMULATIONS: Record<Profession, SimulatorScenario[]> = {
  nurse: nurseScenarios,
  paramedic: paramedicScenarios,
  doctor: doctorScenarios,
};

export function getSimulationsByProfession(profession: Profession): SimulatorScenario[] {
  return ALL_SIMULATIONS[profession] || [];
}

export function getSimulationById(id: string): SimulatorScenario | undefined {
  return Object.values(ALL_SIMULATIONS).flat().find((s) => s.id === id);
}

export { nurseScenarios, paramedicScenarios, doctorScenarios };
export * from './types';

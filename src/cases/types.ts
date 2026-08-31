import type { Profession, Specialty, MetaCaseRef } from '../types';

export interface ProfessionalCase {
  id: string;
  profession: Profession;
  specialty: Specialty;
  specialtyName: string;
  difficulty: 1 | 2 | 3;
  title: string;
  diagnosis: string[];
  clues: string[];
  explanation: string;
  source: 'cr' | 'manual';
  crRef?: { number: number; version: number; url: string; section: string };
  metaRef?: MetaCaseRef;
  patient?: { name?: string; age?: number; gender?: 'male' | 'female'; occupation?: string };
  taskType?: 'recognize' | 'diagnose' | 'full-cycle';
  answerType?: 'single' | 'multiple' | 'freetext';
  hints?: string[];
  skills?: string[];
  evidence?: { udd?: string; uur?: string; crSection?: string };
}

export interface CaseGenerationConfig {
  count: number;
  difficulty?: 1 | 2 | 3;
  seed?: string;
  professions?: Profession[];
}

export interface GeneratedCaseSet {
  nurse: ProfessionalCase[];
  paramedic: ProfessionalCase[];
  doctor: ProfessionalCase[];
}

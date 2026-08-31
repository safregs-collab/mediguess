import type { ExtractedSection, ExtractedCr } from './pdfExtractor';

export interface ParsedClinicalPicture {
  complaints: Array<{
    text: string;
    severity: 'mild' | 'moderate' | 'severe' | 'variable';
    frequency: 'always' | 'often' | 'sometimes' | 'rare';
    typical: boolean;
  }>;
  anamnesis: Array<{
    category: 'risk_factor' | 'comorbidity' | 'medication' | 'lifestyle' | 'family';
    label: string;
    weight: number;
  }>;
  physicalExam: Array<{
    label: string;
    typical: boolean;
    severity?: 'mild' | 'moderate' | 'severe';
  }>;
}

export interface ParsedDiagnostics {
  lab: Array<{
    name: string;
    unit: string;
    normalRange: { min?: number; max?: number; text?: string };
  }>;
  instrumental: Array<{
    name: string;
    modality: string;
  }>;
  criteria: Array<{
    label: string;
    required: boolean;
    weight: number;
  }>;
}

export interface ParsedTreatment {
  emergency: Array<{ label: string; description: string; priority: number }>;
  therapy: Array<{ label: string; description: string; priority: number }>;
  surgery: Array<{ label: string; description: string; priority: number }>;
}

export interface ParsedDifferential {
  label: string;
  mkb10: string[];
  keyDifferences: string[];
}

export interface ParsedCr {
  clinicalPicture: ParsedClinicalPicture;
  diagnostics: ParsedDiagnostics;
  differential: ParsedDifferential[];
  treatment: ParsedTreatment;
}

export function parseCrNlp(extracted: ExtractedCr): ParsedCr {
  const clinicalPicture = parseClinicalPicture(extracted);
  const diagnostics = parseDiagnostics(extracted);
  const differential = parseDifferential(extracted);
  const treatment = parseTreatment(extracted);

  return {
    clinicalPicture,
    diagnostics,
    differential,
    treatment,
  };
}

function parseClinicalPicture(extracted: ExtractedCr): ParsedClinicalPicture {
  const complaints: ParsedClinicalPicture['complaints'] = [];
  const anamnesis: ParsedClinicalPicture['anamnesis'] = [];
  const physicalExam: ParsedClinicalPicture['physicalExam'] = [];

  const complaintsSection = extracted.sections.find(s => 
    s.title.includes('КЛИНИЧЕСКАЯ') || s.title.includes('ЖАЛОБЫ')
  );

  if (complaintsSection) {
    const lines = complaintsSection.content.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length < 5) continue;
      
      // Detect severity
      let severity: ParsedClinicalPicture['complaints'][0]['severity'] = 'moderate';
      if (/сильн|тяжел|остр|резк/i.test(trimmed)) severity = 'severe';
      else if (/слаб|легк|незнач/i.test(trimmed)) severity = 'mild';
      else if (/перемен|возможн/i.test(trimmed)) severity = 'variable';

      // Detect frequency
      let frequency: ParsedClinicalPicture['complaints'][0]['frequency'] = 'sometimes';
      if (/постоянн|всегд/i.test(trimmed)) frequency = 'always';
      else if (/часто|обычн/i.test(trimmed)) frequency = 'often';
      else if (/редк|иногд/i.test(trimmed)) frequency = 'rare';

      complaints.push({
        text: trimmed,
        severity,
        frequency,
        typical: !/редк|атипич|нестандарт/i.test(trimmed),
      });
    }
  }

  // Risk factors from anamnesis section
  const anamnesisSection = extracted.sections.find(s => s.title.includes('АНАМНЕЗ'));
  if (anamnesisSection) {
    const riskKeywords = ['курен', 'алкогол', 'гипертенз', 'сахарный диабет', 'ожирен', 'малоподвиж', 'наследствен'];
    const lines = anamnesisSection.content.split('\n').filter(l => l.trim().length > 3);
    for (const line of lines) {
      const trimmed = line.trim();
      const matchedRisk = riskKeywords.find(kw => trimmed.toLowerCase().includes(kw));
      if (matchedRisk) {
        anamnesis.push({
          category: matchedRisk === 'наследствен' ? 'family' : 'risk_factor',
          label: trimmed,
          weight: 0.7,
        });
      }
    }
  }

  // Physical exam findings
  const examSection = extracted.sections.find(s => s.title.includes('ФИЗИКАЛЬНОЕ'));
  if (examSection) {
    const lines = examSection.content.split('\n').filter(l => l.trim().length > 3);
    for (const line of lines) {
      physicalExam.push({
        label: line.trim(),
        typical: true,
      });
    }
  }

  return { complaints, anamnesis, physicalExam };
}

function parseDiagnostics(extracted: ExtractedCr): ParsedDiagnostics {
  const lab: ParsedDiagnostics['lab'] = [];
  const instrumental: ParsedDiagnostics['instrumental'] = [];
  const criteria: ParsedDiagnostics['criteria'] = [];

  const diagSection = extracted.sections.find(s => 
    s.title.includes('ДИАГНОСТИКА') || s.title.includes('ЛАБОРАТОРНАЯ')
  );

  if (diagSection) {
    const lines = diagSection.content.split('\n').filter(l => l.trim().length > 3);
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Lab tests with units
      const labMatch = trimmed.match(/([А-Яа-яA-Za-z\s\-]+)\s*[\(\[]?\s*(\d+[\.,]?\d*)\s*([А-Яа-яA-Za-z/%µ]+)\s*[\)\]]?/i);
      if (labMatch && !instrumental.some(i => i.name === labMatch[1].trim())) {
        lab.push({
          name: labMatch[1].trim(),
          unit: labMatch[3] || '',
          normalRange: { text: labMatch[2] || '' },
        });
      }

      // Instrumental methods
      const instKeywords = ['ЭКГ', 'рентген', 'КТ', 'МРТ', 'УЗИ', 'эхо', 'ангиограф', 'фиброгастроскоп', 'ФГДС', 'спирограф'];
      for (const kw of instKeywords) {
        if (trimmed.toUpperCase().includes(kw)) {
          instrumental.push({
            name: trimmed,
            modality: kw,
          });
        }
      }
    }
  }

  return { lab, instrumental, criteria };
}

function parseDifferential(extracted: ExtractedCr): ParsedDifferential[] {
  const differential: ParsedDifferential[] = [];

  const diffSection = extracted.sections.find(s => s.title.includes('ДИФФЕРЕНЦИАЛЬНЫЙ'));
  if (diffSection) {
    const lines = diffSection.content.split('\n').filter(l => l.trim().length > 5);
    for (const line of lines) {
      const trimmed = line.trim();
      const mkbMatches = trimmed.match(/[A-Z]\d{2}(?:\.\d{1,2})?/g) || [];
      differential.push({
        label: trimmed.replace(/[A-Z]\d{2}(?:\.\d{1,2})?/g, '').trim(),
        mkb10: [...new Set(mkbMatches)],
        keyDifferences: [trimmed],
      });
    }
  }

  return differential;
}

function parseTreatment(extracted: ExtractedCr): ParsedTreatment {
  const emergency: ParsedTreatment['emergency'] = [];
  const therapy: ParsedTreatment['therapy'] = [];
  const surgery: ParsedTreatment['surgery'] = [];

  const treatmentSection = extracted.sections.find(s => s.title.includes('ЛЕЧЕНИЕ'));
  if (treatmentSection) {
    const lines = treatmentSection.content.split('\n').filter(l => l.trim().length > 3);
    let priority = 1;
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (/неотложн|экстрен|скорой|реанимац/i.test(trimmed)) {
        emergency.push({ label: trimmed, description: trimmed, priority: priority++ });
      } else if (/операц|хирург|вмешательств/i.test(trimmed)) {
        surgery.push({ label: trimmed, description: trimmed, priority: priority++ });
      } else if (/терап|лечени|препарат|назнач/i.test(trimmed)) {
        therapy.push({ label: trimmed, description: trimmed, priority: priority++ });
      }
    }
  }

  return { emergency, therapy, surgery };
}

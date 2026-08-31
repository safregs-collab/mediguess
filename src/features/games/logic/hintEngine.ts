import type { UnifiedCase } from '../../../types';

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[ё]/g, 'е')
    .replace(/[^а-яa-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const ORGAN_KEYWORDS: Record<string, string[]> = {
  cardiology: ['сердц', 'коронар', 'желудочек', 'перикард', 'миокард', 'аритми'],
  pulmonology: ['легк', 'бронх', 'плевр', 'альвеол', 'пневмо', 'туберкул', 'эмфизем'],
  gastroenterology: ['желуд', 'печен', 'поджелуд', 'кишечн', 'желч', 'гепат', 'панкреат', 'язв'],
  neurology: ['мозг', 'нерв', 'эпилепс', 'инсульт', 'паркинсон', 'менингит', 'рассеян'],
  endocrinology: ['щитовид', 'диабет', 'гормон', 'адрен', 'паращитовид'],
  nephrology: ['почк', 'моче', 'гломерул', 'нефр', 'уретер', 'цистит'],
  dermatology: ['кож', 'дермат', 'псориаз', 'экзем', 'акне'],
  rheumatology: ['сустав', 'артрит', 'ревмат', 'склеродерм', 'васculит'],
  infections: ['инфекц', 'сепсис', 'менингококк', 'пневмококк', 'вирус', 'бактери'],
  emergency: ['травм', 'перелом', 'ожог', 'отравл', 'кровотеч'],
  hematology: ['анеми', 'лейкем', 'лимфом', 'тромбоцит', 'гемофил'],
};

export interface HintResult {
  hint: string | null;
  type: 'same-specialty' | 'same-organ' | 'wrong-organ' | null;
}

export function getProximityHint(
  input: string,
  currentCase: UnifiedCase,
  allCases: readonly UnifiedCase[],
  attempts: number,
  maxAttempts: number = 6,
): HintResult {
  if (attempts >= maxAttempts - 1) return { hint: null, type: null };
  if (attempts < 2) return { hint: null, type: null };

  const normInput = normalize(input);
  if (!normInput || normInput.length < 3) return { hint: null, type: null };

  const sameSpecialtyCases = allCases.filter((c) => c.specialty === currentCase.specialty && c.id !== currentCase.id);
  const sameSpecialtyDiagnoses = sameSpecialtyCases.flatMap((c) => c.diagnosis);
  const isSameSpecialty = sameSpecialtyDiagnoses.some((d) => normalize(d).includes(normInput));
  if (isSameSpecialty) {
    return {
      hint: 'Вы на правильном пути — это та же специальность, но другой диагноз',
      type: 'same-specialty',
    };
  }

  for (const [spec, keywords] of Object.entries(ORGAN_KEYWORDS)) {
    if (keywords.some((k) => normInput.includes(k))) {
      if (currentCase.specialty === spec) {
        return {
          hint: 'Правильная система органов, но уточните диагноз',
          type: 'same-organ',
        };
      }
      return {
        hint: 'Думаете не о той системе органов — попробуйте другую специальность',
        type: 'wrong-organ',
      };
    }
  }

  return { hint: null, type: null };
}

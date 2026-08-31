import pdfParse from 'pdf-parse';
import fs from 'fs/promises';

export interface ExtractedSection {
  title: string;
  content: string;
  level: number;
}

export interface ExtractedCr {
  title: string;
  number: number;
  version: number;
  mkb10: string[];
  specialty: string;
  sections: ExtractedSection[];
  rawText: string;
}

export async function extractPdf(pdfPath: string): Promise<ExtractedCr> {
  const buffer = await fs.readFile(pdfPath);
  const data = await pdfParse(buffer);
  const text = data.text;

  // Extract CR number from title
  const numberMatch = text.match(/(?:Клиническая рекомендация|КР)\s*[№N]?(\d+)/i);
  const number = numberMatch ? parseInt(numberMatch[1], 10) : 0;

  // Extract version
  const versionMatch = text.match(/(?:версия|v\.?|version)\s*(\d+)/i);
  const version = versionMatch ? parseInt(versionMatch[1], 10) : 1;

  // Extract title
  const titleMatch = text.match(/(?:Клиническая рекомендация|КР)\s*[№N]?\d*[\s:]*(.+?)(?:\n|Минздрав)/i);
  const title = titleMatch ? titleMatch[1].trim() : 'Unknown CR';

  // Extract MKB-10 codes
  const mkbMatches = text.match(/[A-Z]\d{2}(?:\.\d{1,2})?/g) || [];
  const mkb10 = [...new Set(mkbMatches)];

  // Extract specialty from title or context
  const specialtyMap: Record<string, string> = {
    'кардиолог': 'cardiology',
    'сердц': 'cardiology',
    'пульмонолог': 'pulmonology',
    'легк': 'pulmonology',
    'гастроэнтеролог': 'gastroenterology',
    'желуд': 'gastroenterology',
    'невролог': 'neurology',
    'эндокринолог': 'endocrinology',
    'инфекц': 'infectious',
    'хирург': 'surgery',
    'терап': 'therapy',
  };

  let specialty = 'general';
  const lowerText = text.toLowerCase();
  for (const [key, value] of Object.entries(specialtyMap)) {
    if (lowerText.includes(key)) {
      specialty = value;
      break;
    }
  }

  // Extract sections by common headers
  const sections = extractSections(text);

  return {
    title,
    number,
    version,
    mkb10,
    specialty,
    sections,
    rawText: text,
  };
}

function extractSections(text: string): ExtractedSection[] {
  const sectionHeaders = [
    'КЛИНИЧЕСКАЯ КАРТИНА',
    'ЖАЛОБЫ',
    'АНАМНЕЗ',
    'ФИЗИКАЛЬНОЕ ИССЛЕДОВАНИЕ',
    'ДИАГНОСТИКА',
    'ЛАБОРАТОРНАЯ ДИАГНОСТИКА',
    'ИНСТРУМЕНТАЛЬНАЯ ДИАГНОСТИКА',
    'ДИФФЕРЕНЦИАЛЬНЫЙ ДИАГНОЗ',
    'ЛЕЧЕНИЕ',
    'ТЕРАПИЯ',
    'ХИРУРГИЧЕСКОЕ ЛЕЧЕНИЕ',
    'ПРОФИЛАКТИКА',
    'РЕКОМЕНДАЦИИ',
  ];

  const sections: ExtractedSection[] = [];
  const lines = text.split('\n');
  let currentSection: ExtractedSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const matchedHeader = sectionHeaders.find(h => 
      trimmed.toUpperCase().includes(h) || 
      h.split(' ').every(word => trimmed.toUpperCase().includes(word))
    );

    if (matchedHeader) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: matchedHeader,
        content: '',
        level: 1,
      };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

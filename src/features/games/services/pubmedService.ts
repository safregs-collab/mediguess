import { useState, useEffect, useCallback } from 'react';

const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const CACHE_PREFIX = 'docw_pubmed_';
const CACHE_TTL = 24 * 60 * 60 * 1000;

// NCBI EUtils rate limit: 3 requests/sec without API key
const MIN_REQUEST_INTERVAL = 334; // ms
let lastRequestTime = 0;

const TOPIC_QUERIES: Record<string, string> = {
  hypertension: 'hypertension[Title/Abstract] AND (guidelines[Title/Abstract] OR meta-analysis[Title/Abstract]) AND 2024:2026[PDAT]',
  diabetes2: 'diabetes mellitus[Title/Abstract] AND (GLP-1[Title/Abstract] OR SGLT2[Title/Abstract] OR meta-analysis[Title/Abstract]) AND 2024:2026[PDAT]',
  heart_failure: 'heart failure[Title/Abstract] AND (guidelines[Title/Abstract] OR meta-analysis[Title/Abstract]) AND 2024:2026[PDAT]',
  stroke: 'stroke[Title/Abstract] AND prevention[Title/Abstract] AND 2024:2026[PDAT]',
  copd: 'COPD[Title/Abstract] AND (guidelines[Title/Abstract] OR meta-analysis[Title/Abstract]) AND 2024:2026[PDAT]',
  pneumonia: 'pneumonia[Title/Abstract] AND (guidelines[Title/Abstract] OR meta-analysis[Title/Abstract]) AND 2024:2026[PDAT]',
  coronary: 'coronary artery disease[Title/Abstract] AND (guidelines[Title/Abstract] OR meta-analysis[Title/Abstract]) AND 2024:2026[PDAT]',
  default: 'clinical guidelines[Title/Abstract] AND meta-analysis[Title/Abstract] AND 2024:2026[PDAT]'
};

export interface PubMedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: string;
  journal: string;
  year: string;
  doi: string;
  url: string;
}

interface CacheEntry { data: PubMedArticle[]; timestamp: number; }

function getCache(key: string): PubMedArticle[] | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch { return null; }
}

function setCache(key: string, data: PubMedArticle[]) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { /* ignore */ }
}

// Rate-limited fetch with exponential backoff
async function throttledFetch(url: string): Promise<Response> {
  const now = Date.now();
  const delay = Math.max(0, MIN_REQUEST_INTERVAL - (now - lastRequestTime));
  if (delay > 0) {
    await new Promise((r) => setTimeout(r, delay));
  }
  lastRequestTime = Date.now();
  return fetch(url);
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await throttledFetch(url);
    if (res.status !== 429 && res.status !== 503) return res;
    // Exponential backoff: 1s, 2s, 4s
    await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i)));
  }
  throw new Error('Rate limited by NCBI. Please try again later.');
}

async function esearch(term: string, retmax = 10): Promise<string[]> {
  const url = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmax=${retmax}&retmode=json&sort=date`;
  const r = await fetchWithRetry(url);
  if (!r.ok) throw new Error(`Search failed: ${r.status}`);
  const data = await r.json();
  return data.esearchresult?.idlist || [];
}

async function efetch(pmids: string[]): Promise<PubMedArticle[]> {
  if (pmids.length === 0) return [];
  const url = `${PUBMED_BASE}/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`;
  const r = await fetchWithRetry(url);
  if (!r.ok) throw new Error(`Fetch failed: ${r.status}`);
  const text = await r.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, 'text/xml');

  // Check for parser error
  const parserError = xml.querySelector('parsererror');
  if (parserError) {
    throw new Error('Failed to parse PubMed XML response');
  }

  const articles: PubMedArticle[] = [];
  xml.querySelectorAll('PubmedArticle').forEach((article) => {
    const pmid = article.querySelector('PMID')?.textContent || '';
    const title = article.querySelector('ArticleTitle')?.textContent || 'No title';
    const abstractTexts = article.querySelectorAll('AbstractText');
    const abstract = Array.from(abstractTexts).map((a) => a.textContent).join(' ').substring(0, 500);

    const authorList = article.querySelectorAll('Author');
    const authors = Array.from(authorList)
      .slice(0, 3)
      .map((a) => {
        const last = a.querySelector('LastName')?.textContent || '';
        const first = a.querySelector('ForeName')?.textContent || '';
        return `${last} ${first}`.trim();
      })
      .join(', ');

    // Fix: use proper XML selectors (child elements, not space-separated)
    const journalNode = article.querySelector('Journal');
    const journal = journalNode?.querySelector('Title')?.textContent || '';

    const pubDateNode = article.querySelector('PubDate');
    const year = pubDateNode?.querySelector('Year')?.textContent
      || pubDateNode?.querySelector('MedlineDate')?.textContent?.substring(0, 4)
      || '';

    const doi = article.querySelector('ArticleId[IdType="doi"]')?.textContent || '';

    articles.push({
      pmid,
      title,
      abstract,
      authors,
      journal,
      year,
      doi,
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    });
  });
  return articles;
}

// Mock fallback data for offline mode
const MOCK_ARTICLES: Record<string, PubMedArticle[]> = {
  hypertension: [
    {
      pmid: '38412345',
      title: '2024 ESC Guidelines for the management of arterial hypertension',
      abstract: 'The European Society of Cardiology presents updated guidelines...',
      authors: 'Williams B, Mancia G',
      journal: 'Eur Heart J',
      year: '2024',
      doi: '10.1093/eurheartj/ehae123',
      url: 'https://pubmed.ncbi.nlm.nih.gov/38412345/',
    },
  ],
  diabetes2: [
    {
      pmid: '38567890',
      title: 'GLP-1 receptor agonists in type 2 diabetes: 2024 update',
      abstract: 'A comprehensive review of GLP-1 based therapies...',
      authors: 'Drucker DJ, Habener JF',
      journal: 'Nat Rev Endocrinol',
      year: '2024',
      doi: '10.1038/s41574-024-00912-x',
      url: 'https://pubmed.ncbi.nlm.nih.gov/38567890/',
    },
  ],
  heart_failure: [
    {
      pmid: '38678901',
      title: 'SGLT2 inhibitors in heart failure: beyond glycemic control',
      abstract: 'This meta-analysis demonstrates the cardiovascular benefits...',
      authors: 'Zannad F, Ferreira JP',
      journal: 'Lancet',
      year: '2024',
      doi: '10.1016/S0140-6736(24)00567-8',
      url: 'https://pubmed.ncbi.nlm.nih.gov/38678901/',
    },
  ],
  stroke: [
    {
      pmid: '38789012',
      title: 'Secondary stroke prevention: current evidence and guidelines',
      abstract: 'Review of antiplatelet and anticoagulant strategies...',
      authors: 'Rothwell PM, Algra A',
      journal: 'Stroke',
      year: '2024',
      doi: '10.1161/STROKEAHA.124.045678',
      url: 'https://pubmed.ncbi.nlm.nih.gov/38789012/',
    },
  ],
  copd: [
    {
      pmid: '38890123',
      title: 'GOLD 2024 strategy report: updated recommendations',
      abstract: 'The Global Initiative for Chronic Obstructive Lung Disease...',
      authors: 'Agusti A, Celli BR',
      journal: 'Am J Respir Crit Care Med',
      year: '2024',
      doi: '10.1164/rccm.202401-0123SO',
      url: 'https://pubmed.ncbi.nlm.nih.gov/38890123/',
    },
  ],
  pneumonia: [
    {
      pmid: '38901234',
      title: 'Community-acquired pneumonia: updated IDSA/ATS guidelines',
      abstract: 'New recommendations for empiric antibiotic therapy...',
      authors: 'Metlay JP, Waterer GW',
      journal: 'Clin Infect Dis',
      year: '2024',
      doi: '10.1093/cid/ciae123',
      url: 'https://pubmed.ncbi.nlm.nih.gov/38901234/',
    },
  ],
  coronary: [
    {
      pmid: '39012345',
      title: 'Chronic coronary syndromes: 2024 ESC management guidelines',
      abstract: 'Updated recommendations for stable coronary artery disease...',
      authors: 'Knuuti J, Wijns W',
      journal: 'Eur Heart J',
      year: '2024',
      doi: '10.1093/eurheartj/ehae456',
      url: 'https://pubmed.ncbi.nlm.nih.gov/39012345/',
    },
  ],
  default: [
    {
      pmid: '39123456',
      title: 'Clinical practice guidelines in internal medicine: 2024 overview',
      abstract: 'A systematic review of current evidence-based guidelines...',
      authors: 'Smith J, Johnson A',
      journal: 'JAMA Intern Med',
      year: '2024',
      doi: '10.1001/jamainternmed.2024.0123',
      url: 'https://pubmed.ncbi.nlm.nih.gov/39123456/',
    },
  ],
};

export async function fetchPubMedArticles(topic: string, retmax = 5): Promise<PubMedArticle[]> {
  const query = TOPIC_QUERIES[topic] || TOPIC_QUERIES.default;
  const cacheKey = topic + '_' + retmax;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const pmids = await esearch(query, retmax);
    const articles = await efetch(pmids);
    setCache(cacheKey, articles);
    return articles;
  } catch (err) {
    console.error('PubMed error:', err);
    // Return mock data as fallback when network fails
    return MOCK_ARTICLES[topic] || MOCK_ARTICLES.default;
  }
}

export function usePubMedArticles(topic: string, enabled = true) {
  const [articles, setArticles] = useState<PubMedArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const load = useCallback(async () => {
    if (!enabled || !topic) return;
    setLoading(true);
    setError(null);
    setIsOffline(false);
    try {
      const data = await fetchPubMedArticles(topic, 5);
      setArticles(data);
      // Detect if we got mock data (offline fallback)
      const mockPmids = (MOCK_ARTICLES[topic] || MOCK_ARTICLES.default).map((a) => a.pmid);
      if (data.length > 0 && mockPmids.includes(data[0].pmid)) {
        setIsOffline(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [topic, enabled]);

  useEffect(() => { load(); }, [load]);
  return { articles, loading, error, isOffline, refetch: load };
}

export function getTopicForCase(caseId: string): string {
  const map: Record<string, string> = {
    hypertension: 'hypertension', diabetes2: 'diabetes2',
    heart_failure: 'heart_failure', stroke: 'stroke',
    copd: 'copd', pneumonia: 'pneumonia', coronary: 'coronary'
  };
  return map[caseId] || 'default';
}

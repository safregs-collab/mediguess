import { useState, useEffect, useCallback } from 'react';

const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const CACHE_PREFIX = 'docw_pubmed_';
const CACHE_TTL = 24 * 60 * 60 * 1000;

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
  } catch { }
}

async function esearch(term: string, retmax = 10): Promise<string[]> {
  const url = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmax=${retmax}&retmode=json&sort=date`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Search failed: ${r.status}`);
  const data = await r.json();
  return data.esearchresult?.idlist || [];
}

async function efetch(pmids: string[]): Promise<PubMedArticle[]> {
  if (pmids.length === 0) return [];
  const url = `${PUBMED_BASE}/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Fetch failed: ${r.status}`);
  const text = await r.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, 'text/xml');
  const articles: PubMedArticle[] = [];
  xml.querySelectorAll('PubmedArticle').forEach(article => {
    const pmid = article.querySelector('PMID')?.textContent || '';
    const title = article.querySelector('ArticleTitle')?.textContent || 'No title';
    const abstractTexts = article.querySelectorAll('AbstractText');
    const abstract = Array.from(abstractTexts).map(a => a.textContent).join(' ').substring(0, 500);
    const authorList = article.querySelectorAll('Author');
    const authors = Array.from(authorList).slice(0, 3).map(a => {
      const last = a.querySelector('LastName')?.textContent || '';
      const first = a.querySelector('ForeName')?.textContent || '';
      return `${last} ${first}`.trim();
    }).join(', ');
    const journal = article.querySelector('Journal Title')?.textContent || '';
    const year = article.querySelector('PubDate Year')?.textContent || article.querySelector('PubDate MedlineDate')?.textContent?.substring(0, 4) || '';
    const doi = article.querySelector('ArticleId[IdType="doi"]')?.textContent || '';
    articles.push({ pmid, title, abstract, authors, journal, year, doi, url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` });
  });
  return articles;
}

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
    return getCache(cacheKey) || [];
  }
}

export function usePubMedArticles(topic: string, enabled = true) {
  const [articles, setArticles] = useState<PubMedArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled || !topic) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPubMedArticles(topic, 5);
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [topic, enabled]);

  useEffect(() => { load(); }, [load]);
  return { articles, loading, error, refetch: load };
}

export function getTopicForCase(caseId: string): string {
  const map: Record<string, string> = {
    hypertension: 'hypertension', diabetes2: 'diabetes2',
    heart_failure: 'heart_failure', stroke: 'stroke',
    copd: 'copd', pneumonia: 'pneumonia', coronary: 'coronary'
  };
  return map[caseId] || 'default';
}

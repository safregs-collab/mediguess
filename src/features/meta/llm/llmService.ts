import { buildGraphPrompt } from './promptBuilder';
import type { MetaResolvedData } from '../types';

export type LLMProvider = 'openai' | 'anthropic' | 'groq' | 'mock';

interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

const STORAGE_KEY = 'docw-llm-config';

function getConfig(): LLMConfig {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { provider: 'mock' };
}

export function saveConfig(config: LLMConfig) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch { /* ignore */ }
}

/**
 * Mask an API key, showing only the last 4 characters.
 * Returns '••••' if the key is too short or missing.
 */
export function maskApiKey(key?: string): string {
  if (!key || key.length <= 4) return '••••';
  return '•'.repeat(key.length - 4) + key.slice(-4);
}

export function getStoredConfig(): LLMConfig {
  return getConfig();
}

/**
 * Generate a clinical description using LLM.
 * Falls back to mock mode if no API key is configured.
 */
export async function generateDescription(
  data: MetaResolvedData,
  lang: 'ru' | 'en' = 'ru',
  config?: LLMConfig
): Promise<string> {
  const cfg = config || getConfig();
  const prompt = buildGraphPrompt(data, lang);

  if (cfg.provider === 'mock' || !cfg.apiKey) {
    // Mock mode: return a placeholder that instructs the user
    await new Promise((r) => setTimeout(r, 800)); // simulate delay
    if (lang === 'en') {
      return `## AI-Generated Clinical Summary\n\nTo enable AI-powered descriptions, configure an LLM API key in settings.\n\n**Mock output based on:** ${data.hypothesis.label}\n\nThis feature supports OpenAI, Anthropic, and Groq APIs.`;
    }
    return `## AI-резюме\n\nДля включения генерации описаний через ИИ настройте API-ключ в настройках.\n\n**Демо-вывод на основе:** ${data.hypothesis.label}\n\nПоддерживаются API: OpenAI, Anthropic, Groq.`;
  }

  if (cfg.provider === 'openai') {
    return callOpenAI(prompt, cfg);
  }
  if (cfg.provider === 'anthropic') {
    return callAnthropic(prompt, cfg);
  }
  if (cfg.provider === 'groq') {
    return callGroq(prompt, cfg);
  }

  throw new Error(`Unknown provider: ${cfg.provider}`);
}

async function callOpenAI(prompt: string, config: LLMConfig): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 800,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callAnthropic(prompt: string, config: LLMConfig): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model || 'claude-3-haiku-20240307',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

async function callGroq(prompt: string, config: LLMConfig): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 800,
    }),
  });
  if (!res.ok) throw new Error(`Groq error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

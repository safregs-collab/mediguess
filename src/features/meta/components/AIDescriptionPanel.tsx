import { useState, useCallback } from 'react';
import type { MetaResolvedData } from '../types';
import { generateDescription, saveConfig, getStoredConfig, maskApiKey, type LLMProvider } from '../llm';
import { useI18n } from '../i18n';
import styles from '../meta.module.css';

interface AIDescriptionPanelProps {
  data: MetaResolvedData;
}

export function AIDescriptionPanel({ data }: AIDescriptionPanelProps) {
  const { t, lang } = useI18n();
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState(getStoredConfig());

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateDescription(data, lang as 'ru' | 'en', config);
      setText(result);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [data, lang, config]);

  const handleSaveConfig = useCallback(() => {
    saveConfig(config);
    setShowConfig(false);
  }, [config]);

  return (
    <div className={styles['meta-ai-panel']}>
      {!text && !loading && (
        <div className={styles['meta-ai-intro']}>
          <div className={styles['meta-ai-icon']}>🤖</div>
          <p className={styles['meta-ai-desc']}>
            {lang === 'en'
              ? 'Generate an AI-powered clinical summary based on the graph data.'
              : 'Сгенерируйте AI-резюме на основе данных графа нозологии.'}
          </p>
          <button className={styles['meta-ai-generate-btn']} onClick={handleGenerate} disabled={loading}>
            {t('meta.aiGenerate')}
          </button>
          <button className={styles['meta-ai-config-btn']} onClick={() => setShowConfig((v) => !v)}>
            ⚙️ {t('meta.aiConfigure')}
          </button>
        </div>
      )}

      {loading && (
        <div className={styles['meta-ai-loading']}>
          <div className={styles['meta-spinner']} />
          <span>{t('meta.aiGenerating')}</span>
        </div>
      )}

      {error && (
        <div className={styles['meta-ai-error']}>
          <p>⚠️ {error}</p>
          <button className={styles['meta-ai-generate-btn']} onClick={handleGenerate}>
            {t('meta.aiGenerate')}
          </button>
        </div>
      )}

      {text && !loading && (
        <div className={styles['meta-ai-result']}>
          <div className={styles['meta-ai-result-header']}>
            <span className={styles['meta-ai-result-badge']}>🤖 AI</span>
            <button className={styles['meta-ai-config-btn']} onClick={() => setShowConfig((v) => !v)}>
              ⚙️
            </button>
          </div>
          <div className={styles['meta-ai-result-body']}>
            {text.split('\n').map((line, i) => (
              <p key={i} className={line.startsWith('##') ? styles['meta-ai-h2'] : ''}>
                {line}
              </p>
            ))}
          </div>
          <button className={styles['meta-ai-generate-btn']} onClick={handleGenerate} disabled={loading}>
            🔄 {t('meta.aiGenerate')}
          </button>
        </div>
      )}

      {showConfig && (
        <div className={styles['meta-ai-config']}>
          <h4>{t('meta.aiConfigure')}</h4>
          <label>
            <span>{t('meta.aiProvider')}</span>
            <select
              value={config.provider}
              onChange={(e) => setConfig((c) => ({ ...c, provider: e.target.value as LLMProvider }))}
            >
              <option value="mock">{t('meta.aiMockMode')}</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="groq">Groq</option>
            </select>
          </label>
          {config.provider !== 'mock' && (
            <>
              <label>
                <span>{t('meta.aiApiKey')}</span>
                <input
                  type="password"
                  value={config.apiKey || ''}
                  onChange={(e) => setConfig((c) => ({ ...c, apiKey: e.target.value }))}
                  placeholder="sk-..."
                />
                {config.apiKey && (
                  <small className={styles['meta-ai-key-masked']}>{maskApiKey(config.apiKey)}</small>
                )}
                <small className={styles['meta-ai-key-warning']}>
                  {lang === 'en'
                    ? 'The key is stored in tab memory and will be removed when the tab is closed.'
                    : 'Ключ хранится в памяти вкладки и будет удалён при закрытии.'}
                </small>
              </label>
              <label>
                <span>{t('meta.aiModel')}</span>
                <input
                  type="text"
                  value={config.model || ''}
                  onChange={(e) => setConfig((c) => ({ ...c, model: e.target.value }))}
                  placeholder={
                    config.provider === 'openai' ? 'gpt-4o-mini'
                    : config.provider === 'anthropic' ? 'claude-3-haiku-20240307'
                    : 'llama-3.1-8b-instant'
                  }
                />
              </label>
            </>
          )}
          <button className={styles['meta-ai-generate-btn']} onClick={handleSaveConfig}>
            {t('meta.aiSave')}
          </button>
        </div>
      )}
    </div>
  );
}

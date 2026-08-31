import { usePubMedArticles, type PubMedArticle } from '../services/pubmedService';
import { AnimatedIcon } from '../../../shared/components/AnimatedIcon';

interface EvidencePanelProps {
  topic: string;
  visible: boolean;
}

function ArticleCard({ article }: { article: PubMedArticle }) {
  return (
    <div className="pubmed-article-card">
      <div className="pubmed-article-title">{article.title}</div>
      <div className="pubmed-article-meta">
        {article.authors} | {article.journal} | {article.year}
      </div>
      <div className="pubmed-article-abstract">
        {article.abstract || 'Аннотация недоступна'}
      </div>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="pubmed-article-link"
      >
        <AnimatedIcon name="copy" size={12} style={{ marginRight: '4px' }} /> PubMed PMID:{article.pmid} ↗
      </a>
    </div>
  );
}

export function EvidencePanel({ topic, visible }: EvidencePanelProps) {
  const { articles, loading, error, isOffline, refetch } = usePubMedArticles(topic, visible);

  if (!visible) return null;

  return (
    <div className="evidence-panel-container">
      <div className="evidence-panel-header">
        <span className="evidence-panel-title">
          <AnimatedIcon name="book" size={16} style={{ marginRight: '6px' }} /> Свежие публикации PubMed
          {isOffline && <span className="evidence-panel-offline-badge" title="Демо-режим: данные загружены локально"><AnimatedIcon name="warning" size={12} color="#f59e0b" style={{ marginRight: '2px' }} /> offline</span>}
        </span>
        <button className="evidence-panel-refresh" onClick={refetch} disabled={loading}>
          {loading ? (
            <><AnimatedIcon name="refresh" size={14} animation="spin" /> Загрузка...</>
          ) : (
            <><AnimatedIcon name="refresh" size={14} /> Обновить</>
          )}
        </button>
      </div>

      {loading && articles.length === 0 && (
        <div className="evidence-panel-loading">
          <div className="spinner" />
          <span>Загрузка статей из PubMed...</span>
        </div>
      )}

      {error && (
        <div className="evidence-panel-error">
          <AnimatedIcon name="warning" size={16} color="#f59e0b" style={{ marginRight: '6px' }} /> Ошибка загрузки: {error}
          <br />
          <small>Проверьте подключение к интернету или попробуйте позже</small>
        </div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="evidence-panel-empty">
          <AnimatedIcon name="archive" size={16} style={{ marginRight: '6px' }} /> Нет доступных статей. Нажмите «Обновить» для загрузки.
        </div>
      )}

      {articles.length > 0 && (
        <div className="pubmed-articles-list">
          {articles.map((article, i) => (
            <ArticleCard key={article.pmid || i} article={article} />
          ))}
          <div className="pubmed-disclaimer">
            {isOffline
              ? 'Демо-режим: показаны примеры публикаций. Подключитесь к интернету для актуальных данных.'
              : 'Данные предоставлены NCBI PubMed. Обновляются автоматически.'}
          </div>
        </div>
      )}
    </div>
  );
}

import { usePubMedArticles, type PubMedArticle } from '../services/pubmedService';

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
        🔗 PubMed PMID:{article.pmid} ↗
      </a>
    </div>
  );
}

export function EvidencePanel({ topic, visible }: EvidencePanelProps) {
  const { articles, loading, error, refetch } = usePubMedArticles(topic, visible);

  if (!visible) return null;

  return (
    <div className="evidence-panel-container">
      <div className="evidence-panel-header">
        <span className="evidence-panel-title">📚 Свежие публикации PubMed</span>
        <button className="evidence-panel-refresh" onClick={refetch} disabled={loading}>
          {loading ? '⏳ Загрузка...' : '🔄 Обновить'}
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
          ⚠️ Ошибка загрузки: {error}
          <br />
          <small>Проверьте подключение к интернету или попробуйте позже</small>
        </div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="evidence-panel-empty">
          📭 Нет доступных статей. Нажмите «Обновить» для загрузки.
        </div>
      )}

      {articles.length > 0 && (
        <div className="pubmed-articles-list">
          {articles.map((article, i) => (
            <ArticleCard key={article.pmid || i} article={article} />
          ))}
          <div className="pubmed-disclaimer">
            Данные предоставлены NCBI PubMed. Обновляются автоматически.
          </div>
        </div>
      )}
    </div>
  );
}

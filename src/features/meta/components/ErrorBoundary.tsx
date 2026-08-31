import React, { ReactNode } from 'react';
import styles from '../meta.module.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Meta ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className={styles['meta-error-fallback']}>
          <div className={styles['meta-error-icon']}>⚠️</div>
          <h3 className={styles['meta-error-title']}>Ошибка загрузки мета-зоны</h3>
          <p className={styles['meta-error-message']}>
            {this.state.error?.message || 'Неизвестная ошибка'}
          </p>
          <button className={styles['meta-error-btn']} onClick={this.handleReset}>
            🔄 Попробовать снова
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
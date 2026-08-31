import styles from '../meta.module.css';

export function MetaSkeleton() {
  return (
    <div className={`${styles['meta-panel']} ${styles['meta-panel--skeleton']}`}>
      {/* Header skeleton */}
      <div className={styles['meta-header']}>
        <div className={`${styles['meta-skeleton']} ${styles['meta-skeleton--badge']}`} />
        <div className={`${styles['meta-skeleton']} ${styles['meta-skeleton--title']}`} />
        <div className={`${styles['meta-skeleton']} ${styles['meta-skeleton--line']}`} />
        <div className={`${styles['meta-skeleton']} ${styles['meta-skeleton--line']} short`} />
      </div>

      {/* Tabs skeleton */}
      <div className={styles['meta-tabs']}>
        <div className={`${styles['meta-skeleton']} ${styles['meta-skeleton--tab']}`} />
        <div className={`${styles['meta-skeleton']} ${styles['meta-skeleton--tab']}`} />
        <div className={`${styles['meta-skeleton']} ${styles['meta-skeleton--tab']}`} />
        <div className={`${styles['meta-skeleton']} ${styles['meta-skeleton--tab']}`} />
        <div className={`${styles['meta-skeleton']} ${styles['meta-skeleton--tab']}`} />
      </div>

      {/* Content skeleton */}
      <div className={styles['meta-tab-content']}>
        <div className={`${styles['meta-skeleton']} ${styles['meta-skeleton--card']}`} />
        <div className={`${styles['meta-skeleton']} ${styles['meta-skeleton--card']}`} />
        <div className={`${styles['meta-skeleton']} ${styles['meta-skeleton--card']}`} />
      </div>
    </div>
  );
}
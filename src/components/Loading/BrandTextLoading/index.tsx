import { isCustomBranding } from '@/const/version';
import CircleLoading from '../CircleLoading';
import styles from './index.module.css';

interface BrandTextLoadingProps {
  debugId: string;
}

const BrandTextLoading = ({ debugId }: BrandTextLoadingProps) => {
  const showDebug = process.env.NODE_ENV === 'development' && debugId;

  return (
    <div className={styles.container}>
      <div aria-label="Loading" role="status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <img
          src="/fi-logo.svg"
          alt="Fi"
          style={{ height: 40, width: 'auto', opacity: 0.9 }}
        />
        <div style={{
          width: 32,
          height: 2,
          background: 'rgba(0,0,0,0.08)',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: 0, left: '-100%',
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.4)',
            animation: 'fi-loading 1.2s ease-in-out infinite',
          }} />
        </div>
        <style>{`
          @keyframes fi-loading {
            0% { left: -100%; }
            100% { left: 100%; }
          }
        `}</style>
      </div>
      {showDebug && (
        <div className={styles.debug}>
          <div className={styles.debugRow}>
            <code>Debug ID:</code>
            <span className={styles.debugTag}>
              <code>{debugId}</code>
            </span>
          </div>
          <div className={styles.debugHint}>only visible in development</div>
        </div>
      )}
    </div>
  );
};

export default BrandTextLoading;

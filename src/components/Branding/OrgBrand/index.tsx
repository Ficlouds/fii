import { ORG_NAME } from '@ficlouds/business-const';
import { type CSSProperties, memo } from 'react';

import { isCustomORG } from '@/const/version';

export interface FiProps {
  className?: string;
  extra?: string;
  size?: number;
  style?: CSSProperties;
  type?: 'combine' | '3d' | 'flat' | 'mono' | 'text';
}

export const OrgBrand = memo<FiProps>(({ size = 20 }) => {
  if (isCustomORG) {
    return <span>{ORG_NAME}</span>;
  }

  return (
    <span style={{ fontSize: size, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1 }}>
      Fi
    </span>
  );
});

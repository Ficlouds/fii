'use client';

import { type FlexboxProps } from '@lobehub/ui';
import { Flexbox } from '@lobehub/ui';
import { type ReactNode } from 'react';
import { memo } from 'react';

export interface AuthCardProps extends Omit<FlexboxProps, 'title'> {
  subtitle?: ReactNode;
  title?: ReactNode;
}

export const AuthCard = memo<AuthCardProps>(({ children, title, ...rest }) => {
  return (
    <Flexbox width={'min(100%,440px)'} {...rest}>
      <Flexbox gap={16}>
        {title && (
          <h1 style={{
            color: '#ffffff',
            fontSize: 28,
            fontWeight: 600,
            lineHeight: 1.3,
            margin: '0 0 8px 0',
            fontFamily: 'system-ui, sans-serif',
            letterSpacing: '-0.5px',
          }}>
            {title}
          </h1>
        )}
      </Flexbox>
      <Flexbox gap={4} paddingBlock={32}>
        {children}
      </Flexbox>
    </Flexbox>
  );
});

export default AuthCard;

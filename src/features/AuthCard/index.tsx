'use client';

import { type FlexboxProps } from '@lobehub/ui';
import { Flexbox } from '@lobehub/ui';
import { type ReactNode } from 'react';
import { memo } from 'react';

export interface AuthCardProps extends Omit<FlexboxProps, 'title'> {
  footer?: ReactNode;
  subtitle?: ReactNode;
  title?: ReactNode;
}

export const AuthCard = memo<AuthCardProps>(({ children, title, subtitle, footer, ...rest }) => {
  return (
    <Flexbox width={'100%'} {...rest}>
      <Flexbox gap={16}>
        {title && (
          <h1 style={{
            color: '#111111',
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
        {subtitle && (
          <p style={{ color: '#a0a0a0', fontSize: 14, margin: 0 }}>
            {subtitle}
          </p>
        )}
      </Flexbox>
      <Flexbox gap={4} paddingBlock={32}>
        {children}
      </Flexbox>
      {footer && (
        <Flexbox gap={12}>
          {footer}
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default AuthCard;

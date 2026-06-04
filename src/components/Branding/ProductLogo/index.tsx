'use client';

import { memo } from 'react';

interface ProductLogoProps {
  size?: number;
  width?: number;
  height?: number;
  type?: 'text' | 'icon' | 'combine';
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const ProductLogo = memo<ProductLogoProps>(({
  size = 32,
  width,
  height,
  type = 'combine',
  color,
  style,
  className,
}) => {
  const h = height || size;
  const w = width || (type === 'combine' ? h * 4 : h);

  return (
    <img
      src="/logos/fi-icon.svg"
      alt="Fi"
      width={w}
      height={h}
      style={{
        objectFit: 'contain',
        filter: color === 'white' ? 'invert(1)' : undefined,
        ...style,
      }}
      className={className}
    />
  );
});

export default ProductLogo;

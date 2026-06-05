import { type FC, type PropsWithChildren, useRef } from 'react';

import { LayoutContainerContext } from './DesktopLayoutContainer/LayoutContainerContext';

const DesktopLayoutContainer: FC<PropsWithChildren> = ({ children }) => {
  const innerContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ flex: 1, height: '100%', minWidth: 0, overflow: 'hidden', position: 'relative', width: '100%' }}>
      <div
        ref={innerContainerRef}
        style={{ bottom: 0, left: 0, overflow: 'hidden', position: 'absolute', right: 0, top: 0, background: 'transparent' }}
      >
        <LayoutContainerContext value={innerContainerRef}>{children}</LayoutContainerContext>
      </div>
    </div>
  );
};

export default DesktopLayoutContainer;

import type * as LobeConst from '@lobechat/const';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PortalViewType } from '@/store/chat/slices/portal/initialState';

import BrowserToggle from './index';

const mocks = vi.hoisted(() => ({
  isDesktopValue: true,
  openBrowser: vi.fn(),
  portalStack: [] as Array<{ type: PortalViewType }>,
}));

vi.mock('@lobechat/const', async (importOriginal) => {
  const actual = await importOriginal<typeof LobeConst>();

  return {
    ...actual,
    DESKTOP_HEADER_ICON_SMALL_SIZE: 24,
    get isDesktop() {
      return mocks.isDesktopValue;
    },
  };
});

vi.mock('@lobehub/ui', () => ({
  ActionIcon: ({ onClick, title }: { onClick?: () => void; title?: string }) => (
    <button title={title} type="button" onClick={onClick}>
      {title}
    </button>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/store/chat', () => ({
  useChatStore: (selector: (state: unknown) => unknown) =>
    selector({
      openBrowser: mocks.openBrowser,
      portalStack: mocks.portalStack,
      showPortal: mocks.portalStack.length > 0,
    }),
}));

describe('BrowserToggle', () => {
  beforeEach(() => {
    mocks.openBrowser.mockClear();
    mocks.isDesktopValue = true;
    mocks.portalStack = [];
  });

  it('opens Browser Portal from the chat header', () => {
    render(
      <MemoryRouter initialEntries={['/chat']}>
        <BrowserToggle />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTitle('browser.open'));

    expect(mocks.openBrowser).toHaveBeenCalled();
  });

  it('hides when Browser Portal is already active', () => {
    mocks.portalStack = [{ type: PortalViewType.Browser }];

    render(
      <MemoryRouter initialEntries={['/chat']}>
        <BrowserToggle />
      </MemoryRouter>,
    );

    expect(screen.queryByTitle('browser.open')).not.toBeInTheDocument();
  });

  it('hides outside the desktop app and popup routes', () => {
    mocks.isDesktopValue = false;

    const { rerender } = render(
      <MemoryRouter initialEntries={['/chat']}>
        <BrowserToggle />
      </MemoryRouter>,
    );

    expect(screen.queryByTitle('browser.open')).not.toBeInTheDocument();

    mocks.isDesktopValue = true;
    rerender(
      <MemoryRouter initialEntries={['/popup/agent/inbox']}>
        <BrowserToggle />
      </MemoryRouter>,
    );

    expect(screen.queryByTitle('browser.open')).not.toBeInTheDocument();
  });
});

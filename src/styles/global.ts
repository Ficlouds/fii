import { CLASSNAMES } from '@lobehub/ui';
import type { Theme } from 'antd-style';
import { css } from 'antd-style';

// fix ios input keyboard
// overflow: hidden;
// ref: https://zhuanlan.zhihu.com/p/113855026
// eslint-disable-next-line unicorn/no-anonymous-default-export
export default ({ token }: { prefixCls: string; token: Theme }) => css`
  html[data-theme='light'] body,
  html[data-theme='light'] #__next,
  html[data-theme='light'] .ant-layout,
  html[data-theme='light'] [class*='layout'],
  html[data-theme='light'] [class*='container'] {
    background-color: #f9f8f7 !important;
  }
  html[data-theme='dark'] body,
  html[data-theme='dark'] #__next {
    background-color: #0a0a0a !important;
  }
  html,
  body,
  #__next {
    position: relative;

    overscroll-behavior: none;

    height: 100%;
    min-height: 100dvh;
    max-height: 100dvh;

    @media (device-width >= 576px) {
      overflow: hidden;
    }
  }

  body {
    /* Increase compositing layer, force hardware acceleration, otherwise render black edges will appear */
    will-change: opacity;
    transform: translateZ(0);
  }

  * {
    scrollbar-color: ${token.colorFill} transparent;
    scrollbar-width: thin;

    ::-webkit-scrollbar {
      width: 0.75em;
      height: 0.75em;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 10px;
    }

    :hover::-webkit-scrollbar-thumb {
      border: 3px solid transparent;
      background-color: ${token.colorText};
      background-clip: content-box;
    }

    ::-webkit-scrollbar-track {
      background-color: transparent;
    }
  }

  html.desktop[data-theme='dark'] body {
    background-color: color-mix(in srgb, ${token.colorBgLayout} 50%, transparent);
  }

  html.desktop[data-theme='light'] body {
    background-color: color-mix(in srgb, ${token.colorBgLayout} 70%, transparent);
  }

  button {
    -webkit-app-region: no-drag;
  }

  .${CLASSNAMES.ContextTrigger}[data-popup-open]:not([data-no-highlight]),
  .${CLASSNAMES.DropdownMenuTrigger}[data-popup-open]:not([data-no-highlight]) {
    background: ${token.colorFillTertiary};
  }
  .accordion-action:has(
    .${CLASSNAMES.DropdownMenuTrigger}[data-popup-open]:not([data-no-highlight])
  ) {
    opacity: 1;
  }
`;

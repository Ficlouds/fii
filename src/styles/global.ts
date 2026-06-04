import { CLASSNAMES } from '@lobehub/ui';
import type { Theme } from 'antd-style';
import { css } from 'antd-style';

export default ({ token }: { prefixCls: string; token: Theme }) => css`

  html[data-theme='light'] .lobe-chat-input,
  html[data-theme='light'] [class*='ChatInput'],
  html[data-theme='light'] [class*='chat-input'],
  html[data-theme='light'] [data-testid='chat-input'] {
    background: #f9f8f7 !important;
    background-color: #f9f8f7 !important;
  }
  html[data-theme='light'] .ant-layout,
  html[data-theme='light'] .ant-layout-content {
    background: #f9f8f7 !important;
  }
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

  /* Sidebar background #FCFCFC */
  html[data-theme='light'] [class*='NavPanel'],
  html[data-theme='light'] [class*='navPanel'],
  html[data-theme='light'] [class*='sideBar'],
  html[data-theme='light'] [class*='sidebar'],
  html[data-theme='light'] [class*='SideBar'],
  html[data-theme='light'] nav[class],
  html[data-theme='light'] aside[class] {
    background: #fcfcfc !important;
    background-color: #fcfcfc !important;
  }

  /* Sidebar nav item spacing */
  [class*='NavPanel'] a + a,
  [class*='navPanel'] a + a {
    margin-top: 2px;
  }

  /* ============================================
     INPUT BAR — kill ALL lobehub internal styles
     Target: DesktopChatInput container + editor
     ============================================ */

  /* The outer ChatInput wrapper — force our pill shape */
  [data-insp-path*="ChatInput/Desktop"],
  [class*="ChatInput"][class*="lobe"] {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
  }

  /* The inner input container div (acss-1uegmkh class pattern) */
  [data-insp-path*="ChatInput"] > div > div,
  [class*="lobe"][class*="Input"] > div {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  /* The editor area */
  [contenteditable="true"],
  [data-lexical-editor="true"] {
    background: transparent !important;
    color: inherit !important;
  }

  /* Force entire input zone background to inherit from our wrapper */
  [data-insp-path*="/home/features/InputArea"] *,
  [data-insp-path*="/home/features/InputArea"] {
    background: inherit !important;
    box-shadow: none !important;
  }
`;

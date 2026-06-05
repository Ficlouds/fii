import { CLASSNAMES } from '@lobehub/ui';
import type { Theme } from 'antd-style';
import { css } from 'antd-style';

export default ({ token }: { prefixCls: string; token: Theme }) => css`

  html[data-theme='light'] .ant-layout,
  html[data-theme='light'] .ant-layout-content {
    background: #f9f8f7 !important;
  }
  html[data-theme='light'] body,
  html[data-theme='light'] #__next {
    background-color: #f9f8f7 !important;
  }
  html[data-theme='dark'] body,
  html[data-theme='dark'] #__next {
    background-color: #0a0a0a !important;
  }
  html, body, #__next {
    position: relative;
    overscroll-behavior: none;
    height: 100%;
    min-height: 100dvh;
    max-height: 100dvh;
    @media (device-width >= 576px) { overflow: hidden; }
  }
  body { will-change: opacity; transform: translateZ(0); }
  * {
    scrollbar-color: ${token.colorFill} transparent;
    scrollbar-width: thin;
    ::-webkit-scrollbar { width: 0.75em; height: 0.75em; }
    ::-webkit-scrollbar-thumb { border-radius: 10px; }
    :hover::-webkit-scrollbar-thumb {
      border: 3px solid transparent;
      background-color: ${token.colorText};
      background-clip: content-box;
    }
    ::-webkit-scrollbar-track { background-color: transparent; }
  }
  html.desktop[data-theme='dark'] body {
    background-color: color-mix(in srgb, ${token.colorBgLayout} 50%, transparent);
  }
  html.desktop[data-theme='light'] body {
    background-color: color-mix(in srgb, ${token.colorBgLayout} 70%, transparent);
  }
  button { -webkit-app-region: no-drag; }
  .${CLASSNAMES.ContextTrigger}[data-popup-open]:not([data-no-highlight]),
  .${CLASSNAMES.DropdownMenuTrigger}[data-popup-open]:not([data-no-highlight]) {
    background: ${token.colorFillTertiary};
  }
  .accordion-action:has(
    .${CLASSNAMES.DropdownMenuTrigger}[data-popup-open]:not([data-no-highlight])
  ) { opacity: 1; }

  /* Smooth sidebar collapse transition */
  .lobe-flex[style*="flex-direction: row"] > *,
  .lobe-flex[style*="--lobe-flex-direction: row"] > * {
    transition: width 0.2s ease, flex 0.2s ease, min-width 0.2s ease !important;
  }

  /* Toggle panel button - only show in expanded sidebar */
  #toggle_left_panel_button {
    opacity: 1 !important;
    width: auto !important;
  }

  /* Disable Activity component cross-fade, use width transition only */
  [data-activity-component="DesktopHomeLayout"],
  [name="DesktopHomeLayout"] {
    animation: none !important;
    transition: none !important;
  }
  
  /* Smooth sidebar width transition */
  [data-activity-component="DesktopHomeLayout"] > div,
  [name="DesktopHomeLayout"] > div {
    transition: none !important;
  }

  /* Remove container padding and border radius causing floating effect */
  .acss-12cbrsv,
  [class*='lobe-flex'][style*='--lobe-flex-padding: 8px'] {
    padding: 0 !important;
    border-radius: 0 !important;
  }
  [style*='--container-border-bottom-right-radius'],
  [style*='--container-border-radius'] {
    --container-border-bottom-right-radius: 0px !important;
    --container-border-radius: 0px !important;
    border-radius: 0 !important;
  }

  /* Sidebar colors - light and dark */
  html[data-theme='dark'] .acss-12lasj6,
  html[data-theme='dark'] [class*='NavPanelDraggable'] {
    background: #212121 !important;
    border-right-color: rgba(255,255,255,0.06) !important;
  }

  /* Dark mode nav item hover */
  html[data-theme='dark'] [class*='NavItem']:hover {
    background: rgba(255,255,255,0.06) !important;
  }

  /* Dark mode accordion */
  html[data-theme='dark'] .accordion-he {
    color: rgba(255,255,255,0.8) !important;
  }

  /* Sidebar #FCFCFC */
  html[data-theme='light'] [class*='NavPanel'],
  html[data-theme='light'] [class*='navPanel'],
  html[data-theme='light'] [class*='SideBar'],
  html[data-theme='light'] aside[class] {
    background: #fcfcfc !important;
    background-color: #fcfcfc !important;
  }

  /* Sidebar nav spacing */
  [class*='NavPanel'] a + a,
  [class*='navPanel'] a + a { margin-top: 2px; }

  /* Search bar white */
  html[data-theme='light'] .ant-input-affix-wrapper,
  html[data-theme='light'] .ant-input {
    background: #ffffff !important;
    background-color: #ffffff !important;
  }

  /* Kill the editor row height — force single row chat input */
  [data-testid="chat-input"] {
    min-height: unset !important;
  }
  [data-testid="chat-input"] > div:first-child:not([class*="footer"]):not([class*="action"]) {
    height: 0 !important;
    min-height: 0 !important;
    max-height: 0 !important;
    overflow: hidden !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
  }

  /* Darker sidebar nav text - broad selectors */
  html[data-theme='light'] aside span,
  html[data-theme='light'] aside a span,
  html[data-theme='light'] aside div span {
    color: #111111 !important;
  }
  html[data-theme='light'] aside svg {
    color: #222222 !important;
  }
  html[data-theme='light'] aside a {
    color: #111111 !important;
  }

  /* Align recents accordion header and labels with nav items */
  .accordion-he,
  [class*='accordion-he'] {
    padding-left: 10px !important;
    padding-inline-start: 10px !important;
  }


`;

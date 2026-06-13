import { CLASSNAMES } from '@lobehub/ui';
import type { Theme } from 'antd-style';
import { css } from 'antd-style';

export default ({ token }: { prefixCls: string; token: Theme }) => css`

  html, body {
    font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif !important;
    font-weight: 450 !important;
    -webkit-font-smoothing: antialiased !important;
    -moz-osx-font-smoothing: grayscale !important;
    letter-spacing: -0.01em !important;
  }

  input, textarea, button, select {
    font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif !important;
  }

  pre, code, kbd, samp {
    font-family: 'GeistMono', 'Fira Code', monospace !important;
  }

  h1, h2, h3 {
    font-weight: 600 !important;
  }

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
  html[data-theme='dark'] [class*='NavPanelDraggable'],
  html[data-theme='dark'] aside {
    background: #1e1e1d !important;
    border-right-color: rgba(255,255,255,0.06) !important;
  }

  /* Dark mode main content */
  html[data-theme='dark'] [class*='contentDark'],
  html[data-theme='dark'] [class*='content-dark'] {
    background: #1f1f1e !important;
  }

  /* Dark mode nav item hover */
  html[data-theme='dark'] [class*='NavItem']:hover {
    background: rgba(255,255,255,0.06) !important;
  }

  /* Dark mode accordion */
  html[data-theme='dark'] .accordion-he {
    color: rgba(255,255,255,0.8) !important;
  }

  /* Dark mode text colors in sidebar */
  html[data-theme='dark'] aside span,
  html[data-theme='dark'] aside a,
  html[data-theme='dark'] aside div span {
    color: #ffffff !important;
  }
  html[data-theme='dark'] aside svg {
    color: rgba(255,255,255,0.7) !important;
  }

  /* Dark mode search modal */
  html[data-theme='dark'] [cmdk-root] {
    background: #2c2c2b !important;
    color: #ececec !important;
  }
  html[data-theme='dark'] [cmdk-input] {
    color: #ececec !important;
  }
  html[data-theme='dark'] [cmdk-item] {
    color: #ffffff !important;
  }
  html[data-theme='dark'] [cmdk-item][aria-selected='true'] {
    background: rgba(255,255,255,0.06) !important;
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
    min-height: 69px !important;
    max-width: 780px !important;
    margin: 0 auto !important;
    background: #ffffff !important;
    border: 1.5px solid rgba(0,0,0,0.06) !important;
    border-radius: 32px !important;
    box-shadow: 0 2px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06) !important;
    height: auto !important;
    max-height: 200px !important;
    overflow-y: auto !important;
    display: flex !important;
    align-items: center !important;
  }
  [data-testid="chat-input"] * {
    align-items: center !important;
    align-self: center !important;
  }

  /* Force the action bar row to be vertically centered */
  [data-testid="chat-input"] [class*="ChatInputActionBar"],
  [data-testid="chat-input"] [class*="chatInputActionBar"] {
    padding-block: 0 !important;
    align-items: center !important;
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

  /* Fix inner editor alignment */
  [data-testid="chat-input"] [class*="acss-1uegmkh"] {
    min-height: 24px !important;
    max-height: 160px !important;
    display: flex !important;
    align-items: center !important;
  }

  [data-testid="chat-input"] [class*="lobe-flex"] {
    align-items: center !important;
  }

  /* Force editor min-height to match single line */
  [data-testid="chat-input"] [draggable="false"] {
    min-height: 24px !important;
    max-height: 160px !important;
    align-items: center !important;
    display: flex !important;
  }
  
  [data-testid="chat-input"] [contenteditable="true"] {
    min-height: 24px !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
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



  /* Dark mode - force all text elements white */
  html[data-theme='dark'] * {
    --lobe-color-text: #ffffff;
    --ant-color-text: #ffffff;
    --ant-color-text-secondary: rgba(255,255,255,0.95);
  }

  /* Athena/model selector button */
  html[data-theme='dark'] button[style*="border-radius: 20px"],
  html[data-theme='dark'] button[style*="border-radius: 16px"] {
    color: #ffffff !important;
    border-color: rgba(255,255,255,0.2) !important;
  }

  /* User name and email bottom left */
  html[data-theme='dark'] [class*='name'],
  html[data-theme='dark'] [class*='email'],
  html[data-theme='dark'] [class*='user'] span,
  html[data-theme='dark'] [class*='User'] span {
    color: #ffffff !important;
  }

  /* Any remaining black text in dark mode */
  html[data-theme='dark'] span[style*="color: rgb(17"],
  html[data-theme='dark'] span[style*="color: #111"],
  html[data-theme='dark'] div[style*="color: #111"] {
    color: #ffffff !important;
  }

  /* Send button - replace icon with up arrow */
  html[data-theme='dark'] .ant-btn-primary svg,
  html[data-theme='light'] .ant-btn-primary svg {
    display: none !important;
  }
  html[data-theme='dark'] .ant-btn-primary::after,
  html[data-theme='light'] .ant-btn-primary::after {
    content: '↑';
    font-size: 16px;
    font-weight: 700;
    line-height: 1;
  }

  /* Mic button more visible in dark mode */
  html[data-theme='dark'] [aria-label="Voice Input"] svg,
  html[data-theme='dark'] [aria-label*="mic"] svg,
  html[data-theme='dark'] [aria-label*="Voice"] svg {
    color: rgba(255,255,255,0.8) !important;
    stroke: rgba(255,255,255,0.8) !important;
  }

  /* Placeholder text left aligned */
  html[data-theme='dark'] [data-testid="chat-input"] [cmdk-input]::placeholder,
  html[data-theme='dark'] [data-testid="chat-input"] input::placeholder {
    color: rgba(255,255,255,0.35) !important;
    text-align: left !important;
  }

  /* Fix editor body position when typing on home page */
  [data-testid="chat-input"] [class*="acss-1uegmkh"],
  [data-testid="chat-input"] [class*="acss-3kh57l"] {
    min-height: 0 !important;
    padding: 0 !important;
  }
  [data-testid="chat-input"] .acss-1pldu16:first-child {
    display: none !important;
  }

  /* Fix editor text position - align with action bar */
  [data-testid="chat-input"] .acss-3kh57l {
    min-height: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
  [data-testid="chat-input"] .acss-158j65s {
    min-height: 0 !important;
    padding: 0 !important;
    line-height: 1.5 !important;
  }
  [data-testid="chat-input"] .acss-1uegmkh {
    padding: 0 !important;
    display: block !important;
    text-align: left !important;
  }
  [data-testid="chat-input"] .acss-3kh57l {
    flex: 1 !important;
    min-width: 0 !important;
    width: 100% !important;
    position: relative !important;
  }
  [data-testid="chat-input"] .acss-3kh57l > * {
    width: 100% !important;
  }

  [data-testid="chat-input"] .acss-158j65s {
    width: 100% !important;
  }
  [data-testid="chat-input"] .acss-158j65s p {
    width: 100% !important;
    text-align: left !important;
  }
  [data-testid="chat-input"] [class*="acss-1pldu16"] {
    left: 0 !important;
    transform: none !important;
    text-align: left !important;
    width: 100% !important;
  }





  /* Delete confirmation modal - Claude style */
  .ant-modal-content {
    border-radius: 16px !important;
    padding: 28px !important;
    box-shadow: 0 8px 40px rgba(0,0,0,0.12) !important;
  }
  .ant-modal-title {
    font-size: 18px !important;
    font-weight: 600 !important;
    color: #111 !important;
    margin-bottom: 8px !important;
  }
  .ant-modal-body p {
    color: rgba(0,0,0,0.5) !important;
    font-size: 14px !important;
  }
  .ant-modal-footer {
    margin-top: 24px !important;
    display: flex !important;
    gap: 8px !important;
    justify-content: flex-end !important;
  }
  .ant-modal-footer .ant-btn {
    border-radius: 20px !important;
    height: 38px !important;
    padding: 0 20px !important;
    font-weight: 500 !important;
    font-size: 14px !important;
  }
  .ant-modal-footer .ant-btn-default {
    border: 1px solid rgba(0,0,0,0.12) !important;
    color: #111 !important;
    background: #fff !important;
  }
  .ant-modal-footer .ant-btn-primary {
    background: #c0392b !important;
    border: none !important;
    color: #fff !important;
  }
  .ant-modal-footer .ant-btn-primary:hover {
    background: #a93226 !important;
  }
  html[data-theme='dark'] .ant-modal-content {
    background: #2c2c2b !important;
  }
  html[data-theme='dark'] .ant-modal-title {
    color: #ffffff !important;
  }
  html[data-theme='dark'] .ant-modal-body p {
    color: rgba(255,255,255,0.5) !important;
  }
  html[data-theme='dark'] .ant-modal-footer .ant-btn-default {
    border-color: rgba(255,255,255,0.12) !important;
    color: #fff !important;
    background: transparent !important;
  }

  /* Delete confirmation modal - Claude style */
  .ant-modal-content {
    border-radius: 16px !important;
    padding: 28px !important;
    box-shadow: 0 8px 40px rgba(0,0,0,0.12) !important;
  }
  .ant-modal-title {
    font-size: 18px !important;
    font-weight: 600 !important;
    color: #111 !important;
    margin-bottom: 8px !important;
  }
  .ant-modal-body p {
    color: rgba(0,0,0,0.5) !important;
    font-size: 14px !important;
  }
  .ant-modal-footer {
    margin-top: 24px !important;
    display: flex !important;
    gap: 8px !important;
    justify-content: flex-end !important;
  }
  .ant-modal-footer .ant-btn {
    border-radius: 20px !important;
    height: 38px !important;
    padding: 0 20px !important;
    font-weight: 500 !important;
    font-size: 14px !important;
  }
  .ant-modal-footer .ant-btn-default {
    border: 1px solid rgba(0,0,0,0.12) !important;
    color: #111 !important;
    background: #fff !important;
  }
  .ant-modal-footer .ant-btn-primary {
    background: #c0392b !important;
    border: none !important;
    color: #fff !important;
  }
  .ant-modal-footer .ant-btn-primary:hover {
    background: #a93226 !important;
  }
  html[data-theme='dark'] .ant-modal-content {
    background: #2c2c2b !important;
  }
  html[data-theme='dark'] .ant-modal-title {
    color: #ffffff !important;
  }
  html[data-theme='dark'] .ant-modal-body p {
    color: rgba(255,255,255,0.5) !important;
  }
  html[data-theme='dark'] .ant-modal-footer .ant-btn-default {
    border-color: rgba(255,255,255,0.12) !important;
    color: #fff !important;
    background: transparent !important;
  }
`;

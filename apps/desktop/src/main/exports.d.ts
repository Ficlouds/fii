import type { DesktopIpcServices } from './controllers/registry';

declare module '@ficlouds/electron-client-ipc' {
   
  interface DesktopIpcServicesMap extends DesktopIpcServices {}
}

export { type DesktopIpcServices } from './controllers/registry';

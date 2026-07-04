// Electron IPC utility — desktop-ipc-typings package replaced with local stub
// Full Electron desktop implementation deferred to future Fi Desktop phase

type DesktopIpcServices = Record<string, any>;

export const ensureElectronIpc = (): DesktopIpcServices => {
  if (typeof window === 'undefined') return {} as DesktopIpcServices;
  return (window as any).electronIpc ?? ({} as DesktopIpcServices);
};

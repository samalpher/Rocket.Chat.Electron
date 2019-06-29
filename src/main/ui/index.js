import { useMainWindow } from './mainWindow';


export const useUI = () => {
	useMainWindow();
};

export * from './contextMenu';
export * from './dock';
export * from './mainWindow';
export * from './menus';
export * from './touchBar';
export * from './tray';

import { useMainWindow } from './mainWindow';
import { emptyMenus } from './menus';


export const useUI = () => {
	useMainWindow();
	emptyMenus();
};

export * from './dock';
export * from './mainWindow';
export * from './menus';
export * from './touchBar';
export * from './tray';

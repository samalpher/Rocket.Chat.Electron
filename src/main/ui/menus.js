import { app, Menu } from 'electron';
import { t } from 'i18next';

export const emptyMenus = () => {
	if (process.platform !== 'darwin') {
		Menu.setApplicationMenu(null);
		return;
	}

	const emptyMenuTemplate = [{
		label: app.getName(),
		submenu: [
			{
				label: t('menus.quit', { appName: app.getName() }),
				accelerator: 'CommandOrControl+Q',
				click: () => app.quit(),
			},
		],
	}];
	Menu.setApplicationMenu(Menu.buildFromTemplate(emptyMenuTemplate));
};

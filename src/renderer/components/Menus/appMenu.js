import { remote } from 'electron';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useActions } from './actions';


export const useAppMenuTemplate = () => {
	const appName = remote.app.getName();

	const { t } = useTranslation();

	const {
		onClickAbout,
		onClickAddNewServer,
		onClickQuit,
	} = useActions();

	return useMemo(() => ({
		label: process.platform === 'darwin' ? appName : t('menus.fileMenu'),
		submenu: [
			...(process.platform === 'darwin' ? [
				{
					label: t('menus.about', { appName }),
					click: onClickAbout,
				},
				{ type: 'separator' },
				{
					submenu: [],
					role: 'services',
				},
				{ type: 'separator' },
				{
					accelerator: 'Command+H',
					role: 'hide',
				},
				{
					accelerator: 'Command+Alt+H',
					role: 'hideothers',
				},
				{
					role: 'unhide',
				},
				{ type: 'separator' },
			] : []),
			...(process.platform !== 'darwin' ? [
				{
					label: t('menus.addNewServer'),
					accelerator: 'CommandOrControl+N',
					click: onClickAddNewServer,
				},
			] : []),
			{ type: 'separator' },
			{
				label: t('menus.quit', { appName }),
				accelerator: 'CommandOrControl+Q',
				click: onClickQuit,
			},
		],
	}), []);
};

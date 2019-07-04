import { t } from 'i18next';
import { useSelector } from 'react-redux';
import { useActions } from './actions';


export const useWindowMenuTemplate = () => {
	const {
		onClickAddNewServer,
		onClickSelectServer,
		onClickReloadApp,
		onClickToggleAppDevTools,
		onClickShowWindowOnUnreadChanged,
	} = useActions();

	return useSelector(({
		servers,
		view: {
			url: activeServerUrl,
		} = {},
		preferences: {
			showWindowOnUnreadChanged,
		},
	}) => ({
		label: t('menus.windowMenu'),
		role: 'window',
		submenu: [
			...(process.platform === 'darwin' ? [
				{
					label: t('menus.addNewServer'),
					accelerator: 'CommandOrControl+N',
					click: onClickAddNewServer,
				},
				{ type: 'separator' },
			] : []),
			...servers.map((server, i) => ({
				label: (server.title && server.title.replace(/&/g, '&&')) || server.url,
				type: server.url === activeServerUrl ? 'radio' : 'normal',
				checked: server.url === activeServerUrl,
				accelerator: `CommandOrControl+${ i + 1 }`,
				click: onClickSelectServer.bind(null, server),
			})),
			{ type: 'separator' },
			{
				label: t('menus.reload'),
				accelerator: 'CommandOrControl+Shift+R',
				click: onClickReloadApp,
			},
			{
				label: t('menus.toggleDevTools'),
				click: onClickToggleAppDevTools,
			},
			{ type: 'separator' },
			{
				label: t('menus.showOnUnreadMessage'),
				type: 'checkbox',
				checked: showWindowOnUnreadChanged,
				click: onClickShowWindowOnUnreadChanged,
			},
			{ type: 'separator' },
			{
				label: t('menus.minimize'),
				accelerator: 'CommandOrControl+M',
				role: 'minimize',
			},
			...(process.platform === 'darwin' ? [
				{
					label: t('menus.showFullScreen'),
					accelerator: 'Control+Command+F',
					role: 'toggleFullScreen',
				},
			] : []),
			{
				label: t('menus.close'),
				accelerator: 'CommandOrControl+W',
				role: 'close',
			},
		],
	}));
};

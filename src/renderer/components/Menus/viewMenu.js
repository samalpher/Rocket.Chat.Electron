import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useActions } from './actions';


export const useViewMenuTemplate = () => {
	const { t } = useTranslation();

	const {
		onClickReload,
		onClickReloadIgnoringCache,
		onClickClearTrustedCertificates,
		onClickOpenDevTools,
		onClickGoBack,
		onClickGoForward,
		onClickShowTray,
		onClickShowMenus,
		onClickShowSidebar,
		onClickResetZoom,
		onClickZoomIn,
		onClickZoomOut,
	} = useActions();

	return useSelector(({
		historyFlags: {
			canGoBack,
			canGoForward,
		},
		preferences: {
			hasTray,
			hasMenus,
			hasSidebar,
		},
	}) => ({
		label: t('menus.viewMenu'),
		submenu: [
			{
				label: t('menus.reload'),
				accelerator: 'CommandOrControl+R',
				click: onClickReload,
			},
			{
				label: t('menus.reloadIgnoringCache'),
				click: onClickReloadIgnoringCache,
			},
			{
				label: t('menus.clearTrustedCertificates'),
				click: onClickClearTrustedCertificates,
			},
			{
				label: t('menus.openDevTools'),
				accelerator: process.platform === 'darwin' ? 'Command+Alt+I' : 'Ctrl+Shift+I',
				click: onClickOpenDevTools,
			},
			{ type: 'separator' },
			{
				label: t('menus.back'),
				accelerator: process.platform === 'darwin' ? 'Command+[' : 'Alt+Left',
				enabled: canGoBack,
				click: onClickGoBack,
			},
			{
				label: t('menus.forward'),
				accelerator: process.platform === 'darwin' ? 'Command+]' : 'Alt+Right',
				enabled: canGoForward,
				click: onClickGoForward,
			},
			{ type: 'separator' },
			{
				label: t('menus.showTrayIcon'),
				type: 'checkbox',
				checked: hasTray,
				click: onClickShowTray,
			},
			...(process.platform !== 'darwin' ? [
				{
					label: t('menus.showMenuBar'),
					type: 'checkbox',
					checked: hasMenus,
					click: onClickShowMenus,
				},
			] : []),
			{
				label: t('menus.showServerList'),
				type: 'checkbox',
				checked: hasSidebar,
				click: onClickShowSidebar,
			},
			{ type: 'separator' },
			{
				label: t('menus.resetZoom'),
				accelerator: 'CommandOrControl+0',
				click: onClickResetZoom,
			},
			{
				label: t('menus.zoomIn'),
				accelerator: 'CommandOrControl+Plus',
				click: onClickZoomIn,
			},
			{
				label: t('menus.zoomOut'),
				accelerator: 'CommandOrControl+-',
				click: onClickZoomOut,
			},
		],
	}));
};

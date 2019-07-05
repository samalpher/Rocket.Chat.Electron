import { remote } from 'electron';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { showMainWindow, hideMainWindow } from '../../../actions';
import { useGlobalBadge } from '../../hooks/globalBadge';
import { useIcon } from '../../hooks/icon';
import { useMenu } from '../../hooks/menu';


export function Tray() {
	const visible = useSelector(({ preferences: { hasTray } }) => hasTray);

	const globalBadge = useGlobalBadge();

	const windowVisible = useSelector(({ mainWindow: { isHidden } }) => !isHidden);

	const dispatch = useDispatch();

	const icon = useIcon(false, globalBadge);

	const trayRef = useRef();

	const onClickActivate = () => {
		dispatch(windowVisible ? hideMainWindow() : showMainWindow());
	};

	const onClickQuit = () => {
		remote.app.quit();
	};

	const onClick = () => {
		onClickActivate(windowVisible);
	};

	const { t } = useTranslation();

	const template = useMemo(() => [
		{
			label: !windowVisible ? t('tray.menu.show') : t('tray.menu.hide'),
			click: onClickActivate.bind(null, windowVisible),
		},
		{
			label: t('tray.menu.quit'),
			click: onClickQuit,
		},
	], [windowVisible]);

	const menu = useMenu(template);

	useEffect(() => {
		if (!visible) {
			trayRef.current && trayRef.current.destroy();
			trayRef.current = null;
			return;
		}

		const trayIcon = new remote.Tray(icon);
		trayIcon.on('click', onClick);
		trayIcon.on('right-click', (event, bounds) => trayIcon.popUpContextMenu(undefined, bounds));
		trayRef.current = trayIcon;
	}, [visible]);

	useEffect(() => {
		if (process.platform !== 'darwin' && !trayRef.current) {
			return;
		}

		trayRef.current.setImage(icon);
	}, [trayRef.current, icon]);

	useEffect(() => {
		if (process.platform !== 'darwin' && !trayRef.current) {
			return;
		}

		const title = Number.isInteger(globalBadge) ? String(globalBadge) : '';
		trayRef.current.setTitle(title);
	}, [trayRef.current, globalBadge]);

	useEffect(() => {
		if (!trayRef.current) {
			return;
		}

		const appName = remote.app.getName();

		if (globalBadge === '•') {
			trayRef.current.setToolTip(t('tray.tooltip.unreadMessage', { appName }));
		} else if (Number.isInteger(globalBadge)) {
			trayRef.current.setToolTip(t('tray.tooltip.unreadMention', { appName, count: globalBadge }));
		} else {
			trayRef.current.setToolTip(t('tray.tooltip.noUnreadMessage', { appName }));
		}
	}, [trayRef.current, globalBadge]);

	useEffect(() => {
		if (!trayRef.current) {
			return;
		}

		trayRef.current.setContextMenu(menu);
	}, [trayRef.current, menu]);

	useEffect(() => () => {
		trayRef.current && trayRef.current.destroy();
	}, []);

	return null;
}

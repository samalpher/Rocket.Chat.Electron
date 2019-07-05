import { remote } from 'electron';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { showMainWindow, hideMainWindow } from '../../../actions';
import { useIcon } from '../../hooks/icon';
import { useMenu } from '../../hooks/menu';


export function Tray() {
	const visible = useSelector(({ preferences: { hasTray } }) => hasTray);

	const badge = useSelector(({ servers }) => {
		const badges = servers.map(({ badge }) => badge);
		const mentionCount = (
			badges
				.filter((badge) => Number.isInteger(badge))
				.reduce((sum, count) => sum + count, 0)
		);
		return mentionCount || (badges.some((badge) => !!badge) && '•') || null;
	});

	const windowVisible = useSelector(({ mainWindow: { isHidden } }) => !isHidden);

	const dispatch = useDispatch();

	const icon = useIcon(false, badge);

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

		const title = Number.isInteger(badge) ? String(badge) : '';
		trayRef.current.setTitle(title);
	}, [trayRef.current, badge]);

	useEffect(() => {
		if (!trayRef.current) {
			return;
		}

		const appName = remote.app.getName();

		if (badge === '•') {
			trayRef.current.setToolTip(t('tray.tooltip.unreadMessage', { appName }));
		} else if (Number.isInteger(badge)) {
			trayRef.current.setToolTip(t('tray.tooltip.unreadMention', { appName, count: badge }));
		} else {
			trayRef.current.setToolTip(t('tray.tooltip.noUnreadMessage', { appName }));
		}
	}, [trayRef.current, badge]);

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

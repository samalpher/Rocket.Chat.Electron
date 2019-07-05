import { remote } from 'electron';
import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useIcon } from '../../hooks/icon';


export function MainWindow({ children }) {
	const mainWindow = useMemo(() => remote.getCurrentWindow(), []);

	const [hasMenus, hasTray] = useSelector(({
		preferences: {
			hasMenus,
			hasTray,
		},
	}) => [hasMenus, hasTray]);

	const badge = useSelector(({ servers }) => {
		const badges = servers.map(({ badge }) => badge);
		const mentionCount = (
			badges
				.filter((badge) => Number.isInteger(badge))
				.reduce((sum, count) => sum + count, 0)
		);
		return mentionCount || (badges.some((badge) => !!badge) && '•') || null;
	});

	useEffect(() => {
		if (process.platform !== 'darwin') {
			mainWindow.setAutoHideMenuBar(!hasMenus);
			mainWindow.setMenuBarVisibility(!!hasMenus);
		}
	}, [hasMenus]);

	const icon = useIcon(hasTray, badge);

	useEffect(() => {
		if (process.platform === 'darwin') {
			return;
		}

		mainWindow.setIcon(icon);
	}, [icon]);

	useEffect(() => {
		const count = Number.isInteger(badge) ? badge : 0;
		if (!mainWindow.isFocused()) {
			mainWindow.flashFrame(count > 0);
			mainWindow.once('focus', () => mainWindow.flashFrame(false));
		}

		return () => {
			mainWindow.flashFrame(false);
		};
	}, [badge, mainWindow]);

	return <>
		{children}
	</>;
}

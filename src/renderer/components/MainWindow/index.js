import { remote } from 'electron';
import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGlobalBadge } from '../../hooks/globalBadge';
import { useIcon } from '../../hooks/icon';


export function MainWindow({ children }) {
	const mainWindow = useMemo(() => remote.getCurrentWindow(), []);

	const [hasMenus, hasTray] = useSelector(({
		preferences: {
			hasMenus,
			hasTray,
		},
	}) => [hasMenus, hasTray]);

	const globalBadge = useGlobalBadge();

	useEffect(() => {
		if (process.platform !== 'darwin') {
			mainWindow.setAutoHideMenuBar(!hasMenus);
			mainWindow.setMenuBarVisibility(!!hasMenus);
		}
	}, [hasMenus]);

	const icon = useIcon(hasTray, globalBadge);

	useEffect(() => {
		if (process.platform === 'darwin') {
			return;
		}

		mainWindow.setIcon(icon);
	}, [icon]);

	useEffect(() => {
		const count = Number.isInteger(globalBadge) ? globalBadge : 0;
		if (!mainWindow.isFocused()) {
			mainWindow.flashFrame(count > 0);
			mainWindow.once('focus', () => mainWindow.flashFrame(false));
		}

		return () => {
			mainWindow.flashFrame(false);
		};
	}, [globalBadge, mainWindow]);

	return <>
		{children}
	</>;
}

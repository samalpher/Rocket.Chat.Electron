import React, { useEffect } from 'react';
import useMainWindow from '../../hooks/useMainWindow';
import useActionRequests from './hooks/useActionRequests';
import useGlobalBadgeChange from './hooks/useGlobalBadgeChange';
import useMenus from './hooks/useMenus';
import useStateChange from './hooks/useStateChange';
import useSideEffects from './hooks/useSideEffects';


export function MainWindow({ children }) {
	const mainWindow = useMainWindow();

	useActionRequests(mainWindow);
	useGlobalBadgeChange(mainWindow);
	useMenus(mainWindow);
	useStateChange(mainWindow);
	useSideEffects(mainWindow);

	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			mainWindow.webContents.openDevTools();
		}
	}, []);

	useEffect(() => () => {
		mainWindow.removeAllListeners();
	}, []);

	return <>
		{children}
	</>;
}

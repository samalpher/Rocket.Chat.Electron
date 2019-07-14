import { useEffect } from 'react';
import { useSelector } from 'react-redux';


export default (mainWindow) => {
	const hasMenus = useSelector(({
		preferences: {
			hasMenus,
		},
	}) => hasMenus);

	useEffect(() => {
		if (process.platform === 'darwin') {
			return;
		}

		mainWindow.setAutoHideMenuBar(!hasMenus);
		mainWindow.setMenuBarVisibility(!!hasMenus);
	}, [hasMenus]);
};

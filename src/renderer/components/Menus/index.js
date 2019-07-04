import { remote } from 'electron';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTemplate } from './hooks';


export function Menus() {
	const template = useTemplate();

	useEffect(() => {
		const menu = remote.Menu.buildFromTemplate(template);
		remote.Menu.setApplicationMenu(menu);
	}, [template]);

	const hasMenus = useSelector(({ preferences: { hasMenus } }) => hasMenus);

	useEffect(() => {
		if (process.platform !== 'darwin') {
			remote.getCurrentWindow().setAutoHideMenuBar(!hasMenus);
			remote.getCurrentWindow().setMenuBarVisibility(!!hasMenus);
		}
	}, [hasMenus]);

	useEffect(() => () => {
		remote.Menu.setApplicationMenu(null);
	}, []);

	return null;
}

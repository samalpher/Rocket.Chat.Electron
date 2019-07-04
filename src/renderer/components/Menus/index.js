import { remote } from 'electron';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTemplate } from './hooks';
import { ApplicationMenu } from '../ApplicationMenu';


export function Menus() {
	const template = useTemplate();

	const hasMenus = useSelector(({ preferences: { hasMenus } }) => hasMenus);

	useEffect(() => {
		if (process.platform !== 'darwin') {
			remote.getCurrentWindow().setAutoHideMenuBar(!hasMenus);
			remote.getCurrentWindow().setMenuBarVisibility(!!hasMenus);
		}
	}, [hasMenus]);

	return <ApplicationMenu template={template} />;
}

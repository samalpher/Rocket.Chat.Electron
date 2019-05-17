import { remote } from 'electron';
import React, { useEffect } from 'react';
import { App } from '../App';
const { dock, menus, touchBar, tray } = remote.require('./main');


const mountRemoteModules = () => {
	dock.mount();
	menus.mount();
	touchBar.mount();
	tray.mount();
};

const unmountRemoteModules = () => {
	dock.unmount();
	menus.unmount();
	touchBar.unmount();
	tray.unmount();
};

export function RendererApp() {
	useEffect(() => {
		mountRemoteModules();
		return () => unmountRemoteModules();
	}, []);

	return (
		<App>
			{null}
		</App>
	);
}

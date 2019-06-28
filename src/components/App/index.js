import { remote } from 'electron';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { Shell } from '../Shell';
const { dock, menus, touchBar, tray } = remote.require('./main');


export function App() {
	useEffect(() => {
		dock.mount();
		menus.mount();
		touchBar.mount();
		tray.mount();

		return () => {
			dock.unmount();
			menus.unmount();
			touchBar.unmount();
			tray.unmount();
		};
	}, []);

	return (
		<Provider store={store}>
			<Shell />
		</Provider>
	);
}

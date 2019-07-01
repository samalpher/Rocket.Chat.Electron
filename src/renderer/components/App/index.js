import { remote } from 'electron';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { getStore } from '../../store';
import { Shell } from '../Shell';
import { LoadingSplash } from '../LoadingSplash';
import { Dock } from '../Dock';
const { dock, menus, touchBar, tray } = remote.require('./main');


const AsyncStoreProvider = React.lazy(async () => {
	const store = await getStore();

	const AsyncStoreProvider = (props) =>
		<Provider store={store} {...props} />;

	return { default: AsyncStoreProvider };
});

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
		<React.Suspense fallback={<LoadingSplash visible />}>
			<AsyncStoreProvider>
				<Shell />
				<Dock />
			</AsyncStoreProvider>
		</React.Suspense>
	);
}

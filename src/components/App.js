import { remote } from 'electron';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { DragRegion } from './DragRegion';
import { Preloader } from './Preloader';
import { AboutModal } from './modals/AboutModal';
import { ScreenshareModal } from './modals/ScreenshareModal';
import { UpdateModal } from './modals/UpdateModal';
import { DownloadsView } from './views/DownloadsView';
import { LandingView } from './views/LandingView';
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

const Sidebar = () => (
	<div className="sidebar sidebar--hidden">
		<div className="sidebar__inner">
			<ol className="sidebar__list sidebar__server-list">
			</ol>
			<button className="sidebar__action sidebar__add-server" data-tooltip="Add server">
				<span className="sidebar__action-label">+</span>
			</button>
		</div>
		<div className="sidebar__submenu">
			<button className="sidebar__submenu-action" data-tooltip="Open download manager">
				<span className="sidebar__action-label">⇊</span>
			</button>
		</div>
	</div>
);

const Views = ({ children }) => (
	<div className="Views" style={{ width: 'calc(100vw - 68px)', height: '100vh', position: 'relative', left: '68px' }}>
		{children}
	</div>
);

const WebviewsView = () => (
	<div className="Webviews" />
);

const PreferencesView = () => null;

export function App() {
	useEffect(() => {
		mountRemoteModules();
		return () => unmountRemoteModules();
	}, []);

	return (
		<Provider store={store}>
			<div className="app-page">
				<DragRegion />

				<Preloader>
					<Sidebar />
					<Views>
						<LandingView />
						<WebviewsView />
						<DownloadsView />
						<PreferencesView />
					</Views>
				</Preloader>

				<AboutModal />
				<UpdateModal />
				<ScreenshareModal />
			</div>
		</Provider>
	);
}

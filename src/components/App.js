import { remote } from 'electron';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { DragRegion } from './DragRegion';
import { Preloader } from './Preloader';
import { AboutModal } from './modals/AboutModal';
import { ScreenshareModal } from './modals/ScreenshareModal';
import { UpdateModal } from './modals/UpdateModal';
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
	<div className="Views" style={{ display: 'flex', alignItems: 'stretch', height: '100vh' }}>
		{children}
	</div>
);

const Webviews = () => (
	<div className="Webviews" />
);

const Downloads = () => (
	<div className="app-download-manager" style={{ display: 'none' }} data-tooltip="Show Download manager">
		<div className="app-download-manager-actions">
			<div className="app-download-manager-title"><b>Downloads</b></div>
			<button className="app-download-manager-clear-action" data-tooltip="Clear download list">
				Clear all items
			</button>
		</div>
		<div className="app-download-manager-items">
			{/* place download items*/}
		</div>
	</div>
);

const Preferences = () => null;

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
						<Webviews />
						<Downloads />
						<Preferences />
					</Views>
				</Preloader>

				<AboutModal />
				<UpdateModal />
				<ScreenshareModal />
			</div>
		</Provider>
	);
}

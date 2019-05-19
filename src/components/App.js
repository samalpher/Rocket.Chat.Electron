import { remote } from 'electron';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { DragRegion } from './DragRegion';
import { Preloader } from './Preloader';
import { ScreenshareModal } from './modals/ScreenshareModal';
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
	<div className="Views">
		{children}
	</div>
);

const Landing = () => (
	<section className="landing">
		<div className="landing__wrapper">
			<div>
				<img className="landing__logo" src="./images/logo-dark.svg" />
			</div>
			<form className="landing__form" method="/">
				<h2 className="landing__form-prompt">Enter your server URL</h2>
				<div>
					<input type="text" name="server-url" placeholder="https://open.rocket.chat" dir="auto" className="landing__form-host-field" />
				</div>
				<div className="landing__form-error" />
				<div>
					<button type="submit" className="button primary login landing__form-submit-button">Connect</button>
				</div>
			</form>
		</div>
	</section>
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

const AboutModal = () => (
	<dialog className="about-modal modal">
		<section className="app-info">
			<div className="app-logo">
				<img src="./images/logo.svg" />
			</div>
			<div className="app-version">
				Version <span className="version">%s</span>
			</div>
		</section>
		<section className="updates hidden">
			<button className="check-for-updates button primary">
				Check for Updates
			</button>
			<div className="checking-for-updates hidden">
				<span className="dot" />
				<span className="dot" />
				<span className="dot" />
				<span className="message" />
			</div>
			<label className="check-for-updates-on-start__label">
				<input className="check-for-updates-on-start" type="checkbox" defaultChecked /> <span>Check for Updates on Start</span>
			</label>
		</section>
		<div className="copyright" />
		<div className="modal__actions">
			<button className="button primary ok">OK</button>
		</div>
	</dialog>
);

const UpdateModal = () => (
	<dialog className="update-modal modal">
		<div className="update-content">
			<h1 className="update-title">New Update is Available</h1>
			<p className="update-message">A new version of the Rocket.Chat Desktop App is available!</p>
			<div className="update-info">
				<div className="app-version current-version">
					<div className="app-version-label">Current Version:</div>
					<div className="app-version-value">a.b.c</div>
				</div>
				<div className="update-arrow">→</div>
				<div className="app-version new-version">
					<div className="app-version-label">New Version:</div>
					<div className="app-version-value">x.y.z</div>
				</div>
			</div>
		</div>
		<div className="modal__actions">
			<button className="update-skip-action button secondary modal__action--special">Skip This Version</button>
			<button className="update-remind-action button secondary">Remind Me Later</button>
			<button className="update-install-action button primary">Install Update</button>
		</div>
	</dialog>
);

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
						<Landing />
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

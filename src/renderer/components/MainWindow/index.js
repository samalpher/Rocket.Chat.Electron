import { remote } from 'electron';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { takeEvery } from 'redux-saga/effects';
import { useGlobalBadge } from '../../hooks/globalBadge';
import { useIcon } from '../../hooks/icon';
import { useSaga } from '../App/SagaMiddlewareProvider';
import { RELOAD_MAIN_WINDOW, TOGGLE_DEV_TOOLS_ON_MAIN_WINDOW } from '../../../actions';


export function MainWindow({ children }) {
	const [hasMenus, hasTray, showWindowOnUnreadChanged] = useSelector(({
		preferences: {
			hasMenus,
			hasTray,
			showWindowOnUnreadChanged,
		},
	}) => [hasMenus, hasTray, showWindowOnUnreadChanged]);

	useEffect(() => {
		if (process.platform === 'darwin') {
			return;
		}

		const mainWindow = remote.getCurrentWindow();
		mainWindow.setAutoHideMenuBar(!hasMenus);
		mainWindow.setMenuBarVisibility(!!hasMenus);
	}, [hasMenus]);

	const globalBadge = useGlobalBadge();

	const icon = useIcon(hasTray, globalBadge);

	useEffect(() => {
		if (process.platform === 'darwin') {
			return;
		}

		const mainWindow = remote.getCurrentWindow();
		mainWindow.setIcon(icon);
	}, [icon]);

	useEffect(() => {
		const mainWindow = remote.getCurrentWindow();
		const count = Number.isInteger(globalBadge) ? globalBadge : 0;
		if (!mainWindow.isFocused()) {
			mainWindow.flashFrame(count > 0);
			mainWindow.once('focus', () => mainWindow.flashFrame(false));
		}
	}, [globalBadge]);

	useEffect(() => {
		if (!showWindowOnUnreadChanged) {
			return;
		}

		const count = Number.isInteger(globalBadge) ? globalBadge : 0;
		if (count > 0) {
			remote.getCurrentWindow().showInactive();
		}
	}, [globalBadge, showWindowOnUnreadChanged]);

	useSaga(function* () {
		yield takeEvery(RELOAD_MAIN_WINDOW, function* () {
			remote.getCurrentWindow().reload();
		});

		yield takeEvery(TOGGLE_DEV_TOOLS_ON_MAIN_WINDOW, function* () {
			remote.getCurrentWindow().toggleDevTools();
		});
	}, []);

	useEffect(() => () => {
		remote.getCurrentWindow().removeAllListeners();
	}, []);

	return <>
		{children}
	</>;
}

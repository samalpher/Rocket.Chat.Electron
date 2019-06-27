import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	loadingDone,
	webviewCreated,
	webviewDestroyed,
	triggerContextMenu,
	setServerProperties,
	historyFlagsUpdated,
} from '../../../store/actions';
import { Webview } from '../../Webview';


const useRedux = () => {
	const state = useSelector(({ view, servers }) => ({ view, servers }));

	const dispatch = useDispatch();

	const handleAllReady = () => {
		dispatch(loadingDone());
	};

	return {
		...state,
		handleAllReady,
	};
};

export function WebviewsView() {
	const {
		view,
		servers: propServers,
		handleAllReady,
	} = useRedux();

	const [servers, setServers] = useState([]);
	const [readyState, setReadyState] = useState({});

	useEffect(() => {
		const propUrls = propServers.map(({ url }) => url);
		const urls = servers.map(({ url }) => url);
		const newServers = [
			...servers.filter(({ url }) => propUrls.includes(url)),
			...propServers.filter(({ url }) => !urls.includes(url)),
		];
		const newReadyState = newServers.reduce((state, server) => ({
			...state,
			ready: server.ready || false,
		}), {});

		setServers(newServers);
		setReadyState(newReadyState);
	}, [propServers.map(({ url }) => url).join('')]);

	useEffect(() => {
		if (handleAllReady && Object.values(readyState).every((ready) => ready)) {
			handleAllReady();
		}
	}, [readyState]);

	const dispatch = useDispatch();

	const handleCreate = (url, webContents) => {
		dispatch(webviewCreated(url, webContents.id));
	};

	const handleDestroy = (url, webContents) => {
		dispatch(webviewDestroyed(url, webContents.id));
	};

	const handleContextMenu = (url, webContents, params) => {
		dispatch(triggerContextMenu(params));
	};

	const handleDidNavigate = (url, webContents, lastPath) => {
		dispatch(setServerProperties({ url, lastPath }));
		dispatch(historyFlagsUpdated({
			canGoBack: webContents.canGoBack(),
			canGoForward: webContents.canGoForward(),
		}));
	};

	const handleReady = (url) => {
		setReadyState({ ...readyState, [url]: true });
	};

	return (
		<>
		{servers.map((server, i) => (
			<Webview
				key={i}
				visible={server.url === view.url}
				lastPath={server.lastPath}
				url={server.url}
				onCreate={handleCreate}
				onDestroy={handleDestroy}
				onContextMenu={handleContextMenu}
				onDidNavigate={handleDidNavigate}
				onReady={handleReady}
			/>
		))}
		</>
	);
}

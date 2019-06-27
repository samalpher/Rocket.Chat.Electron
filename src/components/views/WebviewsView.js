import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { View } from '../View';
import { Webview } from '../Webview';
import { loadingDone, webviewCreated, webviewDestroyed, triggerContextMenu, setServerProperties, historyFlagsUpdated } from '../../store/actions';


const mapStateToProps = ({ view, servers }) => ({ view, servers });

const mapDispatchToProps = (dispatch) => ({
	onReady: () => dispatch(loadingDone()),
});

export const WebviewsView = connect(mapStateToProps, mapDispatchToProps)(
	function WebviewsView({ view, servers: propServers, onReady }) {
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
			if (onReady && Object.values(readyState).every((ready) => ready)) {
				onReady();
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
			<View visible={!!view.url}>
				{servers.map((server, i) => (
					<Webview
						key={i}
						active={server.url === view.url}
						lastPath={server.lastPath}
						url={server.url}
						onCreate={handleCreate}
						onDestroy={handleDestroy}
						onContextMenu={handleContextMenu}
						onDidNavigate={handleDidNavigate}
						onReady={handleReady}
					/>
				))}
			</View>
		);
	}
);

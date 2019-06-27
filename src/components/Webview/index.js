import React, { useRef } from 'react';
import { ServerLoadingError } from '../ServerLoadingError';
import { useWebviewReloadFromError, useWebviewLifeCycle, useWebviewFocus, useWebviewContextMenu, useWebviewConsole, useWebviewLoadState, useWebviewActions } from './hooks';
import { WebviewComponent } from './styles';


export function Webview({
	active,
	lastPath,
	url,
	onCreate,
	onDestroy,
	onFocus,
	onContextMenu,
	onReady,
	onDidNavigate,
}) {
	const webviewRef = useRef(null);

	useWebviewLifeCycle(url, webviewRef, onCreate, onDestroy);
	useWebviewFocus(url, webviewRef, onFocus);
	useWebviewContextMenu(url, webviewRef, onContextMenu);
	useWebviewConsole(url, webviewRef);
	const loadingError = useWebviewLoadState(url, webviewRef, onReady, onDidNavigate);
	useWebviewActions(url, webviewRef);
	const handleReloadFromError = useWebviewReloadFromError(url, webviewRef);

	return (
		<>
			<WebviewComponent
				ref={webviewRef}
				preload="../preload.js"
				allowpopups="true"
				disablewebsecurity="true"
				src={lastPath || url}
				active={active && !loadingError}
			/>
			<ServerLoadingError
				visible={active && loadingError}
				onReload={handleReloadFromError}
			/>
		</>
	);
}

import React, { useRef } from 'react';
import { ServerLoadingError } from './ServerLoadingError';
import {
	useWebviewLifeCycle,
	useWebviewFocus,
	useWebviewContextMenu,
	useWebviewConsole,
	useWebviewLoadState,
	useWebviewActions,
	useWebviewReloadFromError,
} from './hooks';
import { WebviewComponent } from './styles';
import { View } from '../View';


export function Webview({
	lastPath,
	url,
	visible,
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
	const [loading, loadingError] = useWebviewLoadState(url, webviewRef, onReady, onDidNavigate);
	useWebviewActions(url, webviewRef);
	const handleReloadFromError = useWebviewReloadFromError(url, webviewRef);

	return (
		<View visible={visible}>
			<View visible={!loadingError}>
				<WebviewComponent
					ref={webviewRef}
					preload="../preload.js"
					allowpopups="true"
					disablewebsecurity="true"
					src={lastPath || url}
				/>
			</View>
			<View visible={loadingError}>
				{loadingError && (
					<ServerLoadingError
						loading={loading}
						onReload={handleReloadFromError}
					/>
				)}
			</View>
		</View>
	);
}

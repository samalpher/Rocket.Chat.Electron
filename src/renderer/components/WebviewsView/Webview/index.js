import React from 'react';
import { View } from '../../View';
import { getPathFromApp } from '../../../../utils';
import { useWebview } from './hooks';
import { WebviewComponent } from './styles';
import { ServerLoadingError } from './ServerLoadingError';
import { ContextMenu } from './ContextMenu';


export function Webview({
	visible,
	...props
}) {
	const {
		webviewRef,
		contextMenuRef,
		loading,
		loadingError,
		handleReloadFromError,
	} = useWebview(props);

	const preloadUrl = `file://${ getPathFromApp('preload.js') }`;

	return <>
		<View visible={visible && !loadingError}>
			<WebviewComponent
				ref={webviewRef}
				preload={preloadUrl}
				allowpopups="true"
				disablewebsecurity="true"
			/>
		</View>
		{loadingError && (
			<ServerLoadingError
				visible={visible && loadingError}
				loading={loading}
				onReload={handleReloadFromError}
			/>
		)}
		{visible && !loadingError && <ContextMenu ref={contextMenuRef} />}
	</>;
}

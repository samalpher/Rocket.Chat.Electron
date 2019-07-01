import React from 'react';
import { View } from '../../View';
import { getPathFromApp } from '../../../../utils';
import { useWebview } from './hooks';
import { WebviewComponent } from './styles';
import { ServerLoadingError } from './ServerLoadingError';


export function Webview({
	visible,
	...props
}) {
	const {
		webviewRef,
		loading,
		loadingError,
		handleReloadFromError,
	} = useWebview(props);

	const preloadUrl = `file://${ getPathFromApp('preload.js') }`;

	return (
		<>
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
		</>
	);
}

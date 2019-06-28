import React from 'react';
import { View } from '../View';
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

	return (
		<>
			<View visible={visible && !loadingError}>
				<WebviewComponent
					ref={webviewRef}
					preload="../preload.js"
					allowpopups="true"
					disablewebsecurity="true"
				/>
			</View>
			<View visible={visible && loadingError}>
				{loadingError && (
					<ServerLoadingError
						loading={loading}
						onReload={handleReloadFromError}
					/>
				)}
			</View>
		</>
	);
}

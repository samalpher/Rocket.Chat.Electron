import React from 'react';
import { Webview } from './Webview';
import { useWebviews } from './hooks';


export function WebviewsView() {
	const webviews = useWebviews();

	return (
		<>
			{webviews.map((props, key) => (
				<Webview key={key} {...props} />
			))}
		</>
	);
}

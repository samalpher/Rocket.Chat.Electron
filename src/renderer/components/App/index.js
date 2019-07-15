import React from 'react';
import { Shell } from '../Shell';
import { LoadingSplash } from '../LoadingSplash';
import { Dock } from '../Dock';
import { Menus } from '../Menus';
import { StoreProvider } from './StoreProvider';
import { SagaMiddlewareProvider } from './SagaMiddlewareProvider';
import { Tray } from '../Tray';
import { TouchBar } from '../TouchBar';
import { MainWindow } from '../MainWindow';
import { DeepLinksRouter } from './DeepLinksRouter';


export function App() {
	return (
		<React.Suspense fallback={<LoadingSplash visible />}>
			<StoreProvider>
				<SagaMiddlewareProvider>
					<DeepLinksRouter>
						<MainWindow>
							<Shell />
							<Dock />
							<Menus />
							<Tray />
							<TouchBar />
						</MainWindow>
					</DeepLinksRouter>
				</SagaMiddlewareProvider>
			</StoreProvider>
		</React.Suspense>
	);
}

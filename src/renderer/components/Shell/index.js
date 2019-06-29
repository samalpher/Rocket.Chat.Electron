import React from 'react';
import { LoadingSplash } from '../LoadingSplash';
import { Sidebar } from '../Sidebar';
import { AboutModal } from '../AboutModal';
import { ScreenshareModal } from '../ScreenshareModal';
import { UpdateModal } from '../UpdateModal';
import { DownloadsView } from '../DownloadsView';
import { LandingView } from '../LandingView';
import { PreferencesView } from '../PreferencesView';
import { WebviewsView } from '../WebviewsView';
import { useRedux } from './hooks';
import {
	Outer,
	DraggableRegion,
	Inner,
	Views,
} from './styles';


export function Shell() {
	const loading = useRedux();

	return (
		<Outer>
			<DraggableRegion />

			<LoadingSplash visible={loading} />

			<Inner visible={!loading}>
				<Sidebar />

				<Views>
					<LandingView />
					<WebviewsView />
					<DownloadsView />
					<PreferencesView />
				</Views>
			</Inner>

			<AboutModal />
			<UpdateModal />
			<ScreenshareModal />
		</Outer>
	);
}

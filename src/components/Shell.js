import styled from '@emotion/styled';
import React from 'react';
import { useSelector } from 'react-redux';
import { LoadingSplash } from './LoadingSplash';
import { Sidebar } from './Sidebar';
import { AboutModal } from './modals/AboutModal';
import { ScreenshareModal } from './modals/ScreenshareModal';
import { UpdateModal } from './modals/UpdateModal';
import { DownloadsView } from './views/DownloadsView';
import { LandingView } from './views/LandingView';
import { PreferencesView } from './views/PreferencesView';
import { WebviewsView } from './views/WebviewsView';


const Wrapper = styled.div`
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-flow: row nowrap;
	cursor: default;
	user-select: none;
	background-color: var(--color-dark);
`;

const DragRegion = styled.div`
	position: fixed;
	width: 100vw;
	height: 22px;
	-webkit-app-region: drag;
	z-index: 3;
`;

const MainArea = styled.main`
	flex: 1;
	display: ${ ({ visible }) => (visible ? 'flex' : 'none') };
	flex-flow: row nowrap;
	align-items: stretch;
`;

const Views = styled.section`
	flex: 1;
	position: relative;
`;

export function Shell() {
	const loading = useSelector(({ loading }) => loading);

	return (
		<Wrapper>
			<DragRegion />

			<LoadingSplash visible={loading} />

			<MainArea visible={!loading}>
				<Sidebar />

				<Views>
					<LandingView />
					<WebviewsView />
					<DownloadsView />
					<PreferencesView />
				</Views>
			</MainArea>

			<AboutModal />
			<UpdateModal />
			<ScreenshareModal />
		</Wrapper>
	);
}

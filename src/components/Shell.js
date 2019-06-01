/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { connect } from 'react-redux';
import { DragRegion } from './DragRegion';
import { LoadingScreen } from './LoadingScreen';
import { Sidebar } from './Sidebar';
import { AboutModal } from './modals/AboutModal';
import { ScreenshareModal } from './modals/ScreenshareModal';
import { UpdateModal } from './modals/UpdateModal';
import { DownloadsView } from './views/DownloadsView';
import { LandingView } from './views/LandingView';
import { PreferencesView } from './views/PreferencesView';
import { WebviewsView } from './views/WebviewsView';


const mapStateToProps = ({ loading }) => ({ loading });

export const Shell = connect(mapStateToProps)(
	function Shell({ loading }) {
		return (
			<div
				css={css`
					width: 100vw;
					height: 100vh;
					display: flex;
					flex-flow: row nowrap;
					cursor: default;
					user-select: none;
					background-color: var(--primary-background-color);
				`}
			>
				<DragRegion />

				{loading && <LoadingScreen />}

				<div
					css={css`
						flex: 1;
						display: ${ loading ? 'none' : 'flex' };
						flex-flow: row nowrap;
						align-items: stretch;
					`}
				>
					<Sidebar />

					<div
						css={css`
							flex: 1;
							position: relative;
						`}
					>
						<LandingView />
						<WebviewsView />
						<DownloadsView />
						<PreferencesView />
					</div>
				</div>

				<AboutModal />
				<UpdateModal />
				<ScreenshareModal />
			</div>
		);
	}
);

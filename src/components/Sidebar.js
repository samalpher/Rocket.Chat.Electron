/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { connect } from 'react-redux';
import i18n from '../i18n';
import { showDownloads, showLanding, showPreferences } from '../store/actions';
import { ServerList } from './sidebar/ServerList';
import { SidebarButton } from './sidebar/SidebarButton';
import PlusIcon from './sidebar/plus.svg';
import DownloadIcon from './sidebar/download.svg';
import CogIcon from './sidebar/cog.svg';


const mapStateToProps = ({
	loading,
	preferences: {
		hasSidebar,
	},
	servers,
	view,
}) => {
	const {
		background,
		color,
	} = (view.url && servers.filter(({ url }) => view.url === url).map(({ style }) => style)[0]) || {};

	return {
		visible: !loading && hasSidebar,
		background,
		color,
	};
};

const mapDispatchToProps = (dispatch) => ({
	onShowLanding: () => dispatch(showLanding()),
	onShowDownloads: () => dispatch(showDownloads()),
	onShowPreferences: () => dispatch(showPreferences()),
});

const baseStyle = css`
	padding: ${ process.platform === 'darwin' ? '20px 0 0' : '0' };
	flex: 0 0 64px;
	display: flex;
	flex-flow: column nowrap;
	align-items: stretch;
	user-select: none;
	color: var(--color, #ffffff);
	background:
		linear-gradient(rgba(0, 0, 0, .1), rgba(0, 0, 0, .1)),
		var(--background, var(--color-dark));
	z-index: 10;
	transition: margin var(--transitions-duration);
	-webkit-app-region: drag;
`;

const invisibleStyle = css`
	margin-left: -64px;
`;

export const Sidebar = connect(mapStateToProps, mapDispatchToProps)(
	function Sidebar({ background, color, visible, onShowLanding, onShowDownloads, onShowPreferences }) {
		return (
			<div
				css={css`
					${ baseStyle };
					${ !visible && invisibleStyle };
					--background: ${ background };
					--color: ${ color };
				`}
				className="sidebar"
			>
				<ServerList />

				<div
					css={css`
						flex: 0 0 auto;
						padding: 8px;
					`}
				>
					<SidebarButton
						icon={<PlusIcon width={20} />}
						label={i18n.__('sidebar.addNewServer')}
						onClick={onShowLanding}
					/>
					<SidebarButton
						icon={<DownloadIcon width={20} />}
						label={i18n.__('sidebar.showDownloadManager')}
						onClick={onShowDownloads}
					/>
					<SidebarButton
						icon={<CogIcon width={20} />}
						label={i18n.__('sidebar.showPreferences')}
						onClick={onShowPreferences}
					/>
				</div>
			</div>
		);
	}
);

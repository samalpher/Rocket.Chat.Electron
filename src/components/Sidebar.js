import { css } from '@emotion/core';
import styled from '@emotion/styled';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import i18n from '../i18n';
import { showDownloads, showLanding, showPreferences } from '../store/actions';
import { ServerList } from './sidebar/ServerList';
import { SidebarButton } from './sidebar/SidebarButton';
import PlusIcon from './sidebar/plus.svg';
import DownloadIcon from './sidebar/download.svg';
import CogIcon from './sidebar/cog.svg';


const Outer = styled.aside`
	flex: 0 0 64px;
	padding: ${ process.platform === 'darwin' ? '20px 0 0' : '0' };
	${ ({ visible }) => !visible && css`
		margin-left: -64px;
	` }
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
	--background: ${ ({ background }) => background };
	--color: ${ ({ color }) => color };
`;

const Actions = styled.div`
	flex: 0 0 auto;
	padding: 8px;
`;

const StyledPlusIcon = styled(PlusIcon)`width: 20px;`;
const StyledDownloadIcon = styled(DownloadIcon)`width: 20px;`;
const StyledCogIcon = styled(CogIcon)`width: 20px;`;

export function Sidebar() {
	const {
		background,
		color,
		visible,
	} = useSelector(({
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
	});

	const dispatch = useDispatch();

	const handleShowLanding = () => dispatch(showLanding());
	const handleShowDownloads = () => dispatch(showDownloads());
	const handleShowPreferences = () => dispatch(showPreferences());

	return (
		<Outer background={background} color={color} visible={visible}>
			<ServerList />

			<Actions>
				<SidebarButton
					icon={<StyledPlusIcon />}
					label={i18n.__('sidebar.addNewServer')}
					onClick={handleShowLanding}
				/>
				<SidebarButton
					icon={<StyledDownloadIcon />}
					label={i18n.__('sidebar.downloads')}
					onClick={handleShowDownloads}
				/>
				<SidebarButton
					icon={<StyledCogIcon />}
					label={i18n.__('sidebar.preferences')}
					onClick={handleShowPreferences}
				/>
			</Actions>
		</Outer>
	);
}

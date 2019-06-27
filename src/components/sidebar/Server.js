import { css } from '@emotion/core';
import styled from '@emotion/styled';
import { remote } from 'electron';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parse } from 'url';
import { SidebarTooltip } from './SidebarTooltip';
const { getCurrentWindow, Menu } = remote;


const Indicator = styled.div`
	flex: 0 0 4px;
	height: ${ ({ active, unread }) => (active && '100%') || (unread && '8px') || 0 };
	transition: height var(--transitions-duration);
	border-radius: 0 4px 4px 0;
	background-color: var(--color-gray-lightest);
`;

const Inner = styled.div`
	position: relative;
	flex: 1;
	display: flex;
	flex-flow: column nowrap;
	align-items: center;
	transition: transform var(--transitions-duration);
`;

const Outer = styled.li`
	position: relative;
	margin: 4px 0;
	padding-right: 4px;
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	cursor: pointer;

	&:active ${ Inner } {
		transform: scale(0.9);
	}

	&:hover ${ SidebarTooltip } {
		visibility: visible;
		transform: translateX(0);
		opacity: 1;
	}
`;

const Initials = styled.span`
	width: 40px;
	height: 40px;
	border-radius: 4px;
	background-color: var(--color-gray-lightest);
	color: var(--color-darkest);
	text-align: center;
	font-size: 1.5rem;
	line-height: 40px;
	opacity: ${ ({ active, faviconLoaded, shortcut }) =>
		(faviconLoaded && '0') || (shortcut && '0') || (active && '1') || '0.5' };
	transition: opacity var(--transitions-duration);
	${ ({ active, faviconLoaded }) => !faviconLoaded && css`
		${ Outer }:hover & {
				opacity: ${ (active && '1') || '0.75' };
		}
	` }
`;

const Favicon = styled.img`
	width: 40px;
	height: 40px;
	margin-top: -40px;
	opacity: ${ ({ active, faviconLoaded, shortcut }) =>
		(!faviconLoaded && '0') || (shortcut && '0') || (active && '1') || '0.5' };
	transition: opacity var(--transitions-duration);
	${ ({ active, faviconLoaded }) => faviconLoaded && css`
		${ Outer }:hover & {
			opacity: ${ (active && '1') || '0.75' };
		}
	` }
`;

const Badge = styled.span`
	position: absolute;
	right: 0;
	top: 0;
	min-width: 18px;
	height: 18px;
	padding: 0 4px;
	text-align: center;
	color: var(--color-white);
	border-radius: 20px;
	background-color: var(--color-dark-red);
	font-size: 12px;
	font-weight: 700;
	line-height: 18px;
	z-index: 1;
`;

const Shortcut = styled.span`
	width: 40px;
	height: 40px;
	margin-top: -40px;
	border-radius: 4px;
	background-color: var(--color-gray-lightest);
	color: var(--color-darkest);
	text-align: center;
	font-size: 1.5rem;
	line-height: 40px;
	opacity: ${ ({ visible }) => (visible && 1) || 0 };
	transition: opacity var(--transitions-duration);
`;

export function Server({
	url,
	title = url,
	badge,
	order,
	active,
	dragged,
	shortcut,
	onSelect,
	onReload,
	onRemove,
	onOpenDevTools,
	...props
}) {
	const hasUnreadMessages = useMemo(() => !!badge, [badge]);

	const mentionCount = useMemo(() => (
		[badge].filter((badge) => parseInt(badge, 10)).filter(Number.isInteger)[0]
	), [badge]);

	const initials = useMemo(() => (
		title
			.replace(url, parse(url).hostname)
			.split(/[^A-Za-z0-9]+/g)
			.slice(0, 2)
			.map((text) => text.slice(0, 1).toUpperCase())
			.join('')
	), [url, title]);

	const faviconUrl = useMemo(() => {
		const faviconCacheBustingTime = 15 * 60 * 1000;
		const bustingParam = Math.round(Date.now() / faviconCacheBustingTime);
		return `${ url.replace(/\/$/, '') }/assets/favicon.svg?_=${ bustingParam }`;
	}, [url]);

	const [faviconLoaded, setFaviconLoaded] = useState(false);
	const { t } = useTranslation();

	const handleContextMenu = (event) => {
		event.preventDefault();

		const menu = Menu.buildFromTemplate([
			{
				label: t('sidebar.item.reload'),
				click: onReload,
			},
			{
				label: t('sidebar.item.remove'),
				click: onRemove,
			},
			{
				label: t('sidebar.item.openDevTools'),
				click: onOpenDevTools,
			},
		]);
		menu.popup(getCurrentWindow());
	};

	return (
		<Outer
			draggable="true"
			onClick={onSelect}
			onContextMenu={handleContextMenu}
			{...props}
		>
			<Indicator
				active={active}
				unread={hasUnreadMessages}
			/>
			<Inner>
				<Initials
					active={active}
					faviconLoaded={faviconLoaded}
					shortcut={shortcut}
				>
					{initials}
				</Initials>

				<Favicon
					active={active}
					draggable="false"
					faviconLoaded={faviconLoaded}
					shortcut={shortcut}
					src={faviconUrl}
					onLoad={() => setFaviconLoaded(true)}
					onError={() => setFaviconLoaded(false)}
				/>

				{mentionCount && (
					<Badge>
						{mentionCount}
					</Badge>
				)}

				{order <= 9 && (
					<Shortcut visible={shortcut}>
						{`${ process.platform === 'darwin' ? '⌘' : '^' }${ order + 1 }`}
					</Shortcut>
				)}
			</Inner>

			<SidebarTooltip>
				{title}
			</SidebarTooltip>
		</Outer>
	);
}

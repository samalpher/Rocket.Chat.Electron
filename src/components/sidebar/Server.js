/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { remote } from 'electron';
import { useMemo, useState } from 'react';
import { parse } from 'url';
import i18n from '../../i18n';
import { SidebarTooltip } from './SidebarTooltip';
const { getCurrentWindow, Menu } = remote;


export const Server = (
	function Server({
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

		const handleContextMenu = (event) => {
			event.preventDefault();

			const menu = Menu.buildFromTemplate([
				{
					label: i18n.__('sidebar.item.reload'),
					click: onReload,
				},
				{
					label: i18n.__('sidebar.item.remove'),
					click: onRemove,
				},
				{
					label: i18n.__('sidebar.item.openDevTools'),
					click: onOpenDevTools,
				},
			]);
			menu.popup(getCurrentWindow());
		};

		return (
			<li
				draggable="true"
				css={css`
					position: relative;
					margin: 4px 0;
					padding-right: 4px;
					display: flex;
					flex-flow: row nowrap;
					align-items: center;
					cursor: pointer;
				`}
				onClick={onSelect}
				onContextMenu={handleContextMenu}
				{...props}
			>
				<div
					css={css`
						flex: 0 0 4px;
						height: ${ (active && '100%') || (hasUnreadMessages && '8px') || 0 };
						transition: height var(--transitions-duration);
						border-radius: 0 4px 4px 0;
						background-color: var(--color-gray-lightest);
					`}
				/>
				<div
					css={css`
						flex: 1;
						display: flex;
						flex-flow: column nowrap;
						align-items: center;
					`}
				>
					<span
						css={css`
							width: 40px;
							height: 40px;
							border-radius: 4px;
							background-color: var(--color-gray-lightest);
							color: var(--color-darkest);
							text-align: center;
							font-size: 1.5rem;
							line-height: 40px;
							opacity: ${ (faviconLoaded && '0') || (shortcut && '0') || (active && '1') || '0.5' };
							transition: opacity var(--transitions-duration);
							${ !faviconLoaded && css`
								*:hover > * > & {
									opacity: ${ (active && '1') || '0.75' };
								}
							` }
						`}
					>
						{initials}
					</span>

					<img
						draggable="false"
						src={faviconUrl}
						css={css`
							width: 40px;
							height: 40px;
							margin-top: -40px;
							opacity: ${ (!faviconLoaded && '0') || (shortcut && '0') || (active && '1') || '0.5' };
							transition: opacity var(--transitions-duration);
							${ faviconLoaded && css`
								*:hover > * > & {
									opacity: ${ (active && '1') || '0.75' };
								}
							` }
						`}
						onLoad={() => setFaviconLoaded(true)}
						onError={() => setFaviconLoaded(false)}
					/>

					{mentionCount && (
						<div
							css={css`
								position: absolute;
								right: 4px;
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
							`}
						>
							{mentionCount}
						</div>
					)}

					{order <= 9 && (
						<span
							css={css`
								width: 40px;
								height: 40px;
								margin-top: -40px;
								border-radius: 4px;
								background-color: var(--color-gray-lightest);
								color: var(--color-darkest);
								text-align: center;
								font-size: 1.5rem;
								line-height: 40px;
								opacity: ${ (shortcut && 1) || 0 };
								transition: opacity var(--transitions-duration);
							`}
						>
							{`${ process.platform === 'darwin' ? '⌘' : '^' }${ order + 1 }`}
						</span>
					)}
				</div>

				<SidebarTooltip text={title} />
			</li>
		);
	}
);

import React from 'react';
import { Tooltip } from '../../styles';
import {
	useHasUnreadMessages,
	useMentionCount,
	useInitials,
	useFavicon,
	useSelection,
	useContextMenu,
} from './hooks';
import {
	Outer,
	Inner,
	Initials,
	Indicator,
	Favicon,
	Badge,
	Shortcut,
} from './styles';


export function Server({
	url,
	title = url,
	badge,
	order,
	active,
	dragged,
	shortcut,
	...props
}) {
	const hasUnreadMessages = useHasUnreadMessages(badge);
	const mentionCount = useMentionCount(badge);
	const initials = useInitials(url, title);
	const [faviconUrl, faviconLoaded, handleFaviconLoad, handleFaviconError] = useFavicon(url);
	const handleSelect = useSelection(url);
	const handleContextMenu = useContextMenu(url);

	return (
		<Outer
			draggable="true"
			onClick={handleSelect}
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
					onLoad={handleFaviconLoad}
					onError={handleFaviconError}
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

			<Tooltip>
				{title}
			</Tooltip>
		</Outer>
	);
}

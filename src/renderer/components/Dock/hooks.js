import { remote } from 'electron';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';


const getBadgeText = (badge) => {
	if (badge === '•') {
		return '•';
	}

	if (Number.isInteger(badge)) {
		return String(badge);
	}

	return '';
};

const selectBadge = ({ servers }) => {
	const badges = servers.map(({ badge }) => badge);
	const mentionCount = (
		badges
			.filter((badge) => Number.isInteger(badge))
			.reduce((sum, count) => sum + count, 0)
	);
	const badge = mentionCount || (badges.some((badge) => !!badge) && '•') || null;

	return badge;
};

export const useBadge = () => {
	const prevBadgeRef = useRef(null);
	const badge = useSelector(selectBadge);

	useEffect(() => {
		if (process.platform !== 'darwin') {
			return;
		}

		const { app } = remote;
		const { current: prevBadge } = prevBadgeRef;

		app.dock.setBadge(getBadgeText(badge));
		const count = Number.isInteger(badge) ? badge : 0;
		const previousCount = Number.isInteger(prevBadge) ? prevBadge : 0;
		if (count > 0 && previousCount === 0) {
			app.dock.bounce();
		}

		prevBadgeRef.current = badge;
	}, [badge]);
};

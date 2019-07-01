import { useEffect, useRef, useState } from 'react';


export const useReload = (loading, onReload) => {
	const secondsToWaitBeforeReload = 60;
	const intervalRef = useRef();
	const [reloadCounter, setReloadCounter] = useState(secondsToWaitBeforeReload);

	const reload = () => {
		clearInterval(intervalRef.current);
		onReload && onReload();
	};

	useEffect(() => {
		if (loading) {
			return;
		}

		setReloadCounter(secondsToWaitBeforeReload);

		const startTime = Date.now();
		intervalRef.current = setInterval(() => {
			const counter = Math.max(0, secondsToWaitBeforeReload - Math.round((Date.now() - startTime) / 1000));

			if (counter <= 0) {
				reload();
				return;
			}

			setReloadCounter(counter);
		}, 1000);

		return () => {
			clearInterval(intervalRef.current);
		};
	}, [loading]);

	return [reload, reloadCounter];
};

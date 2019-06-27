import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { LoadingIndicator } from '../ui/LoadingIndicator';
import { Container, ReloadButtonContainer, Subtitle, Title } from './styles';


const useReload = (active, onReload) => {
	const secondsToWaitBeforeReload = 60;
	const [reloading, setReloading] = useState(false);
	const [reloadCounter, setReloadCounter] = useState(secondsToWaitBeforeReload);
	let interval;

	const reload = () => {
		setReloading(true);
		clearInterval(interval);
		onReload && onReload();
	};

	useEffect(() => {
		if (!active) {
			return;
		}

		setReloading(false);
		setReloadCounter(secondsToWaitBeforeReload);

		const startTime = Date.now();
		interval = setInterval(() => {
			const counter = Math.max(0, secondsToWaitBeforeReload - Math.round((Date.now() - startTime) / 1000));

			if (counter <= 0) {
				reload();
				return;
			}

			setReloadCounter(counter);
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}, [active]);

	return [reload, reloading, reloadCounter];
};

export function ServerLoadingError({ visible, onReload }) {
	const [reload, reloading, reloadCounter] = useReload(visible, onReload);
	const { t } = useTranslation();

	const handleReloadClick = () => {
		reload();
	};

	return (
		<Container visible={visible}>
			<Title>{t('loadingError.announcement')}</Title>
			<Subtitle>{t('loadingError.title')}</Subtitle>
			<ReloadButtonContainer>
				{reloading && <LoadingIndicator />}
				{!reloading && (
					<Button primary onClick={handleReloadClick}>
						{t('loadingError.reload')}
						{reloadCounter > 0 && ` (${ reloadCounter })`}
					</Button>
				)}
			</ReloadButtonContainer>
		</Container>
	);
}

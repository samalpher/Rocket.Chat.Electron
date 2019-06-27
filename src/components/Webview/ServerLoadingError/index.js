import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui/Button';
import { LoadingIndicator } from '../../ui/LoadingIndicator';
import { useReload } from './hooks';
import { Container, ReloadButtonContainer, Subtitle, Title } from './styles';


export function ServerLoadingError({ loading, onReload }) {
	const [reload, reloadCounter] = useReload(loading, onReload);
	const { t } = useTranslation();

	const handleReloadClick = () => {
		reload();
	};

	return (
		<Container>
			<Title>{t('loadingError.announcement')}</Title>
			<Subtitle>{t('loadingError.title')}</Subtitle>
			<ReloadButtonContainer>
				{loading && <LoadingIndicator />}
				{!loading && (
					<Button primary onClick={handleReloadClick}>
						{t('loadingError.reload')}
						{reloadCounter > 0 && ` (${ reloadCounter })`}
					</Button>
				)}
			</ReloadButtonContainer>
		</Container>
	);
}

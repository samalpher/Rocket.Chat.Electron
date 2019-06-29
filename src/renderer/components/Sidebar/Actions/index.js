import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRedux } from './hooks';
import {
	Container,
	StyledPlusIcon,
	StyledDownloadIcon,
	StyledCogIcon,
} from './styles';
import { Action } from './Action';


export function Actions() {
	const {
		handleShowLanding,
		handleShowDownloads,
		handleShowPreferences,
	} = useRedux();

	const { t } = useTranslation();

	return (
		<Container>
			<Action
				icon={<StyledPlusIcon />}
				label={t('sidebar.addNewServer')}
				onClick={handleShowLanding}
			/>

			<Action
				icon={<StyledDownloadIcon />}
				label={t('sidebar.downloads')}
				onClick={handleShowDownloads}
			/>

			<Action
				icon={<StyledCogIcon />}
				label={t('sidebar.preferences')}
				onClick={handleShowPreferences}
			/>
		</Container>
	);
}

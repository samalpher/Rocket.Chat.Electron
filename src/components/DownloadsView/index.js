import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../Button';
import { Download } from './Download';
import { useView, useDownloads } from './hooks';
import {
	Container,
	Header,
	Title,
	List,
} from './styles';


export function DownloadsView() {
	const visible = useView();

	const [items, clearAllDownloads] = useDownloads();

	const { t } = useTranslation();

	const handleClearAllDownloads = () => {
		clearAllDownloads();
	};

	return (
		<Container visible={visible}>
			<Header>
				<Title>
					{t('downloads.title')}
				</Title>

				<Button primary onClick={handleClearAllDownloads}>
					{t('downloads.clear')}
				</Button>
			</Header>

			<List>
				{items.map((item) => <Download key={item.id} {...item} />)}
			</List>
		</Container>
	);
}

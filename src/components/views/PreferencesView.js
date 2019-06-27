import styled from '@emotion/styled';
import React from 'react';
import { useSelector } from 'react-redux';
import { View } from '../View';
import { useTranslation } from 'react-i18next';


const Wrapper = styled(View)`
	background-color: var(--color-dark-05);
`;

const Header = styled.header`
	flex: 0 0 auto;
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	padding: 1rem;
	border-bottom: 1px solid var(--color-dark-10);
`;

const Title = styled.h2`
	flex: 1;
	color: var(--color-dark-70);
	margin: 0;
`;

const useRedux = () => {
	const state = useSelector(({ view }) => ({ visible: view === 'preferences' }));

	return state;
};

export function PreferencesView() {
	const { visible } = useRedux();
	const { t } = useTranslation();

	return (
		<Wrapper visible={visible}>
			<Header>
				<Title>
					{t('preferences.title')}
				</Title>
			</Header>
		</Wrapper>
	);
}

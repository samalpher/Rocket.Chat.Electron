import styled from '@emotion/styled';
import React from 'react';
import { connect } from 'react-redux';
import i18n from '../../i18n';
import { View } from '../View';


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

const mapStateToProps = ({ view }) => ({ visible: view === 'preferences' });

export const PreferencesView = connect(mapStateToProps)(
	function PreferencesView({ visible }) {
		return (
			<Wrapper visible={visible}>
				<Header>
					<Title>
						{i18n.__('preferences.title')}
					</Title>
				</Header>
			</Wrapper>
		);
	}
);

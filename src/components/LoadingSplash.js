import styled from '@emotion/styled';
import React from 'react';
import { connect } from 'react-redux';
import { LoadingIndicator } from './ui/LoadingIndicator';
import { RocketChatLogo } from './ui/RocketChatLogo';


const Outer = styled.div`
	display: ${ ({ loading }) => (loading ? 'flex' : 'none') };
	flex-flow: column nowrap;
	width: 100vw;
	height: 100vh;
	align-items: center;
	justify-content: center;
	background-color: var(--color-dark);
	-webkit-app-region: drag;
`;

const Inner = styled.div`
	display: flex;
	flex-flow: column nowrap;
	align-items: center;
	justify-content: center;
	width: 100vw;
	max-width: 30rem;
	height: 8rem;
	padding: 0 1rem;
`;

const mapStateToProps = ({ loading }) => ({ loading });

export const LoadingSplash = connect(mapStateToProps)(
	function LoadingSplash({ loading }) {
		return (
			<Outer loading={loading}>
				<Inner>
					<RocketChatLogo dark />
					<LoadingIndicator />
				</Inner>
			</Outer>
		);
	}
);

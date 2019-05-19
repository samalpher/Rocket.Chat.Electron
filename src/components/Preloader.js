import React from 'react';
import { connect } from 'react-redux';
import { LoadingScreen } from './LoadingScreen';


const PreloaderView = ({ loading, children }) => (
	<>
		{loading && <LoadingScreen />}
		{children}
	</>
);

const mapStateToProps = ({ loading }) => ({ loading });

export const Preloader = connect(mapStateToProps)(PreloaderView);

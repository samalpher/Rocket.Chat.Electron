import React from 'react';
import { connect } from '../AppState';
import RegisterServer from './RegisterServer';


const Landing = ({ visible }) => (
	<section className={ ['Landing', !visible && 'Landing--hidden'].filter(Boolean).join(' ') }>
		<div className="Landing__inner">
			<div>
				<img className="Landing__logo" src="./images/logo-dark.svg" />
			</div>

			<div className="loading-indicator">
				<span className="dot" />
				<span className="dot" />
				<span className="dot" />
			</div>

			<RegisterServer />
		</div>
	</section>
);


export default connect(({ activeServerUrl }) => ({ visible: !activeServerUrl }))(Landing);

import htm from 'htm';
import React from 'react';
import AppState from './AppState';
import Sidebar from './Sidebar';
const html = htm.bind(React.createElement);


export default class App extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = props.initialState;
	}

	render() {
		return html`
		<${ AppState.Provider } value=${ this.state }>
			<div className="drag-region" />

			<${ Sidebar } />

			<main className="MainView">
				<section className="landing">
					<div className="wrapper">
						<header>
							<img className="logo" src="./images/logo-dark.svg"/>
						</header>

						<div className="loading-indicator">
							<span className="dot" />
							<span className="dot" />
							<span className="dot" />
						</div>

						<form id="login-card" method="/">
							<header>
								<h2 className="connect__prompt">Enter your server URL</h2>
							</header>

							<div className="fields">
								<div className="input-text active">
									<input type="text" name="host" placeholder="https://open.rocket.chat" dir="auto"/>
								</div>
							</div>

							<div id="invalidUrl" style=${ { display: 'none' } } className="alert alert-danger">No valid server found</div>

							<div className="connect__error alert alert-danger only-offline">Check connection</div>

							<div className="submit">
								<button type="submit" data-loading-text="Connecting..." className="button primary login">Connect</button>
							</div>
						</form>
					</div>
				</section>
			</main>
		</${ AppState.Provider }>
		`;
	}
}

import React from 'react';
import AppState from './AppState';
import Sidebar from './Sidebar';
import Landing from './Landing';


export default class App extends React.PureComponent {
	state = this.props.initialState

	render = () => (
		<AppState.Provider value={this.state}>
			<div className="drag-region" />

			<Sidebar />

			<main className="MainView">
				<Landing />

				<div className="WebViews" />
			</main>
		</AppState.Provider>
	)
}

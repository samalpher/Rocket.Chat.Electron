import React from 'react';


const AppState = React.createContext();


export const connect = (mapStateToProps) => (component) => class AppStateConnector extends React.PureComponent {
	render = () => (
		<AppState.Consumer>
			{(state) => React.createElement(component, { ...this.props, ...mapStateToProps(state) })}
		</AppState.Consumer>
	)
};


export default AppState;

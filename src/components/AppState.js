import React from 'react';


const AppState = React.createContext();


export const connect = (mapStateToProps) => (component) => class AppStateConnector extends React.PureComponent {
	render() {
		return React.createElement(AppState.Consumer, {}, (state) =>
			React.createElement(component, { ...this.props, ...mapStateToProps(state) })
		);
	}
};


export default AppState;

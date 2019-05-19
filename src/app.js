import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import start from './scripts/events';
import './store';
import { App } from './components/App';


window.addEventListener('load', () => {
	render(<App />, document.getElementById('root'));
	start();
});

window.addEventListener('beforeunload', () => {
	unmountComponentAtNode(document.getElementById('root'));
});

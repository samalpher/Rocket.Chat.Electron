import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import start from './scripts/events';
import './store';
import { App } from './components/App';
import i18n from './i18n';


window.addEventListener('load', async () => {
	await i18n.initialize();
	render(<App />, document.getElementById('root'));
	start();
});

window.addEventListener('beforeunload', () => {
	unmountComponentAtNode(document.getElementById('root'));
});

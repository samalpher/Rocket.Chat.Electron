import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import start from './events';
import '../store';
import { App } from '../components/App';
import { initializeI18n } from './i18n';


window.addEventListener('load', async () => {
	await initializeI18n();
	render(<App />, document.getElementById('root'));
	start();
});

window.addEventListener('beforeunload', () => {
	unmountComponentAtNode(document.getElementById('root'));
});

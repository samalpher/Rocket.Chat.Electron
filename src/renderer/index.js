import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { setupErrorHandling } from '../errorHandling';
import '../store';
import { App } from '../components/App';
import start from './events';
import { initializeI18n } from './i18n';


setupErrorHandling('renderer');

window.addEventListener('load', async () => {
	await initializeI18n();
	render(<App />, document.getElementById('root'));
	start();
});

window.addEventListener('beforeunload', () => {
	unmountComponentAtNode(document.getElementById('root'));
});

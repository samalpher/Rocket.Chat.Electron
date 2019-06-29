import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { setupErrorHandling } from '../errorHandling';
import { setupStore } from './store';
import { App } from './components/App';
import start from './events';
import { useI18n } from './i18n';


setupErrorHandling('renderer');

setupStore();

window.addEventListener('load', async () => {
	await useI18n();

	render(<App />, document.getElementById('root'));
	start();
});

window.addEventListener('beforeunload', () => {
	unmountComponentAtNode(document.getElementById('root'));
});

import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import start from './scripts/events';
import './store';
import { RendererApp } from './components/renderer/RendererApp';


window.addEventListener('load', () => {
	render(<RendererApp />, document.getElementById('root'));
	start();
});

window.addEventListener('beforeunload', () => {
	unmountComponentAtNode(document.getElementById('root'));
});

import { start } from './scripts/start';

const { context = 'default' } = document.currentScript.dataset;

window.addEventListener('load', ({
	default: start,
})[context], false);

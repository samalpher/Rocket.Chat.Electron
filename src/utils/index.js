import { app as mainApp, remote } from 'electron';


const app = mainApp || remote.app;

export const normalizeServerUrl = (url) => {
	if (!url) {
		return null;
	}

	url = url.replace(/\/$/, '');

	if (!/^https?:\/\//.test(url)) {
		return `https://${ url }`;
	}

	return url;
};

export const queryEditFlags = () => ({
	canUndo: document.queryCommandEnabled('undo'),
	canRedo: document.queryCommandEnabled('redo'),
	canCut: document.queryCommandEnabled('cut'),
	canCopy: document.queryCommandEnabled('copy'),
	canPaste: document.queryCommandEnabled('paste'),
	canSelectAll: document.queryCommandEnabled('selectAll'),
});

export const debounce = (f, delay) => {
	let timeout;

	const F = (...args) => {
		if (timeout) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(() => f(...args), delay);
	};

	return F;
};

export const defer = () => {
	let resolve;
	let reject;
	const promise = new Promise((...args) => {
		[resolve, reject] = args;
	});
	return { resolve, reject, promise };
};

export const arePlainObjectsEqual = (a, b) => {
	if (a === b) {
		return true;
	}

	for (const key in a) {
		if (a[key] !== b[key]) {
			return false;
		}
	}

	for (const key in b) {
		if (!(key in a)) {
			return false;
		}
	}

	return true;
};

export const getPathFromApp = (path) => `${ app.getAppPath() }/app/${ path }`;

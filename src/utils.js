import { app as mainApp, remote } from 'electron';
import jetpack from 'fs-jetpack';


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

const dirs = {};

const app = mainApp || remote.app;

const setupDirs = () => {
	if (!dirs.app) {
		dirs.app = jetpack.cwd(app.getAppPath(), app.getAppPath().endsWith('app.asar') ? '..' : '.');
	}

	if (!dirs.user) {
		dirs.user = jetpack.cwd(app.getPath('userData'));
	}
};

export const loadJson = async (filename, dir = 'user') => {
	setupDirs();

	try {
		return await dirs[dir].readAsync(filename, 'json') || {};
	} catch (error) {
		console.error(error && (error.stack || error));
		return {};
	}
};

export const writeJson = async (filename, data) => {
	setupDirs();
	try {
		await dirs.user.writeAsync(filename, data, { atomic: true });
	} catch (error) {
		console.error(error && (error.stack || error));
	}
};

export const getDirectory = (dirname, dir = 'user') => {
	setupDirs();
	return dirs[dir].cwd(dirname);
};

export const queryEditFlags = () => ({
	canUndo: document.queryCommandEnabled('undo'),
	canRedo: document.queryCommandEnabled('redo'),
	canCut: document.queryCommandEnabled('cut'),
	canCopy: document.queryCommandEnabled('copy'),
	canPaste: document.queryCommandEnabled('paste'),
	canSelectAll: document.queryCommandEnabled('selectAll'),
});

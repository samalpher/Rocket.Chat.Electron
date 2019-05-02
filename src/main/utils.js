import { app } from 'electron';
import jetpack from 'fs-jetpack';


const dirs = {};

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

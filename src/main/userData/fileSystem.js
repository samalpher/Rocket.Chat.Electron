import { app } from 'electron';
import jetpack from 'fs-jetpack';
import { data as debug } from '../../debug';
import { reportInfo } from '../../errorHandling';


export const setupUserDataPath = () => {
	const appName = app.getName();
	const dirName = process.env.NODE_ENV === 'production' ? appName : `${ appName } (${ process.env.NODE_ENV })`;
	app.setPath('userData', jetpack.path(app.getPath('appData'), dirName));
};

const withDirectory = (f) => {
	const directories = {
		app: jetpack.cwd(app.getAppPath(), app.getAppPath().endsWith('app.asar') ? '..' : '.'),
		user: jetpack.cwd(app.getPath('userData')),
	};

	return (directoryType = 'user', ...args) => f.call(null, directories[directoryType], ...args);
};

export const loadJson = withDirectory(async (directory, filename) => {
	try {
		debug('loading %s on %s', filename, directory.cwd());
		return await directory.readAsync(filename, 'json') || {};
	} catch (error) {
		reportInfo(error);
		return {};
	}
});

export const purgeFile = withDirectory(async (directory, filename) => {
	try {
		debug('purging %s on %s', filename, directory.cwd());
		await directory.removeAsync(filename);
	} catch (error) {
		reportInfo(error);
	}
});

export const getDirectory = withDirectory((directory, dirname) => directory.cwd(dirname));

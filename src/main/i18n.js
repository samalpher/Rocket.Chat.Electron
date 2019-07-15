import { app } from 'electron';
import jetpack from 'fs-jetpack';
import i18next from 'i18next';
import i18nextNodeFileSystemBackend from 'i18next-node-fs-backend';
import { i18n as debug } from '../debug';
import { getLanguagesDirectoryPath, normalizeLocale } from '../utils/i18n';


const getI18nextOptions = async () => {
	const lngsDirectory = await jetpack.dirAsync(getLanguagesDirectoryPath());
	const lngFiles = await lngsDirectory.listAsync();
	const lngs = await lngFiles
		.filter((filename) => /^([a-z]{2}(\-[A-Z]{2})?)\.i18n\.json$/.test(filename))
		.map((filename) => filename.split('.')[0]);
	const fallbackLng = 'en';
	const loadPath = `${ lngsDirectory.cwd() }/{{lng}}.i18n.json`;

	return {
		lngs,
		fallbackLng,
		backend: {
			loadPath,
		},
	};
};

export const setupI18n = async () => {
	await i18next
		.use(i18nextNodeFileSystemBackend)
		.init(await getI18nextOptions());
	debug('i18next initialized');

	i18next.changeLanguage(normalizeLocale(app.getLocale()));
	debug('%o set for i18next', i18next.language);
};

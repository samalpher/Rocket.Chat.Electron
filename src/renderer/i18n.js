import { remote } from 'electron';
import i18next from 'i18next';
import i18nextNodeFileSystemBackend from 'i18next-node-fs-backend';
import jetpack from 'fs-jetpack';
import { initReactI18next } from 'react-i18next';
import { getLanguagesDirectoryPath, normalizeLocale } from '../utils/i18n';
const { app } = remote;


const getI18nextOptions = async () => {
	const lngsDirectory = await jetpack.dirAsync(getLanguagesDirectoryPath());
	const lngFiles = await lngsDirectory.listAsync();
	const lngs = await lngFiles
		.filter((filename) => /^([a-z]{2}(\-[A-Z]{2})?)\.i18n\.json$/.test(filename))
		.map((filename) => filename.split('.')[0]);
	const lng = normalizeLocale(app.getLocale());
	const fallbackLng = 'en';
	const loadPath = `${ lngsDirectory.cwd() }/{{lng}}.i18n.json`;

	return {
		lngs,
		lng,
		fallbackLng,
		backend: {
			loadPath,
		},
		interpolation: {
			escapeValue: false,
		},
	};
};

export const useI18n = async () => {
	await i18next
		.use(initReactI18next)
		.use(i18nextNodeFileSystemBackend)
		.init(await getI18nextOptions());
};

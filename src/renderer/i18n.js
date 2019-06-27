import { remote } from 'electron';
import i18n from 'i18next';
import i18nextNodeFileSystemBackend from 'i18next-node-fs-backend';
import jetpack from 'fs-jetpack';
import { initReactI18next } from 'react-i18next';
import { getLanguagesDirectoryPath, normalizeLocale } from '../utils';
const { app } = remote;


export const initializeI18n = async () => {
	const languagesDirPath = getLanguagesDirectoryPath();
	const defaultLocale = 'en';
	const globalLocale = normalizeLocale(app.getLocale());

	const lngFiles = await jetpack.listAsync(getLanguagesDirectoryPath());
	const lngs = (
		lngFiles
			.filter((filename) => /^([a-z]{2}(\-[A-Z]{2})?)\.i18n\.json$/.test(filename))
			.map((filename) => filename.split('.')[0])
	);

	await i18n
		.use(initReactI18next)
		.use(i18nextNodeFileSystemBackend)
		.init({
			lng: globalLocale,
			fallbackLng: defaultLocale,
			lngs,
			backend: {
				loadPath: `${ languagesDirPath }/{{lng}}.i18n.json`,
			},
			initImmediate: true,
			interpolation: {
				escapeValue: false,
			},
		});
};

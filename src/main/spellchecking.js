import jetpack from 'fs-jetpack';
import path from 'path';
import { put, select, takeEvery } from 'redux-saga/effects';
import spellchecker from 'spellchecker';
import { store, sagaMiddleware } from '../store';
import {
	LOAD_CONFIG,
	INSTALL_SPELLCHECKING_DICTIONARIES,
	spellCheckingConfigurationLoaded,
	spellCheckingDictionaryInstalled,
	spellCheckingDictionaryInstallFailed,
} from '../store/actions';
import { getDirectory } from '../utils';


const loadSpellCheckingConfiguration = function *() {
	const embeddedDictionaries = spellchecker.getAvailableDictionaries();
	const supportsMultipleDictionaries = embeddedDictionaries.length > 0 && process.platform !== 'win32';

	const directory = getDirectory('dictionaries', 'app');
	const dictionaryInstallationDirectory = directory.path();

	const installedDictionaries = (yield directory.findAsync({ matching: '*.{aff,dic}' }))
		.map((fileName) => path.basename(fileName, path.extname(fileName)));

	const availableDictionaries = Array.from(new Set([...embeddedDictionaries, ...installedDictionaries])).sort();

	yield put(spellCheckingConfigurationLoaded({
		supportsMultipleDictionaries,
		dictionaryInstallationDirectory,
		availableDictionaries,
	}));
};

const installSpellCheckingDictionaries = function *({ payload: { filePaths } }) {
	const { spellchecking: { dictionaryInstallationDirectory } } = yield select();

	for (const filePath of filePaths) {
		const dictionary = filePath.basename(filePath, filePath.extname(filePath));
		const basename = filePath.basename(filePath);
		const newPath = filePath.join(dictionaryInstallationDirectory, basename);
		try {
			yield jetpack.copyAsync(filePath, newPath);
			yield put(spellCheckingDictionaryInstalled(dictionary));
		} catch (error) {
			yield put(spellCheckingDictionaryInstallFailed(dictionary));
		}
	}
};

const getMisspeledWords = (words) => {
	const {
		preferences: {
			enabledDictionaries,
		},
		spellchecking: {
			dictionaryInstallationDirectory,
		},
	} = store.getState();

	if (enabledDictionaries.length === 0) {
		return [];
	}

	return (
		enabledDictionaries.reduce((misspelledWords, dictionary) => {
			spellchecker.setDictionary(dictionary, dictionaryInstallationDirectory);
			return misspelledWords.filter((word) => spellchecker.isMisspelled(word));
		}, words)
	);
};

export const getSpellCorrections = (word) => {
	const {
		preferences: {
			enabledDictionaries,
		},
		spellchecking: {
			dictionaryInstallationDirectory,
		},
	} = store.getState();

	word = word.trim();

	if (word === '' || getMisspeledWords(word).length === 0) {
		return null;
	}

	return Array.from(new Set(
		enabledDictionaries.flatMap((dictionary) => {
			spellchecker.setDictionary(dictionary, dictionaryInstallationDirectory);
			return spellchecker.getCorrectionsForMisspelling(word);
		})
	));
};

sagaMiddleware.run(function *spellCheckingSaga() {
	yield takeEvery(LOAD_CONFIG, loadSpellCheckingConfiguration);
	yield takeEvery(INSTALL_SPELLCHECKING_DICTIONARIES, installSpellCheckingDictionaries);
});

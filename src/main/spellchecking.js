import jetpack from 'fs-jetpack';
import mem from 'mem';
import path from 'path';
import spellchecker from 'spellchecker';
import { getDirectory } from '../utils';
import { store, connect } from '../store';
import { loadSpellcheckingConfiguration } from '../store/actions';


let supportsMultipleDictionaries = false;
let dictionaryInstallationDirectory;
let availableDictionaries = [];
let enabledDictionaries = [];
let checker = () => true;

const updateChecker = () => {
	if (enabledDictionaries.length === 0) {
		checker = () => true;
		return;
	}

	if (enabledDictionaries.length === 1) {
		let enabled = false;
		checker = mem((text) => {
			if (!enabled) {
				spellchecker.setDictionary(enabledDictionaries[0], dictionaryInstallationDirectory);
				enabled = true;
			}
			return !spellchecker.isMisspelled(text);
		});
		return;
	}

	const singleDictionaryChecker = mem(
		((dictionariesPath, dictionary, text) => {
			spellchecker.setDictionary(dictionary, dictionariesPath);
			return !spellchecker.isMisspelled(text);
		})
			.bind(null, dictionaryInstallationDirectory)
	);

	checker = mem(
		((dictionaries, text) => dictionaries.some((dictionary) => singleDictionaryChecker(dictionary, text)))
			.bind(null, enabledDictionaries)
	);
};

const getCorrections = (text) => {
	text = text.trim();

	if (text === '' || checker(text)) {
		return null;
	}

	return Array.from(new Set(
		enabledDictionaries.flatMap((dictionary) => {
			spellchecker.setDictionary(dictionary, dictionaryInstallationDirectory);
			return spellchecker.getCorrectionsForMisspelling(text);
		})
	));
};

const check = (words, callback) => {
	callback(words.filter((word) => !checker(word)));
};

const installDictionaries = async (filePaths) => {
	for (const filePath of filePaths) {
		const name = filePath.basename(filePath, filePath.extname(filePath));
		const basename = filePath.basename(filePath);
		const newPath = filePath.join(dictionaryInstallationDirectory, basename);

		await jetpack.copyAsync(filePath, newPath);

		if (!availableDictionaries.includes(name)) {
			availableDictionaries.push(name);
		}
	}
};

const setState = (partialState) => {
	({
		supportsMultipleDictionaries = supportsMultipleDictionaries,
		dictionaryInstallationDirectory = dictionaryInstallationDirectory,
		availableDictionaries = availableDictionaries,
		enabledDictionaries = enabledDictionaries,
	} = partialState);

	updateChecker();
};

const initialize = async () => {
	const embeddedDictionaries = spellchecker.getAvailableDictionaries();
	const supportsMultipleDictionaries = embeddedDictionaries.length > 0 && process.platform !== 'win32';

	const directory = getDirectory('dictionaries', 'app');
	const dictionaryInstallationDirectory = directory.path();

	const installedDictionaries = (await directory.findAsync({ matching: '*.{aff,dic}' }))
		.map((fileName) => path.basename(fileName, path.extname(fileName)));

	const availableDictionaries = Array.from(new Set([...embeddedDictionaries, ...installedDictionaries])).sort();

	store.dispatch(loadSpellcheckingConfiguration({
		supportsMultipleDictionaries,
		dictionaryInstallationDirectory,
		availableDictionaries,
	}));

	connect(({
		preferences: {
			enabledDictionaries,
		},
		spellchecking: {
			supportsMultipleDictionaries,
			dictionaryInstallationDirectory,
			availableDictionaries,
		},
	}) => ({
		supportsMultipleDictionaries,
		dictionaryInstallationDirectory,
		availableDictionaries,
		enabledDictionaries,
	}))(setState);
};

export const spellchecking = {
	initialize,
	check,
	getCorrections,
	installDictionaries,
	getDictionaryInstallationDirectory: () => dictionaryInstallationDirectory,
	getAvailableDictionaries: () => availableDictionaries,
	getEnabledDictionaries: () => enabledDictionaries,
	supportsMultipleDictionaries: () => supportsMultipleDictionaries,
};

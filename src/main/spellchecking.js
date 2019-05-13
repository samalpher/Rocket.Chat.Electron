import { EventEmitter } from 'events';
import jetpack from 'fs-jetpack';
import mem from 'mem';
import path from 'path';
import spellchecker from 'spellchecker';
import { getDirectory } from '../utils';


const events = new EventEmitter();

let isMultiLanguage = false;
let dictionaryInstallationDirectory;
let availableDictionaries = [];
let enabledDictionaries = [];
let checker = () => true;

const filterDictionaries = (dictionaries) => (
	dictionaries
		.flatMap((dictionary) => {
			const matches = /^(\w+?)[-_](\w+)$/.exec(dictionary);
			return matches ?
				[`${ matches[1] }_${ matches[2] }`, `${ matches[1] }-${ matches[2] }`, matches[1]] :
				[dictionary];
		})
		.filter((dictionary) => availableDictionaries.includes(dictionary))
);

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

const getDictionaryInstallationDirectory = () => dictionaryInstallationDirectory;

const getAvailableDictionaries = () => availableDictionaries;

const getEnabledDictionaries = () => enabledDictionaries;

const setEnabledDictionaries = (...dictionaries) => {
	dictionaries = filterDictionaries(dictionaries);
	enabledDictionaries = isMultiLanguage ? dictionaries : dictionaries.slice(0, 1);
	updateChecker();
	events.emit('dictionaries-set', enabledDictionaries);
};

const toggleDictionary = (dictionary, enabled) => {
	const dictionaries = filterDictionaries([dictionary]);

	for (const dictionary of dictionaries) {
		const alreadyEnabled = enabledDictionaries.includes(dictionary);

		if (enabled && !alreadyEnabled) {
			enabledDictionaries = isMultiLanguage ? [...enabledDictionaries, dictionary] : [dictionary];
			break;
		}

		if (!enabled && alreadyEnabled) {
			enabledDictionaries = enabledDictionaries.filter((enabledDictionary) => enabledDictionary !== dictionary);
			break;
		}
	}

	updateChecker();
	events.emit('dictionaries-set', enabledDictionaries);
};

const initialize = async () => {
	const embeddedDictionaries = spellchecker.getAvailableDictionaries();
	isMultiLanguage = embeddedDictionaries.length > 0 && process.platform !== 'win32';

	const directory = getDirectory('dictionaries', 'app');
	dictionaryInstallationDirectory = directory.path();

	const installedDictionaries = (await directory.findAsync({ matching: '*.{aff,dic}' }))
		.map((fileName) => path.basename(fileName, path.extname(fileName)));

	availableDictionaries = Array.from(new Set([...embeddedDictionaries, ...installedDictionaries])).sort();
};

export const spellchecking = Object.assign(events, {
	initialize,
	check,
	getCorrections,
	getDictionaryInstallationDirectory,
	getAvailableDictionaries,
	getEnabledDictionaries,
	setEnabledDictionaries,
	toggleDictionary,
	installDictionaries,
});

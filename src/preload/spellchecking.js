import { webFrame } from 'electron';
import spellchecker from 'spellchecker';
import { store } from '../store';


const getMisspeledWords = (words) => {
	const {
		preferences: {
			enabledDictionaries,
		},
		spellchecking: {
			dictionaryInstallationDirectory,
		},
	} = store.getState();

	if (enabledDictionaries.length === 0 || words.length === 0) {
		return [];
	}

	return (
		enabledDictionaries.reduce((misspelledWords, dictionary) => {
			spellchecker.setDictionary(dictionary, dictionaryInstallationDirectory);
			return misspelledWords.filter((word) => spellchecker.isMisspelled(word));
		}, words)
	);
};

export default () => {
	webFrame.setSpellCheckProvider('', {
		spellCheck: (words, callback) => callback(getMisspeledWords(words)),
	});
};

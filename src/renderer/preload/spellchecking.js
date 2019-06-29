import { webFrame } from 'electron';
import spellchecker from 'spellchecker';
import { select } from 'redux-saga/effects';
import { getSaga } from '../store';


const getMisspeledWords = async (words, callback) => (await getSaga()).run(function* () {
	const {
		preferences: {
			enabledDictionaries,
		},
		spellchecking: {
			dictionaryInstallationDirectory,
		},
	} = yield select();

	if (enabledDictionaries.length === 0 || words.length === 0) {
		return [];
	}

	callback(
		enabledDictionaries.reduce((misspelledWords, dictionary) => {
			spellchecker.setDictionary(dictionary, dictionaryInstallationDirectory);
			return misspelledWords.filter((word) => spellchecker.isMisspelled(word));
		}, words)
	);
});

export default () => {
	webFrame.setSpellCheckProvider('', {
		spellCheck: (words, callback) => getMisspeledWords(words, callback),
	});
};

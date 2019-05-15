import {
	SPELLCHECKING_CONFIGURATION_LOADED,
	SPELLCHECKING_DICTIONARY_INSTALLED,
} from '../actions';


const filterState = ({
	supportsMultipleDictionaries = false,
	dictionaryInstallationDirectory,
	availableDictionaries = [],
}) => ({
	supportsMultipleDictionaries,
	dictionaryInstallationDirectory,
	availableDictionaries,
});

export const reducer = (state = filterState({}), { type, payload }) => {
	switch (type) {
		case SPELLCHECKING_CONFIGURATION_LOADED:
			return filterState(payload);

		case SPELLCHECKING_DICTIONARY_INSTALLED:
			return filterState({
				...state,
				availableDictionaries: [
					...state.availableDictionaries.filter((dictionary) => dictionary !== payload),
					payload,
				],
			});
	}

	return state;
};

import {
	SPELLCHECKING_CONFIGURATION_LOADED,
	SPELLCHECKING_DICTIONARY_INSTALLED,
	SPELLCHECKING_CORRECTIONS_UPDATED,
} from '../actions';


const filterState = ({
	supportsMultipleDictionaries = false,
	dictionaryInstallationDirectory,
	availableDictionaries = [],
	corrections = null,
}) => ({
	supportsMultipleDictionaries,
	dictionaryInstallationDirectory,
	availableDictionaries,
	corrections,
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

		case SPELLCHECKING_CORRECTIONS_UPDATED:
			return filterState({
				...state,
				corrections: payload,
			});
	}

	return state;
};

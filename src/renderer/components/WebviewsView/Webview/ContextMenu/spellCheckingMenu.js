import { remote } from 'electron';
import { t } from 'i18next';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { put, select, take } from 'redux-saga/effects';
import {
	SPELLCHECKING_CORRECTIONS_UPDATED,
	installSpellCheckingDictionaries,
	toggleSpellcheckingDictionary,
	updateSpellCheckingCorrections,
} from '../../../../../actions';
import { useFocusedWebContents } from '../../hooks';
import { useSagaMiddleware } from '../../../App/SagaMiddlewareProvider';


export const useSpellCheckingMenuTemplate = () => {
	const getFocusedWebContents = useFocusedWebContents();

	const dispatch = useDispatch();

	const dictionaryInstallationDirectory = useSelector(({
		spellchecking: {
			dictionaryInstallationDirectory,
		},
	}) => dictionaryInstallationDirectory);

	const onClickReplaceMispelling = (correction) => {
		getFocusedWebContents().replaceMisspelling(correction);
	};

	const onClickToggleDictionary = (dictionary, { checked }) => {
		dispatch(toggleSpellcheckingDictionary(dictionary, checked));
	};

	const onClickBrowserForDictionary = async () => {
		remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
			title: t('dialog.loadDictionary.title'),
			defaultPath: dictionaryInstallationDirectory,
			filters: [
				{ name: t('dialog.loadDictionary.dictionaries'), extensions: ['aff', 'dic'] },
				{ name: t('dialog.loadDictionary.allFiles'), extensions: ['*'] },
			],
			properties: ['openFile', 'multiSelections'],
		}, (filePaths = []) => {
			dispatch(installSpellCheckingDictionaries(filePaths));
		});
	};

	const sagaMiddleware = useSagaMiddleware();

	return useCallback(async ({
		isEditable,
		selectionText,
		corrections = [],
		dictionaries = [],
	}) => {
		if (!isEditable) {
			return [];
		}

		[corrections, dictionaries] = await sagaMiddleware.run(function* () {
			const [enabledDictionaries, availableDictionaries] = yield select(({
				preferences: {
					enabledDictionaries,
				},
				spellchecking: {
					availableDictionaries,
				},
			}) => [enabledDictionaries, availableDictionaries]);

			yield put(updateSpellCheckingCorrections(selectionText));

			const { payload: corrections } = yield take(SPELLCHECKING_CORRECTIONS_UPDATED);

			const dictionaries = availableDictionaries.map((dictionary) => ({
				dictionary,
				enabled: enabledDictionaries.includes(dictionary),
			}));

			return [corrections, dictionaries];
		}).toPromise();

		return	[
			...(corrections ? [
				...(corrections.length === 0 ? (
					[
						{
							label: t('contextMenu.noSpellingSuggestions'),
							enabled: false,
						},
					]
				) : (
					corrections.slice(0, 6).map((correction) => ({
						label: correction,
						click: onClickReplaceMispelling.bind(null, correction),
					}))
				)),
				...(corrections.length > 6 ? [
					{
						label: t('contextMenu.moreSpellingSuggestions'),
						submenu: corrections.slice(6).map((correction) => ({
							label: correction,
							click: onClickReplaceMispelling.bind(null, correction),
						})),
					},
				] : []),
				{ type: 'separator' },
			] : []),
			{
				label: t('contextMenu.spellingLanguages'),
				enabled: dictionaries.length > 0,
				submenu: [
					...dictionaries.map(({ dictionary, enabled }) => ({
						label: dictionary,
						type: 'checkbox',
						checked: enabled,
						click: onClickToggleDictionary.bind(null, dictionary),
					})),
					{ type: 'separator' },
					{
						label: t('contextMenu.browseForLanguage'),
						click: onClickBrowserForDictionary,
					},
				],
			},
			{ type: 'separator' },
		];
	});
};

import { Menu, BrowserWindow } from 'electron';
import { EventEmitter } from 'events';
import { t } from 'i18next';
import { select } from 'redux-saga/effects';
import { getSaga } from '../../store';


const events = new EventEmitter();

const createSpellCheckingMenuTemplate = ({
	corrections = [],
	dictionaries = [],
	isEditable,
}) => {
	if (!isEditable) {
		return [];
	}

	return [
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
					click: () => events.emit('replace-misspelling', correction),
				}))
			)),
			...(corrections.length > 6 ? [
				{
					label: t('contextMenu.moreSpellingSuggestions'),
					submenu: corrections.slice(6).map((correction) => ({
						label: correction,
						click: () => events.emit('replace-misspelling', correction),
					})),
				},
			] : []),
			{
				type: 'separator',
			},
		] : []),
		{
			label: t('contextMenu.spellingLanguages'),
			enabled: dictionaries.length > 0,
			submenu: [
				...dictionaries.map(({ dictionary, enabled }) => ({
					label: dictionary,
					type: 'checkbox',
					checked: enabled,
					click: ({ checked }) => events.emit('toggle-dictionary', dictionary, checked),
				})),
				{
					type: 'separator',
				},
				{
					label: t('contextMenu.browseForLanguage'),
					click: () => events.emit('browse-for-dictionary'),
				},
			],
		},
		{
			type: 'separator',
		},
	];
};

const createImageMenuTemplate = ({
	mediaType,
	srcURL,
}) => (
	mediaType === 'image' ?
		[
			{
				label: t('contextMenu.saveImageAs'),
				click: () => events.emit('save-image-as', srcURL),
			},
			{
				type: 'separator',
			},
		] :
		[]
);

const createLinkMenuTemplate = ({
	linkURL,
	linkText,
}) => (
	linkURL ?
		[
			{
				label: t('contextMenu.openLink'),
				click: () => events.emit('open-link', linkURL),
			},
			{
				label: t('contextMenu.copyLinkText'),
				enabled: !!linkText,
				click: () => events.emit('copy-link-text', { text: linkText, url: linkURL }),
			},
			{
				label: t('contextMenu.copyLinkAddress'),
				click: () => events.emit('copy-link-address', { text: linkText, url: linkURL }),
			},
			{
				type: 'separator',
			},
		] :
		[]
);

const createDefaultMenuTemplate = ({
	editFlags: {
		canUndo = false,
		canRedo = false,
		canCut = false,
		canCopy = false,
		canPaste = false,
		canSelectAll = false,
	} = {},
} = {}) => [
	{
		label: t('contextMenu.undo'),
		accelerator: 'CommandOrControl+Z',
		enabled: canUndo,
		click: () => events.emit('undo'),
	},
	{
		label: t('contextMenu.redo'),
		accelerator: process.platform === 'win32' ? 'Control+Y' : 'CommandOrControl+Shift+Z',
		enabled: canRedo,
		click: () => events.emit('redo'),
	},
	{
		type: 'separator',
	},
	{
		label: t('contextMenu.cut'),
		accelerator: 'CommandOrControl+X',
		enabled: canCut,
		click: () => events.emit('cut'),
	},
	{
		label: t('contextMenu.copy'),
		accelerator: 'CommandOrControl+C',
		enabled: canCopy,
		click: () => events.emit('copy'),
	},
	{
		label: t('contextMenu.paste'),
		accelerator: 'CommandOrControl+V',
		enabled: canPaste,
		click: () => events.emit('paste'),
	},
	{
		label: t('contextMenu.selectAll'),
		accelerator: 'CommandOrControl+A',
		enabled: canSelectAll,
		click: () => events.emit('select-all'),
	},
];

const trigger = async (params) => {
	const menu = Menu.buildFromTemplate([
		...createSpellCheckingMenuTemplate(params),
		...createImageMenuTemplate(params),
		...createLinkMenuTemplate(params),
		...createDefaultMenuTemplate(params),
	]);

	(await getSaga()).run(function* trigger() {
		const mainWindow = yield select(({ mainWindow: { id } }) => BrowserWindow.fromId(id));
		menu.popup({ window: mainWindow });
	});
};

export const contextMenu = Object.assign(events, {
	trigger,
});

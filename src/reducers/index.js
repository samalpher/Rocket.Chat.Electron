import { combineReducers } from 'redux';
import { reducer as certificates } from './certificates';
import { reducer as downloads } from './downloads';
import { reducer as editFlags } from './editFlags';
import { reducer as historyFlags } from './historyFlags';
import { reducer as loading } from './loading';
import { reducer as mainWindow } from './mainWindow';
import { reducer as modal } from './modal';
import { reducer as preferences } from './preferences';
import { reducer as screensharing } from './screensharing';
import { reducer as servers } from './servers';
import { reducer as spellchecking } from './spellchecking';
import { reducer as update } from './update';
import { reducer as webviews } from './webviews';


export const rootReducer = combineReducers({
	certificates,
	downloads,
	editFlags,
	historyFlags,
	loading,
	mainWindow,
	modal,
	preferences,
	screensharing,
	servers,
	spellchecking,
	update,
	webviews,
});

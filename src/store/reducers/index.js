import { combineReducers } from 'redux';
import { reducer as certificates } from './certificates';
import { reducer as editFlags } from './editFlags';
import { reducer as historyFlags } from './historyFlags';
import { reducer as loading } from './loading';
import { reducer as modal } from './modal';
import { reducer as preferences } from './preferences';
import { reducer as screensharing } from './screensharing';
import { reducer as servers } from './servers';
import { reducer as spellchecking } from './spellchecking';
import { reducer as update } from './update';
import { reducer as view } from './view';
import { reducer as windowState } from './windowState';


export const reducer = combineReducers({
	certificates,
	editFlags,
	historyFlags,
	loading,
	modal,
	preferences,
	screensharing,
	servers,
	spellchecking,
	update,
	view,
	windowState,
});

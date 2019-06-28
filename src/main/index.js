import { setupErrorHandling } from '../errorHandling';
import { store } from '../store';
import { appLaunched } from '../store/actions';
import './app';
import './basicAuth';
import './certificates';
import './config';
import './deepLinks';
import './downloads';
import './mainWindow';
import './spellchecking';
import './updates';


setupErrorHandling('main');
store.dispatch(appLaunched(process.argv.slice(2)));

export { contextMenu } from './contextMenu';
export { dock } from './dock';
export { menus } from './menus';
export { touchBar } from './touchBar';
export { tray } from './tray';

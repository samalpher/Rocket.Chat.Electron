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

export * from './ui';

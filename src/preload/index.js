import { remote } from 'electron';
import i18n from '../i18n';
import setupEventsPreload from './events';
import setupFormatPreload from './format';
import setupJitsiPreload from './jitsi';
import setupLinksPreload from './links';
import setupNotificationsPreload from './notifications';
import setupScreensharingPreload from './screensharing';
import setupSidebarPreload from './sidebar';
import setupSpellcheckingPreload from './spellchecking';
import setupTitleChangePreload from './titleChange';
import setupUserPresencePreload from './userPresence';
import { store } from '../store';
import { reloadWebview } from '../store/actions';
const { getCurrentWebContents } = remote;


setupEventsPreload();
setupFormatPreload();
setupJitsiPreload();
setupLinksPreload();
setupNotificationsPreload();
setupScreensharingPreload();
setupSidebarPreload();
setupSpellcheckingPreload();
setupTitleChangePreload();
setupUserPresencePreload();

window.reloadServer = () => store.dispatch(reloadWebview({ webContentsId: getCurrentWebContents().id, fromUrl: true }));
window.i18n = i18n;

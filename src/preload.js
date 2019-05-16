import { ipcRenderer } from 'electron';
import i18n from './i18n';
import { reloadServer } from './preload/channels';
import setupEventsPreload from './preload/events';
import setupFormatPreload from './preload/format';
import setupJitsiPreload from './preload/jitsi';
import setupLinksPreload from './preload/links';
import setupNotificationsPreload from './preload/notifications';
import setupScreensharingPreload from './preload/screensharing';
import setupSidebarPreload from './preload/sidebar';
import setupSpellcheckingPreload from './preload/spellchecking';
import setupTitleChangePreload from './preload/titleChange';
import setupUserPresencePreload from './preload/userPresence';


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

window.reloadServer = () => ipcRenderer.sendToHost(reloadServer);
window.i18n = i18n;

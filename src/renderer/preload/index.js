import { setupErrorHandling } from '../../errorHandling';
import { setupStore } from '../store';
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


setupErrorHandling('preload');
setupStore();
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

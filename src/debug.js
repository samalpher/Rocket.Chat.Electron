import createDebugger from 'debug';

export const rc = createDebugger('rc');

export const data = rc.extend('data');

export const store = rc.extend('store');

export const service = rc.extend('service');

export const i18n = service.extend('i18n');

export const certificates = service.extend('certificates');

export const deepLinks = service.extend('deep-links');

export const downloads = service.extend('downloads');

export const spellChecking = service.extend('spell-checking');

export const updates = service.extend('updates');

export const TRIGGER_CONTEXT_MENU = 'TRIGGER_CONTEXT_MENU';

export const triggerContextMenu = (params) => ({
	type: TRIGGER_CONTEXT_MENU,
	payload: params,
});

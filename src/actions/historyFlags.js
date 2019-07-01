export const HISTORY_FLAGS_UPDATED = 'HISTORY_FLAGS_UPDATED';

export const historyFlagsUpdated = (flags) => ({
	type: HISTORY_FLAGS_UPDATED,
	payload: flags,
});

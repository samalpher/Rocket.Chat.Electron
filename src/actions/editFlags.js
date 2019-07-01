export const EDIT_FLAGS_UPDATED = 'EDIT_FLAGS_UPDATED';

export const editFlagsUpdated = (flags) => ({
	type: EDIT_FLAGS_UPDATED,
	payload: flags,
});

export const DEEP_LINK_REQUESTED = 'DEEP_LINK_REQUESTED';
export const COMMAND_LINE_ARGUMENT_PASSED = 'COMMAND_LINE_ARGUMENT_PASSED';
export const PROCESS_AUTH_DEEP_LINK = 'PROCESS_AUTH_DEEP_LINK';
export const PROCESS_ROOM_DEEP_LINK = 'PROCESS_ROOM_DEEP_LINK';

export const deepLinkRequested = (event, url) => ({
	type: DEEP_LINK_REQUESTED,
	payload: { event, url },
});

export const commandLineArgumentPassed = (arg) => ({
	type: COMMAND_LINE_ARGUMENT_PASSED,
	payload: arg,
});

export const processAuthDeepLink = ({ url, token, userId }) => ({
	type: PROCESS_AUTH_DEEP_LINK,
	payload: { url, token, userId },
});

export const processRoomDeepLink = ({ url, rid, path }) => ({
	type: PROCESS_ROOM_DEEP_LINK,
	payload: { url, rid, path },
});

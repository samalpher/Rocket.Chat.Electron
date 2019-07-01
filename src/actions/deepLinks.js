export const PROCESS_AUTH_DEEP_LINK = 'PROCESS_AUTH_DEEP_LINK';
export const PROCESS_ROOM_DEEP_LINK = 'PROCESS_ROOM_DEEP_LINK';

export const processAuthDeepLink = ({ url, token, userId }) => ({
	type: PROCESS_AUTH_DEEP_LINK,
	payload: { url, token, userId },
});

export const processRoomDeepLink = ({ url, rid, path }) => ({
	type: PROCESS_ROOM_DEEP_LINK,
	payload: { url, rid, path },
});

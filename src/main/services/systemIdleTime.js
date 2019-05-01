import idle from '@paulcbetts/system-idle-time';

const get = () => idle.getIdleTime();

export const systemIdleTime = {
	get,
};

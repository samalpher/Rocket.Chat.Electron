export const normalizeServerUrl = (url) => {
	if (!url) {
		return null;
	}

	url = url.replace(/\/$/, '');

	if (!/^https?:\/\//.test(url)) {
		return `https://${ url }`;
	}

	return url;
};

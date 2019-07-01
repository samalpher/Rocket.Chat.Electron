export const SCREENSHARING_SOURCE_SELECTED = 'SCREENSHARING_SOURCE_SELECTED';

export const screensharingSourceSelected = (sourceId) => ({
	type: SCREENSHARING_SOURCE_SELECTED,
	payload: sourceId,
});

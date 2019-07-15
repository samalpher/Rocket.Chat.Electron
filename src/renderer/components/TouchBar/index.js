import { nativeImage, remote } from 'electron';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { showServer, formatButtonTouched } from '../../../actions';
import boldIcon from './bold.png';
import italicIcon from './italic.png';
import strikeIcon from './strike.png';
import inlineCodeIcon from './inlineCode.png';
import multiLineIcon from './multiLine.png';


export function TouchBar() {
	const [servers, activeServerUrl] = useSelector(({ servers, preferences: { view: { url } = {} } }) => [servers, url]);

	const { t } = useTranslation();

	const shouldUseSegmentedControl = useMemo(() => {
		const serverTitlesLength = servers.reduce((length, { url, title }) => length + (title || url).length, 0);
		const maxLengthForSegmentsControl = 76 - t('touchBar.selectServer').length;
		return serverTitlesLength <= maxLengthForSegmentsControl;
	}, [servers, activeServerUrl]);

	const dispatch = useDispatch();

	const onSelectServer = (url) => {
		dispatch(showServer(url));
	};

	const selectServerControl = useMemo(() => (
		shouldUseSegmentedControl
			? new remote.TouchBar.TouchBarSegmentedControl({
				segmentStyle: 'separated',
				segments: servers.map(({ title }) => ({ label: title })),
				selectedIndex: servers.findIndex(({ url }) => url === activeServerUrl),
				change: (index) => onSelectServer(servers[index].url),
			})
			: new remote.TouchBar.TouchBarScrubber({
				items: servers.map(({ title }) => ({ label: title })),
				highlight: (index) => onSelectServer(servers[index].url),
				selectedStyle: 'background',
				showArrowButtons: true,
				mode: 'fixed',
			})
	), [shouldUseSegmentedControl]);

	useEffect(() => {
		if (shouldUseSegmentedControl) {
			selectServerControl.segments = servers.map((server) => ({ label: server.title, server }));
			selectServerControl.selectedIndex = servers.findIndex(({ url }) => url === activeServerUrl);
		} else {
			selectServerControl.items = servers.map((server) => ({ label: server.title, server }));
		}
	}, [shouldUseSegmentedControl, servers, activeServerUrl]);

	const onTouchFormatButton = (buttonId) => {
		dispatch(formatButtonTouched(buttonId));
	};

	const icons = useMemo(() => ({
		bold: nativeImage.createFromDataURL(boldIcon),
		italic: nativeImage.createFromDataURL(italicIcon),
		strike: nativeImage.createFromDataURL(strikeIcon),
		inline_code: nativeImage.createFromDataURL(inlineCodeIcon),
		multi_line: nativeImage.createFromDataURL(multiLineIcon),
	}), []);

	useEffect(() => {
		const touchBar = new remote.TouchBar({
			items: [
				new remote.TouchBar.TouchBarPopover({
					label: t('touchBar.selectServer'),
					items: new remote.TouchBar({
						items: [
							new remote.TouchBar.TouchBarLabel({ label: t('touchBar.selectServer') }),
							selectServerControl,
						],
					}),
				}),
				new remote.TouchBar.TouchBarLabel({ label: t('touchBar.formatting') }),
				...(
					['bold', 'italic', 'strike', 'inline_code', 'multi_line']
						.map((buttonId) => new remote.TouchBar.TouchBarButton({
							icon: icons[buttonId],
							click: () => onTouchFormatButton(buttonId),
						}))
				),
			],
		});
		remote.getCurrentWindow().setTouchBar(touchBar);
	}, [shouldUseSegmentedControl, servers, activeServerUrl]);

	useEffect(() => () => {
		remote.getCurrentWindow().setTouchBar(null);
	}, []);

	return null;
}

import { nativeImage, TouchBar, BrowserWindow } from 'electron';
import { EventEmitter } from 'events';
import { t } from 'i18next';
import { getStore } from '../../store';
import { showServer, formatButtonTouched } from '../../../store/actions';
import boldIcon from './bold.png';
import italicIcon from './italic.png';
import strikeIcon from './strike.png';
import inlineCodeIcon from './inlineCode.png';
import multiLineIcon from './multiLine.png';
import { connect } from '../../../utils/store';
const {
	TouchBarButton,
	TouchBarLabel,
	TouchBarSegmentedControl,
	TouchBarScrubber,
	TouchBarPopover,
} = TouchBar;


let props = {
	mainWindow: null,
	servers: [],
	activeServerUrl: null,
};

const events = new EventEmitter();

let isUsingSegmentedControl;
let selectServerControl;

const createSegmentedControl = () => (
	new TouchBarSegmentedControl({
		segmentStyle: 'separated',
		segments: props.servers.map((server) => ({ label: server.title, server })),
		selectedIndex: props.servers.findIndex(({ url }) => url === props.activeServerUrl),
		change: (index) => props.onSelectServer(props.servers[index].url),
	})
);

const createScrubber = () => (
	new TouchBarScrubber({
		items: props.servers.map((server) => ({ label: server.title, server })),
		highlight: (index) => props.onSelectServer(props.servers[index].url),
		selectedStyle: 'background',
		showArrowButtons: true,
		mode: 'fixed',
	})
);

const createTouchBar = (selectServerControl) => {
	const icons = {
		bold: nativeImage.createFromDataURL(boldIcon),
		italic: nativeImage.createFromDataURL(italicIcon),
		strike: nativeImage.createFromDataURL(strikeIcon),
		inline_code: nativeImage.createFromDataURL(inlineCodeIcon),
		multi_line: nativeImage.createFromDataURL(multiLineIcon),
	};

	return new TouchBar({
		items: [
			new TouchBarPopover({
				label: t('touchBar.selectServer'),
				items: new TouchBar({
					items: [
						new TouchBarLabel({ label: t('touchBar.selectServer') }),
						selectServerControl,
					],
				}),
			}),
			new TouchBarLabel({ label: t('touchBar.formatting') }),
			...(
				['bold', 'italic', 'strike', 'inline_code', 'multi_line']
					.map((buttonId) => new TouchBarButton({
						icon: icons[buttonId],
						click: () => props.onTouchFormatButton(buttonId),
					}))
			),
		],
	});
};

const render = () => {
	if (process.platform !== 'darwin') {
		return;
	}

	const { mainWindow, servers, activeServerUrl } = props;
	const serverTitlesLength = servers.reduce((length, { url, title }) => length + (title || url).length, 0);
	const maxLengthForSegmentsControl = 76 - t('touchBar.selectServer').length;
	const shouldUseSegmentedControl = serverTitlesLength <= maxLengthForSegmentsControl;

	if (isUsingSegmentedControl !== shouldUseSegmentedControl) {
		selectServerControl = shouldUseSegmentedControl ? createSegmentedControl(props) : createScrubber(props);
		mainWindow.setTouchBar(createTouchBar(selectServerControl));
		isUsingSegmentedControl = shouldUseSegmentedControl;
	}

	if (isUsingSegmentedControl) {
		selectServerControl.segments = servers.map((server) => ({ label: server.title, server }));
		selectServerControl.selectedIndex = servers.findIndex(({ url }) => url === activeServerUrl);
	} else {
		selectServerControl.items = servers.map((server) => ({ label: server.title, server }));
	}
};

const setProps = (newProps) => {
	props = newProps;
	render();
};

const mapStateToProps = ({
	mainWindow: {
		id,
	},
	servers,
	view,
}) => ({
	mainWindow: BrowserWindow.fromId(id),
	servers,
	activeServerUrl: view.url,
	onSelectServer: (url) => {
		Promise.resolve(getStore())
			.then((store) => store.dispatch(showServer(url)));
	},
	onTouchFormatButton: (buttonId) => {
		Promise.resolve(getStore())
			.then((store) => store.dispatch(formatButtonTouched(buttonId)));
	},
});

let disconnect;

const mount = () => {
	if (process.platform !== 'darwin') {
		return;
	}

	disconnect = connect(getStore(), mapStateToProps)(setProps);
};

const unmount = () => {
	if (process.platform !== 'darwin') {
		return;
	}

	disconnect();

	events.removeAllListeners();
	props.mainWindow.setTouchBar(null);
	isUsingSegmentedControl = false;
	selectServerControl = null;
};

export const touchBar = Object.assign(events, {
	mount,
	unmount,
});

import { nativeImage, TouchBar } from 'electron';
import { EventEmitter } from 'events';
import i18n from '../i18n';
import { connect } from '../store';
import { mainWindow } from './mainWindow';
const {
	TouchBarButton,
	TouchBarLabel,
	TouchBarSegmentedControl,
	TouchBarScrubber,
	TouchBarPopover,
} = TouchBar;


let props = {
	servers: [],
	activeServerUrl: null,
};

const events = new EventEmitter();

let isUsingSegmentedControl;
let selectServerControl;

const createSegmentedControl = ({ servers, activeServerUrl, onSelectServer }) => (
	new TouchBarSegmentedControl({
		segmentStyle: 'separated',
		segments: servers.map((server) => ({ label: server.title, server })),
		selectedIndex: servers.findIndex(({ url }) => url === activeServerUrl),
		change: (index) => onSelectServer(servers[index].url),
	})
);

const createScrubber = ({ servers, onSelectServer }) => (
	new TouchBarScrubber({
		items: servers.map((server) => ({ label: server.title, server })),
		highlight: (index) => onSelectServer(servers[index].url),
		selectedStyle: 'background',
		showArrowButtons: true,
		mode: 'fixed',
	})
);

const createTouchBar = (selectServerControl, onTouchFormatButton) => (
	new TouchBar({
		items: [
			new TouchBarPopover({
				label: i18n.__('touchBar.selectServer'),
				items: new TouchBar({
					items: [
						new TouchBarLabel({ label: i18n.__('touchBar.selectServer') }),
						selectServerControl,
					],
				}),
			}),
			new TouchBarLabel({ label: i18n.__('touchBar.formatting') }),
			...(
				['bold', 'italic', 'strike', 'inline_code', 'multi_line']
					.map((buttonId) => new TouchBarButton({
						backgroundColor: '#A4A4A4',
						icon: nativeImage.createFromPath(`${ __dirname }/public/images/touch-bar/${ buttonId }.png`),
						click: () => onTouchFormatButton(buttonId),
					}))
			),
		],
	})
);

const render = () => {
	if (process.platform !== 'darwin') {
		return;
	}

	const { servers, activeServerUrl, onTouchFormatButton } = props;
	const serverTitlesLength = servers.reduce((length, { url, title }) => length + (title || url).length, 0);
	const maxLengthForSegmentsControl = 76 - i18n.__('touchBar.selectServer').length;
	const shouldUseSegmentedControl = serverTitlesLength <= maxLengthForSegmentsControl;

	if (isUsingSegmentedControl !== shouldUseSegmentedControl) {
		selectServerControl = shouldUseSegmentedControl ? createSegmentedControl(props) : createScrubber(props);
		mainWindow.setTouchBar(createTouchBar(selectServerControl, onTouchFormatButton));
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
	servers,
	view,
}) => ({
	servers,
	activeServerUrl: view.url,
	onSelectServer: (url) => event.emit('select-server', url),
	onTouchFormatButton: (buttonId) => events.emit('format', buttonId),
});

let disconnect;

const mount = () => {
	if (process.platform !== 'darwin') {
		return;
	}

	render();

	disconnect = connect(mapStateToProps)(setProps);
};

const unmount = () => {
	if (process.platform !== 'darwin') {
		return;
	}

	disconnect();

	events.removeAllListeners();
	mainWindow.setTouchBar(null);
};

export const touchBar = Object.assign(events, {
	mount,
	unmount,
});

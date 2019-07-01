import { remote } from 'electron';
import { getStore } from '../store';
import { focusMainWindow, showServer } from '../../actions';
import { getServerUrl } from './getServerUrl';
const { Notification: ElectronNotification, nativeImage } = remote.require('electron');
const fetchWithoutOrigin = remote.require('electron-fetch').default;


const avatarCache = {};

const getAvatarUrlAsDataUrl = async (avatarUrl) => {
	if (/^data:/.test(avatarUrl)) {
		return avatarUrl;
	}

	if (avatarCache[avatarUrl]) {
		return avatarCache[avatarUrl];
	}

	const response = await fetchWithoutOrigin(avatarUrl);
	const arrayBuffer = await response.arrayBuffer();
	const byteArray = Array.from(new Uint8Array(arrayBuffer));
	const binaryString = byteArray.reduce((binaryString, byte) => binaryString + String.fromCharCode(byte), '');
	const base64String = btoa(binaryString);
	const contentType = response.headers.get('content-type');
	avatarCache[avatarUrl] = `data:${ contentType };base64,${ base64String }`;
	return avatarCache[avatarUrl];
};

class Notification extends EventTarget {
	static requestPermission() {
		return;
	}

	static get permission() {
		return 'granted';
	}

	constructor(title, options) {
		super();
		this.create({ title, ...options });
	}

	async create({ icon, canReply, ...options }) {
		if (icon) {
			icon = nativeImage.createFromDataURL(await getAvatarUrlAsDataUrl(icon));
		}

		const notification = new ElectronNotification({ icon, hasReply: canReply, ...options });

		notification.on('show', this.handleShow.bind(this));
		notification.on('close', this.handleClose.bind(this));
		notification.on('click', this.handleClick.bind(this));
		notification.on('reply', this.handleReply.bind(this));
		notification.on('action', this.handleAction.bind(this));

		notification.show();

		this.notification = notification;
	}

	handleShow(event) {
		this.onshow && this.onshow.call(this, event);
		this.dispatchEvent(new CustomEvent('show'));
	}

	handleClose(event) {
		this.onclose && this.onclose.call(this, event);
		this.dispatchEvent(new CustomEvent('close'));
	}

	async handleClick(event) {
		(await getStore()).dispatch(focusMainWindow());
		(await getStore()).dispatch(showServer(await getServerUrl()));
		this.onclick && this.onclick.call(this, event);
		this.dispatchEvent(new CustomEvent('close'));
	}

	handleReply(event, response) {
		this.onreply && this.onreply.call(this, event);
		this.dispatchEvent(Object.assign(new CustomEvent('reply'), { response }));
	}

	handleAction(event, index) {
		this.onaction && this.onaction.call(this, event);
		this.dispatchEvent(Object.assign(new CustomEvent('action'), { index }));
	}

	close() {
		if (!this.notification) {
			return;
		}

		this.notification.close();
		this.notification = null;
	}
}

export default () => {
	window.Notification = Notification;
};

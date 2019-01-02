import { remote } from 'electron';
import htm from 'htm';
import React from 'react';
import { __ } from '../../i18n';
const { getCurrentWindow, Menu } = remote;
const html = htm.bind(React.createElement);


export default class Server extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			faviconLoaded: false,
			hotkeyVisible: false,
		};

		this.handleFaviconLoad = this.handleFaviconLoad.bind(this);
		this.handleKeyDownForHotKeys = this.handleKeyStateForHotKeys.bind(this, true);
		this.handleKeyUpForHotKeys = this.handleKeyStateForHotKeys.bind(this, false);
		this.handleContextMenu = this.handleContextMenu.bind(this);
	}

	handleFaviconLoad() {
		this.setState({ faviconLoaded: true });
	}

	handleKeyStateForHotKeys(hotkeyVisible, event) {
		if (['Control', 'Meta'].includes(event.key)) {
			this.setState({ hotkeyVisible });
		}
	}

	handleContextMenu(event) {
		event.preventDefault();
		const template = this.createMenuTemplate();
		const menu = Menu.buildFromTemplate(template);
		menu.popup(getCurrentWindow());
	}

	createMenuTemplate() {
		const { onReload, onRemove, onOpenDevToolsFor } = this.props;

		return [
			{
				label: __('Reload_server'),
				click: onReload,
			},
			{
				label: __('Remove_server'),
				click: onRemove,
			},
			{
				type: 'separator',
			},
			{
				label: __('Open DevTools'),
				click: onOpenDevToolsFor,
			},
		];
	}

	componentDidMount() {
		window.addEventListener('keydown', this.handleKeyDownForHotKeys, false);
		window.addEventListener('keyup', this.handleKeyUpForHotKeys, false);
	}

	componentWillUnmount() {
		window.removeEventListener('keydown', this.handleKeyDownForHotKeys, false);
		window.removeEventListener('keyup', this.handleKeyUpForHotKeys, false);
	}

	createInitials(title) {
		let name = title.replace(/^https?:\/\/(?:www\.)?([^\/]+)(.*)/, '$1')
			.split('.');
		name = name[0][0] + (name[1] ? name[1][0] : '');
		return name.toUpperCase();
	}

	render() {
		const {
			active,
			badge,
			index,
			moving,
			title,
			url,
			onActivate,
			onDragOver,
			onDragStart,
			onDragEnter,
			onDragEnd,
			onDrop,
		} = this.props;

		const {
			faviconLoaded,
			hotkeyVisible,
		} = this.state;

		const className = [
			'ServerList__item',
			'Server',
			active && 'Server--active',
			moving && 'Server--moving',
			badge && 'Server--unread',
		].filter(Boolean).join(' ');

		return html`
		<li
			className=${ className }
			draggable="true"
			data-tooltip=${ title }
			onClick=${ onActivate }
			onContextMenu=${ this.handleContextMenu }
			onDragOver=${ onDragOver }
			onDragStart=${ onDragStart }
			onDragEnter=${ onDragEnter }
			onDragEnd=${ onDragEnd }
			onDrop=${ onDrop }
		>
			<span style=${ { display: faviconLoaded ? 'none' : '' } }>${ this.createInitials(title) }</span>
			<div className="Server__badge">${ badge }</div>
			<img
				style=${ { display: faviconLoaded ? 'initial' : '' } }
				src=${ `${ url.replace(/\/$/, '') }/assets/favicon.svg` }
				onLoad=${ faviconLoaded ? null : this.handleFaviconLoad }
			/>
			${ hotkeyVisible ? html`
				<div className="Server__hotkey">${ `${ process.platform === 'darwin' ? '⌘' : '^' }${ index }` }</div>
			` : null }
		</li>
		`;
	}
}

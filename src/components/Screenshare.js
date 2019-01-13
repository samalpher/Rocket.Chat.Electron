import { desktopCapturer, ipcRenderer } from 'electron';
import React from 'react';
import { __ } from '../i18n';


export default class Screenshare extends React.PureComponent {
	state = {
		sources: [],
	}

	updateScreens = () => {
		if (!this.updatingScreens) {
			return;
		}

		desktopCapturer.getSources({ types: ['window', 'screen'] }, (error, sources) => {
			if (error) {
				throw error;
			}

			this.setState({
				sources: sources.map(({ id, name, thumbnail }) => ({ id, name, thumbnail: thumbnail.toDataURL() })),
			});

			setTimeout(this.updateScreens, 1000);
		});
	}

	handleScreeshareSelected = (id) => {
		ipcRenderer.send('select-screenshare-source', id);
		window.close();
	}

	componentDidMount() {
		document.title = __('Share_Your_Screen');
		this.updatingScreens = true;
		this.updateScreens();
	}

	componentWillUnmount() {
		this.updatingScreens = false;
	}

	render = () => (
		<div className="screenshare__wrapper">
			<h1 className="screenshare-title">{ __('Select_a_screen_to_share') }</h1>
			<div className="screenshare-sources">
				{this.state.sources.map(({ id, name, thumbnail }) => (
					<div key={id} className="screenshare-source" onClick={ this.handleScreeshareSelected.bind(this, id) }>
						<div className="screenshare-source-thumbnail">
							<img src={ thumbnail } alt={ name } />
						</div>
						<div className="screenshare-source-name">{ name }</div>
					</div>
				))}
			</div>
		</div>
	)
}

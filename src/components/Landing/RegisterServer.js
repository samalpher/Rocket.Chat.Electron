import htm from 'htm';
import React from 'react';
import { __ } from '../../i18n';
import { connect } from '../AppState';
const html = htm.bind(React.createElement);


class RegisterServer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			online: false,
			processing: false,
			value: '',
		};

		this.handleConnectionState = this.handleConnectionState.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
	}

	handleConnectionState() {
		this.setState({
			online: navigator.onLine,
			error: !navigator.onLine ? __('Check_connection') : null,
		});
	}

	async handleSubmit(event) {
		const { onProcessServerUrl } = this.props;
		const { value } = this.state;

		event.preventDefault();

		this.setState({ processing: true, error: null });

		const { url, result } = await onProcessServerUrl(value);

		this.setState({ value: url, processing: false });

		switch (result) {
			case 'valid': {
				this.setState({ value: '' });
				break;
			}

			case 'basic-auth': {
				this.setState({ error: __('Auth_needed_try', 'username:password@host') });
				break;
			}

			case 'invalid': {
				this.setState({ error: __('No_valid_server_found') });
				break;
			}

			case 'timeout': {
				this.setState({ error: __('Timeout_trying_to_connect') });
				break;
			}
		}
	}

	handleInputChange({ target: { value } }) {
		this.setState({ value });
	}

	componentWillMount() {
		window.addEventListener('online', this.handleConnectionState, false);
		window.addEventListener('offline', this.handleConnectionState, false);
		this.handleConnectionState();
	}

	componentWillUnmount() {
		window.removeEventListener('online', this.handleConnectionState, false);
		window.removeEventListener('offline', this.handleConnectionState, false);
	}

	render() {
		const { error, online, processing, value } = this.state;

		return html`
		<form className="RegisterServer" onSubmit=${ this.handleSubmit }>
			${ online ? html`<h2 className="RegisterServer__label">${ __('Enter_your_server_URL') }</h2>` : null }

			${ online ? html`<div className="RegisterServer__input-wrapper">
				<input
					type="text"
					name="url"
					value=${ value }
					onChange=${ this.handleInputChange }
					placeholder="https://open.rocket.chat"
					autoFocus
					className=${ ['RegisterServer__input', error && 'RegisterServer__input--error'].filter(Boolean).join(' ') }
				/>
			</div>` : null }

			${ error ? html`
				<div className="RegisterServer__error">${ error }</div>
			` : null }

			${ online ? html`<div className="RegisterServer__actions">
				<button type="submit" disabled=${ processing } className="RegisterServer__submit">
					${ processing ? __('Validating') : __('Connect') }
				</button>
			</div>` : null }
		</form>
		`;
	}
}


export default connect(({ onProcessServerUrl }) => ({ onProcessServerUrl }))(RegisterServer);

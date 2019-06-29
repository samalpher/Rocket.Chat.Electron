import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../Button';
import { RocketChatLogo } from '../RocketChatLogo';
import { useConnectionStatus, useForm, useView } from './hooks';
import {
	Outer,
	Inner,
	OfflineCard,
	ConnectToServerForm,
	ConnectToServerLabel,
	ConnectToServerInput,
	ConnectToServerError,
} from './styles';


const defaultServerUrl = 'https://open.rocket.chat';

export function LandingView() {
	const visible = useView();

	const offline = useConnectionStatus();

	const {
		serverUrl,
		error,
		validating,
		handleSubmit,
		handleServerUrlChange,
	} = useForm();

	const { t } = useTranslation();

	return (
		<Outer visible={visible}>
			<Inner>
				<RocketChatLogo dark />
				{offline ?
					(
						<OfflineCard>
							{t('error.offline')}
						</OfflineCard>
					) :
					(
						<ConnectToServerForm method="/" onSubmit={handleSubmit}>
							<ConnectToServerLabel>
								{t('landing.inputUrl')}
							</ConnectToServerLabel>

							<ConnectToServerInput
								type="text"
								placeholder={defaultServerUrl}
								dir="auto"
								value={serverUrl}
								error={error}
								onChange={handleServerUrlChange}
							/>

							<Button type="submit" primary disabled={validating}>
								{validating ? t('landing.validating') : t('landing.connect')}
							</Button>

							{error && (
								<ConnectToServerError>
									{error}
								</ConnectToServerError>
							)}
						</ConnectToServerForm>
					)}
			</Inner>
		</Outer>
	);
}

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import i18n from '../../i18n';


export const PreferencesView = (
	function PreferencesView({ visible }) {
		return (
			<section
				css={css`
					position: absolute;
					left: 0;
					top: 0;
					right: 0;
					bottom: 0;
					display: flex;
					flex-flow: column nowrap;
					transition: opacity linear 100ms;
					opacity: ${ visible ? 1 : 0 };
					${ visible && css`z-index: 1;` };
					background-color: var(--color-dark);
					overflow-y: auto;
					-webkit-app-region: drag;
				`}
			>
				<header
					css={css`
						flex: 0 0 auto;
						display: flex;
						flex-flow: row nowrap;
						align-items: center;
						padding: 1rem;
						border-bottom: 1px solid var(--color-dark-70);
					`}
				>
					<h2
						css={css`
							flex: 1;
							color: var(--color-dark-30);
							margin: 0;
						`}
					>
						{i18n.__('preferences.title')}
					</h2>
				</header>
			</section>
		);
	}
);

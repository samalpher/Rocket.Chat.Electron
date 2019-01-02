import htm from 'htm';
import React from 'react';
import { __ } from '../../i18n';
import { connect } from '../AppState';
const html = htm.bind(React.createElement);


const AddServer = ({ onAddServer }) => html`
<li
	className="ServerList__item AddServer"
	data-tooltip=${ __('Add new server') }
	onClick=${ onAddServer }
>
	<span>+</span>
</li>
`;


export default connect(({ onAddServer }) => ({ onAddServer }))(AddServer);

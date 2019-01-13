import React from 'react';
import { __ } from '../../i18n';
import { connect } from '../AppState';


const AddServer = ({ onAddServer }) => (
	<li
		className="ServerList__item AddServer"
		data-tooltip={ __('Add new server') }
		onClick={ onAddServer }
	>
		<span>+</span>
	</li>
);


export default connect(({ onAddServer }) => ({ onAddServer }))(AddServer);

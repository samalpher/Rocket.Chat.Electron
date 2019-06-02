import React from 'react';
import { connect } from 'react-redux';
import { View } from '../View';


const mapStateToProps = ({ view }) => ({ visible: !!view.url });

export const WebviewsView = connect(mapStateToProps)(
	function WebviewsView({ visible }) {
		return (
			<View
				className="Webviews"
				visible={visible}
			/>
		);
	}
);

import React, { forwardRef } from 'react';
import { Outer, Inner } from './styles';


export const View = forwardRef(
	function View({ visible, ...props }, ref) {
		return (
			<Outer ref={ref} visible={visible}>
				<Inner {...props} />
			</Outer>
		);
	}
);

View.displayName = 'View';

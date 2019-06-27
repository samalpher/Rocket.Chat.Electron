import React from 'react';
import { Outer, Inner } from './styles';


export function View({ visible, ...props }) {
	return (
		<Outer visible={visible}>
			<Inner {...props} />
		</Outer>
	);
}

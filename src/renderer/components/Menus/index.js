import React from 'react';
import { useTemplate } from './hooks';
import { ApplicationMenu } from '../ApplicationMenu';


export function Menus() {
	const template = useTemplate();

	return <ApplicationMenu template={template} />;
}

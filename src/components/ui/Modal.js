/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useEffect, useRef } from 'react';


export const ModalTitle = ({ children }) => (
	<h2
		css={css`
			margin: 0 0 1rem;
			font-size: 1.5rem;
			line-height: normal;
		`}
	>
		{children}
	</h2>
);

export const ModalActions = ({ children, ...props }) => (
	<div
		{...props}
		css={css`
			display: flex;
			flex: 0 0 auto;
			flex-flow: row nowrap;
			justify-content: flex-end;
		`}
	>
		{children}
	</div>
);

export function Modal({ children, open, ...props }) {
	const dialogRef = useRef(null);

	useEffect(() => {
		open ?
			(!dialogRef.current.open && dialogRef.current.showModal()) :
			(dialogRef.current.open && dialogRef.current.close());
	});

	return (
		<dialog
			{...props}
			css={css`
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
				display: none;
				flex-flow: column nowrap;
				padding: 0.75rem;
				cursor: default;
				user-select: none;
				color: var(--color-dark-70);
				border: 1px solid var(--color-dark-70);
				background-color: var(--color-dark-05);

				&::backdrop {
					background-color: rgba(0, 0, 0, 0.5);
				}

				&[open] {
					display: flex;
				}
			`}
			ref={dialogRef}
		>
			{children}
		</dialog>
	);
}

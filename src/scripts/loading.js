import { connect } from '../store';


let state = {
	visible: true,
};

let root;

const update = () => {
	if (!root) {
		return;
	}

	const { visible } = state;

	root.classList.toggle('loading--visible', visible);
};

const setState = (partialState) => {
	const previousState = state;
	state = {
		...state,
		...partialState,
	};
	update(previousState);
};

let disconnect;

const mount = () => {
	root = document.querySelector('.loading');

	disconnect = connect(({
		loading,
	}) => ({
		visible: loading,
	}))(setState);
};

const unmount = () => {
	disconnect();
};

export const loading = {
	mount,
	unmount,
};

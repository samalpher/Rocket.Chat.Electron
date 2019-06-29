import { defer } from './index';


export const pipe = (...fs) => (x) => fs.reduce((v, f) => f(v), x);

export const compose = (...fs) => (x) => fs.reduceRight((v, f) => f(v), x);

const useFlush = (f, resolve, reject) => [(context, args) => {
	try {
		resolve(f.apply(context, args));
	} catch (error) {
		reject(error);
	}
}];

const useCumulativeFlush = (f, resolve, reject) => {
	let pendingArgs = [];

	const flush = (context) => {
		try {
			resolve(f.apply(context, pendingArgs));
		} catch (error) {
			reject(error);
		} finally {
			pendingArgs = [];
		}
	};

	const collect = (args) => {
		pendingArgs.push(...args);
	};

	return [flush, collect];
};

export const withDebounce = (ms, { accumulate = false, trailing = false } = {}) => (f) => {
	const { resolve, reject, promise } = defer();
	const [flush, collect] = (accumulate ? useCumulativeFlush : useFlush)(f, resolve, reject);
	let timer;

	return function(...args) {
		const context = this;

		if (!trailing && !timer) {
			collect && collect(args);
			flush(context, args);
			timer = setTimeout(() => {
				timer = null;
			}, ms);

			return promise;
		}

		clearTimeout(timer);
		collect && collect(args);
		timer = setTimeout(() => {
			flush(context, args);
			timer = null;
		}, ms);

		return promise;
	};
};

export const withArgumentsReducer = (reducer, { right = false } = {}) => (f) => function(...args) {
	const reduce = (right ? args.reduceRight : args.reduce).bind(args);
	return f.apply(this, reduce(reducer, []));
};

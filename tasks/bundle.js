const builtinModules = require('builtin-modules');
const minimist = require('minimist');
const path = require('path');
const { rollup } = require('rollup');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const globImport = require('rollup-plugin-glob-import');
const istanbul = require('rollup-plugin-istanbul');
const json = require('rollup-plugin-json');
const nodeResolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const appManifest = require('../package.json');

const { env } = minimist(process.argv, { default: { env: 'development' } });

const cached = {};

const bundle = async(src, dest, { coverage = false } = {}) => {
	const inputOptions = {
		input: src,
		external: [
			...builtinModules,
			...Object.keys(appManifest.dependencies),
			...Object.keys(appManifest.devDependencies),
		],
		cache: cached[src],
		plugins: [
			...(coverage ? [
				istanbul({
					exclude: ['**/*.spec.js', '**/*.specs.js'],
					sourcemap: true,
				}),
			] : []),
			json(),
			replace({
				'process.env.NODE_ENV': JSON.stringify(env),
			}),
			globImport(),
			babel(),
			nodeResolve(),
			commonjs(),
		],
		onwarn({ loc, frame, message }) {
			if (loc) {
				console.warn(`${ loc.file } (${ loc.line }:${ loc.column }) ${ message }`);
				if (frame) {
					console.warn(frame);
				}
			} else {
				console.warn(message);
			}
		},
	};

	const outputOptions = {
		format: 'cjs',
		file: dest,
		exports: 'named',
		intro: '(function () {',
		outro: '})()',
		sourcemap: true,
		sourcemapFile: path.basename(dest),
	};

	const bundle = await rollup(inputOptions);
	cached[src] = bundle;
	await bundle.write(outputOptions);
};

module.exports = bundle;

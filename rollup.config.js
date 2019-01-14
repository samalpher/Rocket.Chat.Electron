import builtinModules from 'builtin-modules';
import jetpack from 'fs-jetpack';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import copyAssets from 'rollup-plugin-copy-assets';
import globImport from 'rollup-plugin-glob-import';
import istanbul from 'rollup-plugin-istanbul';
import json from 'rollup-plugin-json';
import less from 'rollup-plugin-less';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import appManifest from './package.json';


const external = [
	...builtinModules,
	...Object.keys(appManifest.dependencies),
	...Object.keys(appManifest.devDependencies),
];


const copy = () => ({
	generateBundle(...args) {
		console.log(args);
		jetpack.copy('src/public', 'app/public', { overwrite: true });
		jetpack.copy('src/i18n/lang', 'app/i18n/lang', { overwrite: true });
	},
});


const plugins = (({ BUILD = 'app', NODE_ENV = 'production', COVERAGE = false } = {}) => [
	...(COVERAGE ? [
		istanbul({
			exclude: ['**/*.spec.js', '**/*.specs.js'],
			sourcemap: true,
		}),
	] : []),
	...(BUILD === 'app' ? [
		less({
			output: 'app/stylesheets/main.css',
		}),
		copy(),
	] : []),
	replace({
		'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
	}),
	json(),
	globImport(),
	babel(),
	nodeResolve(),
	commonjs(),
])(process.env);


const onwarn = ({ loc, frame, message }) => {
	if (loc) {
		console.warn(`${ loc.file } (${ loc.line }:${ loc.column }) ${ message }`);
		if (frame) {
			console.warn(frame);
		}
	} else {
		console.warn(message);
	}
};


const app = () => [
	{
		input: 'src/background.js',
		external,
		plugins,
		onwarn,
		output: {
			format: 'cjs',
			file: 'app/background.js',
			intro: '(function () {',
			outro: '})()',
			exports: 'named',
			sourcemap: true,
			sourcemapFile: 'background.js',
		},
	},
	{
		input: 'src/app.js',
		external,
		plugins,
		onwarn,
		output: {
			format: 'cjs',
			file: 'app/app.js',
			intro: '(function () {',
			outro: '})()',
			sourcemap: true,
			sourcemapFile: 'app.js',
		},
	},
	{
		input: 'src/preload.js',
		external,
		plugins,
		onwarn,
		output: {
			format: 'cjs',
			file: 'app/preload.js',
			intro: '(function () {',
			outro: '})()',
			sourcemap: true,
			sourcemapFile: 'preload.js',
		},
	},
];


const unit = () => [
	{
		input: 'src/tests/main.js',
		external,
		plugins,
		onwarn,
		output: {
			format: 'cjs',
			file: 'app/main.specs.js',
			intro: '(function () {',
			outro: '})()',
			sourcemap: true,
			sourcemapFile: 'main.specs.js',
		},
	},
	{
		input: 'src/tests/renderer.js',
		external,
		plugins,
		onwarn,
		output: {
			format: 'cjs',
			file: 'app/renderer.specs.js',
			intro: '(function () {',
			outro: '})()',
			sourcemap: true,
			sourcemapFile: 'renderer.specs.js',
		},
	},
];


const e2e = () => [
	{
		input: 'src/tests/e2e.js',
		external,
		plugins,
		onwarn,
		output: {
			format: 'cjs',
			file: 'app/e2e.js',
			intro: '(function () {',
			outro: '})()',
			sourcemap: true,
			sourcemapFile: 'e2e.js',
		},
	},
];


export default () => ({ app, unit, e2e }[process.env.BUILD || 'app'] || (() => []))(process.env);

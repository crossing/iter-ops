/**
 * Rollup Config.
 */

import rollupPluginNodeResolve from '@rollup/plugin-node-resolve';
import rollupPluginTypescript from '@rollup/plugin-typescript';
import rollupPluginAutoExternal from 'rollup-plugin-auto-external';

import {terser as rollupPluginTerser} from 'rollup-plugin-terser';
import rollupPluginGzip from 'rollup-plugin-gzip';

import pkg from './package.json';

const common = {
    input: 'src/index.ts',

    output: {
        sourcemap: false,
    },

    external: [],

    treeshake: {
        annotations: true,
        moduleSideEffects: [],
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
    },
};

/**
 * Get new instances of all the common plugins.
 */
function getPlugins(tsconfig = 'tsconfig.build.json') {
    return [
        rollupPluginAutoExternal(),
        rollupPluginNodeResolve(),
        rollupPluginTypescript({
            tsconfig,
        }),
    ];
}

const copyright = `/*!
 * ${pkg.name} v${pkg.version}
 * Copyright ${new Date().getFullYear()} ${pkg.author.name}
 * Released under the ${pkg.license} License
 * ${pkg.homepage}
 */
`;

/**
 * The common JS build.
 */
const cjs = {
    ...common,

    output: {
        ...common.output,
        file: pkg.main,
        format: 'cjs',
    },

    plugins: getPlugins(),
};

/**
 * The esm build.
 */
const esm = {
    ...common,

    output: {
        ...common.output,
        file: pkg.module,
        format: 'esm',
    },

    plugins: getPlugins(),
};

/**
 * The web script build.
 */
const web = {
    ...common,

    output: {
        ...common.output,
        sourcemap: true,
        file: 'dist/web/iter-ops.min.js',
        format: 'iife',
        name: 'iterOps',
        banner: copyright,
    },

    plugins: [
        ...getPlugins('tsconfig.build.web.json'),
        rollupPluginTerser({
            output: {
                comments: 'some',
            },
        }),
        rollupPluginGzip(),
    ],
};

/**
 * The web module build.
 */
const webModule = {
    ...web,

    output: {
        ...web.output,
        file: 'dist/web/iter-ops.min.mjs',
        format: 'esm',
    },

    plugins: [
        ...getPlugins('tsconfig.build.web.json'),
        rollupPluginTerser({
            output: {
                comments: 'some',
            },
        }),
        rollupPluginGzip(),
    ],
};

export default [cjs, esm, web, webModule];

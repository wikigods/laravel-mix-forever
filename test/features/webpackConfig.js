import test from 'ava';

import { context } from '../helpers/test.js';

test('Custom webpack config can be merged', async t => {
    const { mix, webpack } = context(t);

    mix.webpackConfig({ externals: ['foo'] });

    const config = await webpack.buildConfig();

    t.deepEqual(['foo'], config.externals);
});

test('Webpack child stats are hidden by default and can be enabled explicitly', async t => {
    const { mix, webpack } = context(t);

    const defaults = await webpack.buildConfig();
    t.false(defaults.stats.children);

    mix.webpackConfig({ stats: { children: true } });
    const configured = await webpack.buildConfig();
    t.true(configured.stats.children);
});

test('Custom webpack config can be merged as a callback function', async t => {
    const { mix, webpack } = context(t);

    mix.webpackConfig(() => {
        return {
            externals: ['foo']
        };
    });

    const config = await webpack.buildConfig();

    t.deepEqual(['foo'], config.externals);
});

test.serial(
    'Custom webpack config is called and merged *after* all plugins and extensions',
    async t => {
        const { mix, webpack } = context(t);

        mix.extend('extension', {
            webpackConfig(config) {
                config.externals = ['extension foo'];
            }
        });

        // @ts-ignore - there's no way to do declaration merging with JSDoc afaik
        mix.extension();

        mix.webpackConfig(() => {
            return {
                externals: ['webpackConfig foo']
            };
        });

        const { config } = await webpack.compile();

        t.deepEqual(['extension foo', 'webpackConfig foo'], config.externals);
    }
);

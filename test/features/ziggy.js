import test from 'ava';
import ZiggyPlugin from '../../src/components/ZiggyPlugin.js';

import { context } from '../helpers/test.js';

test('Ziggy adds route generation and Composer package alias', async t => {
    const { mix, webpack } = context(t);

    mix.ziggy();

    const config = await webpack.buildConfig();

    const plugins = /** @type {any[]} */ (config.plugins);
    t.true(plugins.some(plugin => plugin.constructor.name === 'ZiggyPlugin'));
    t.true(
        String(config.resolve.alias['ziggy-js'])
            .replace(/\\/g, '/')
            .includes('vendor/tightenco/ziggy')
    );
});

test('Ziggy accepts a safe output path and disables production by default', async t => {
    const { mix, webpack, Mix } = context(t);

    Mix.config.production = true;
    mix.ziggy({ path: 'resources/js/ziggy.js' });

    const config = await webpack.buildConfig();
    const plugins = /** @type {any[]} */ (config.plugins);
    t.false(plugins.some(plugin => plugin.constructor.name === 'ZiggyPlugin'));
});

test('Ziggy rejects unsafe output paths and invalid watch options', t => {
    const { mix } = context(t);

    t.throws(() => mix.ziggy({ path: '../outside.js' }), {
        message: /safe relative path/
    });
    t.throws(() => mix.ziggy({ path: '-option.js' }), {
        message: /safe relative path/
    });
    // @ts-expect-error Invalid input verifies the runtime guard.
    t.throws(() => mix.ziggy({ watch: 123 }), {
        message: /glob, an array of globs, or false/
    });
});

test('Ziggy passes the output path as a single process argument', t => {
    const plugin = new ZiggyPlugin({
        root: process.cwd(),
        output: 'resources/js/ziggy file.js',
        watch: false
    });

    t.deepEqual(plugin.commandArguments(), [
        'artisan',
        'ziggy:generate',
        'resources/js/ziggy file.js'
    ]);
});

import test from 'ava';

import { context } from '../helpers/test.js';

test('mix.ts()', async t => {
    const { mix, webpack, assert } = context(t);

    mix.ts(`test/fixtures/app/src/dynamic-ts/app.ts`, 'dist');

    const config = await webpack.buildConfig();
    const extensions = (config.resolve && config.resolve.extensions) || [];

    // Proper extensions…
    t.true(extensions.includes('.ts'));
    t.true(extensions.includes('.tsx'));

    // And babel transformations…
    assert()
        .rule(config, rule => /** @type {RegExp} */ (rule.test).test('foo.tsx'))
        .loader(/babel-loader/)
        .exists();
});

test('it applies TypeScript preset options to Babel', async t => {
    const { mix, webpack, assert } = context(t);

    mix.ts(`test/fixtures/app/src/dynamic-ts/app.ts`, 'dist', {
        onlyRemoveTypeImports: true
    });

    const config = await webpack.buildConfig();
    const loader = assert()
        .rule(config, rule => rule.test.test('file.ts'))
        .loader(/babel-loader/)
        .get();

    t.true(
        loader.options.presets.some(
            preset =>
                Array.isArray(preset) &&
                preset[0] === '@babel/preset-typescript' &&
                preset[1].onlyRemoveTypeImports === true
        )
    );
});

test.serial('it compiles TypeScript with dynamic import', async t => {
    const { mix, webpack, assert } = context(t);

    mix.ts(`test/fixtures/app/src/dynamic-ts/dynamic.ts`, 'js');

    await webpack.compile();

    assert().file(`test/fixtures/app/dist/js/dynamic.js`).exists();

    assert().manifestEquals({
        '/js/absolute.js': '/js/absolute.js',
        '/js/dynamic.js': '/js/dynamic.js',
        '/js/named.js': '/js/named.js'
    });
});

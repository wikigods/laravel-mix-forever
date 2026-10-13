import test from 'ava';
import { context } from '../helpers/test.js';

test.serial('it compiles Svelte 5 components', async t => {
    const { assert, mix, webpack } = context(t);

    mix.js('test/fixtures/app/src/svelte/app.js', 'js').svelte();

    await webpack.compile();

    assert().file('test/fixtures/app/dist/js/app.js').exists();
});

test('mix.svelte() registers Svelte support', async t => {
    const { mix, Mix, webpack } = context(t);

    mix.svelte();

    const config = await webpack.buildConfig();
    const component = Mix.components.get('svelte');
    const svelteRule = config.module.rules.find(
        /** @param {any} rule */ rule => rule.test?.test('App.svelte')
    );

    t.truthy(component);
    t.true(component.dependencies().includes('svelte-loader@^3.2.4'));
    t.truthy(svelteRule);
    t.is(svelteRule.use[0].loader, Mix.resolver.get('svelte-loader'));
    t.true(svelteRule.use[0].options.compilerOptions.dev);
    t.true(config.resolve.extensions.includes('.svelte'));
    t.true(config.resolve.mainFields.includes('svelte'));
    t.true(config.resolve.conditionNames.includes('svelte'));
});

test('mix.svelte() forwards loader and compiler options', async t => {
    const { mix, webpack } = context(t);

    mix.svelte({
        compilerOptions: { generate: 'server' },
        preprocess: { custom: true }
    });

    const config = await webpack.buildConfig();
    const svelteRule = config.module.rules.find(
        /** @param {any} rule */ rule => rule.test?.test('App.svelte')
    );

    t.is(svelteRule.use[0].options.compilerOptions.generate, 'server');
    t.is(svelteRule.use[0].options.preprocess.custom, true);
});

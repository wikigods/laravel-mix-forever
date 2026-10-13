# Svelte

Mix can compile Svelte single-file components with Webpack 5.

Install Svelte 5 in your application, then enable the loader in `webpack.mix.js`:

```js
const mix = require('laravel-mix-forever');

mix.js('resources/js/app.js', 'public/js').svelte();
```

Import `.svelte` files from your JavaScript entry point as usual. Mix installs
`svelte-loader` when it is missing. Loader options, including Svelte compiler
options and preprocessors, can be passed to `svelte()`:

```js
mix.js('resources/js/app.js', 'public/js').svelte({
    compilerOptions: { dev: !mix.inProduction() },
    preprocess: require('svelte-preprocess')()
});
```

Install and configure any preprocessor you use in the application. Type checking
is separate from bundling; use `svelte-check` for Svelte component diagnostics.
Svelte 5 component-level HMR is not supported by `svelte-loader`, so component
changes reload the page during development.

Mix compiles the application with Webpack and does not require Vite. Projects
that choose Vite use Vite's own configuration and plugins separately.

# Inertia.js

Inertia's client adapters are JavaScript packages; the Laravel adapter handles
the server side. Inertia does not require Vite: Mix can bundle the client app
with Webpack, and the server adapter continues to run in Laravel.

Install the Inertia adapter for the frontend framework you use. Enable the
matching Mix component for single-file components or JSX:

```js
mix.js('resources/js/app.js', 'public/js').vue();
// or .react()
// or .svelte()
```

Page discovery uses Webpack's `require.context()` instead of Vite's
`import.meta.glob()`:

```js
// Vue 3 pages
const pages = require.context('./Pages', true, /\.vue$/);
const resolvePage = name => pages(`./${name}.vue`);
```

```js
// React pages
const pages = require.context('./Pages', true, /\.(jsx?|tsx?)$/);
const resolvePage = name => pages(`./${name}`);
```

```js
// Svelte pages
const pages = require.context('./Pages', true, /\.svelte$/);
const resolvePage = name => pages(`./${name}.svelte`);
```

Use the setup code for your chosen adapter from the official Inertia guide; the
adapter's setup API can change independently of this package. This package
configures Webpack and does not install the Laravel server adapter or configure
Laravel routes, controllers, or SSR.

For a standalone website, Mix can build the same frontend entry; serve the
generated JavaScript and CSS from that site's web server. No Laravel or Vite
runtime is required for the client bundle.

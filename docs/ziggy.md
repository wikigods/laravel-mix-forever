# Ziggy with Mix and Webpack

Mix can generate Ziggy's route configuration as part of a Webpack build, so you
do not need to maintain a custom `mix.extend()` implementation or a shell
command in `webpack.mix.js`.

## Install Ziggy in Laravel

Install the PHP package using Composer:

```sh
composer require tightenco/ziggy
```

Then enable the Mix integration:

```js
const mix = require('laravel-mix-forever');

mix.js('resources/js/app.js', 'public/js')
    .vue(); // Optional; use .react() or another supported framework as needed.

mix.ziggy();
```

If you want Ziggy's `route()` helper available as a browser global, add
`@routes` to the main Blade layout before the compiled application script:

```blade
@routes
<script src="{{ mix('js/app.js') }}"></script>
```

This makes the helper and route configuration available to Vue, React, and
plain JavaScript at runtime. Use the generated configuration imports below
when the bundle should carry its route data itself.

`mix.ziggy()` runs `php artisan ziggy:generate` before Webpack compiles. Ziggy
creates `resources/js/ziggy.js` by default. Mix watches `routes/**/*.php` while
running in watch mode and regenerates the file when a route changes. The
integration is enabled by default in development and disabled in production.

## Use route names from JavaScript

The generated configuration can be imported from any JavaScript framework or
plain JavaScript module. With the Composer package installed, Mix provides the
`ziggy-js` Webpack alias:

```js
import { route } from 'ziggy-js';
import { Ziggy } from './ziggy';

const usersUrl = route('users.index', undefined, undefined, Ziggy);
```

The import path for `Ziggy` is relative to the file using it. If the build runs
from TypeScript, the same imports work in `.ts` files. For Vue, Ziggy also
provides `ZiggyVue`; for React it provides `useRoute()`. Those helpers are
documented in the [Ziggy framework guide](https://github.com/tighten/ziggy#javascript-frameworks).

To expose the same helper globally to framework-agnostic code, install a small
adapter in the application's entry file:

```js
import { route as ziggyRoute } from 'ziggy-js';
import { Ziggy } from './ziggy';

globalThis.route = (name, params, absolute) =>
    ziggyRoute(name, params, absolute, Ziggy);
```

Framework components can instead import `route` directly, or use Ziggy's Vue
plugin / React hook. The generated route data is ordinary JavaScript and does
not make the app depend on Vite.

## Options

```js
mix.ziggy({
    path: 'resources/js/ziggy.js',
    enabled: !mix.inProduction(),
    watch: ['routes/**/*.php']
});
```

- `path`: optional relative output path passed to `ziggy:generate`. Leave it
  empty or omit it to use Ziggy's configured default.
- `enabled`: enable or disable generation. Defaults to `!mix.inProduction()`.
- `watch`: glob or list of globs to monitor during `mix --watch`. Defaults to
  `['routes/**/*.php']`; set `false` to disable route watching.

When enabling generation for production builds, make sure PHP, Composer
dependencies, and the Laravel application are available in that build
environment.

## Security guidance

Ziggy's generated route list is shipped to the browser. Include only route names
that are appropriate for users to see, using Ziggy's route filtering options in
`config/ziggy.php`. Hiding a route from the generated file does not secure the
route: enforce authentication, authorization, and request validation in Laravel
as usual.

Mix invokes the fixed `php artisan ziggy:generate` executable with an argument
array and the Laravel project directory as its working directory. It does not
interpolate the configured output path into a shell command. The output path
must be relative and cannot contain parent-directory segments.

For Content Security Policy guidance, see Ziggy's documentation for the
`@routes` directive and CSP nonces.

# Vue

-   [Basic Usage](#basic-usage)

This package supports Vue 3 single file components.

### Basic Usage

Support may be activated via the `mix.vue()` command, like so:

```js
mix.js('src/app.js', 'dist').vue();
```

Think of this as a way to request general JavaScript bundling, but _also_ support and awareness of Vue single file components.

Mix configures Webpack to compile Vue 3 single file components. The `version`
option is retained for compatibility and only accepts `3`.

```js
mix.js('src/app.js', 'dist').vue();
```

Vue's single file components allow you to declare a template, script, and styling within a single file that has a `.vue` extension. Here's an example:

```vue
// src/Alert.vue
<template>
    <div class="alert" v-text="message"></div>
</template>

<script>
export default {
    data() {
        return {
            message: 'I am an alert.'
        };
    }
};
</script>

<style>
.alert {
    background: red;
}
</style>
```

If you're familiar with Vue, this should all look very familiar.

> For current Vue guidance, see the [Vue documentation](https://vuejs.org/guide/).

Assuming your entry script imports this `alert` component...

```js
// src/app.js

import { createApp } from 'vue';
import Alert from './Alert.vue';

createApp(Alert).mount('#app');
```

...you can now compile your JavaScript while _also_ including support for Vue files, like so:

```js
// webpack.mix.js

let mix = require('laravel-mix-forever');

mix.js('src/app.js', 'public/js').vue();
```

And that should do it! Run `npx mix` to compile it all down. At this point, the only remaining step is to of course create an HTML file, import the compiled `./js/app.js` script, and refresh the browser.

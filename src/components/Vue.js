const { Component } = require('./Component');
const File = require('../File');
const VueVersion = require('../VueVersion');
const AppendVueStylesPlugin = require('../webpackPlugins/Css/AppendVueStylesPlugin');

module.exports = class Vue extends Component {
    /**
     * @type {import('laravel-mix').VueConfig} options
     */
    options = {
        runtimeOnly: false,
        options: null,
        globalStyles: null,
        extractStyles: false,
        useVueStyleLoader: false
    };

    /**
     * Register the component.
     *
     * @param {import('laravel-mix').VueConfig} options
     */
    register(options = {}) {
        if (
            arguments.length === 2 &&
            typeof arguments[0] === 'string' &&
            typeof arguments[1] === 'string'
        ) {
            throw new Error(
                'mix.vue() is a feature flag. Use mix.js(source, destination).vue() instead'
            );
        }

        if (options.version !== undefined && Number(options.version) !== 3) {
            throw new Error('This package supports Vue 3 only. Vue 2 is not supported.');
        }

        Object.assign(this.options, options);

        new VueVersion(this.context).detect();

        if (this.options.globalStyles !== undefined) {
            this.context.globalStyles = this.options.globalStyles;
        }

        if (this.options.extractStyles !== undefined) {
            this.context.extractingStyles =
                this.context.extractingStyles || !!this.options.extractStyles;
        }

        this.addDefines();

        this.context.api.alias({
            vue$: {
                raw: this.aliasPath()
            }
        });
    }

    /**
     * Required dependencies for the component.
     */
    dependencies() {
        this.requiresReload = true;

        let dependencies = ['@vue/compiler-sfc', 'vue-loader@^17.4.2'];

        if (this.options.extractStyles && this.options.globalStyles) {
            dependencies.push('sass-resources-loader');
        }

        return dependencies;
    }

    /**
     * Override the generated webpack configuration.
     *
     * @param {import('webpack').Configuration} config
     */
    webpackConfig(config) {
        config.module = config.module || {};
        config.module.rules = config.module.rules || [];
        config.resolve = config.resolve || {};
        config.resolve.extensions = config.resolve.extensions || [];

        // push -> unshift to combat vue loader webpack 5 bug
        config.module.rules.unshift({
            test: /\.vue$/,
            use: [
                {
                    loader: this.context.resolve('vue-loader'),
                    options: this.options.options || this.context.config.vue || {}
                }
            ]
        });

        // Alias Vue to its ESM build if the user has not already given an alias
        config.resolve.extensions.push('.vue');

        this.updateChunks();

        return config;
    }

    aliasPath() {
        return this.options.runtimeOnly
            ? 'vue/dist/vue.runtime.esm-bundler.js'
            : 'vue/dist/vue.esm-bundler.js';
    }

    /**
     * webpack plugins to be appended to the master config.
     */
    webpackPlugins() {
        let { VueLoaderPlugin } = require(this.context.resolve('vue-loader'));

        return [new VueLoaderPlugin(), new AppendVueStylesPlugin()];
    }

    /**
     * Update CSS chunks to extract vue styles
     */
    updateChunks() {
        if (this.options.extractStyles === false) {
            return;
        }

        this.context.chunks.add(
            'styles-vue',
            this.styleChunkName(),
            [/.vue$/, module => module.type === 'css/mini-extract'],
            {
                chunks: 'all',
                enforce: true,
                type: 'css/mini-extract'
            }
        );

        this.context.chunks.add(
            'styles-jsx',
            this.styleChunkName(),
            [/.jsx$/, module => module.type === 'css/mini-extract'],
            {
                chunks: 'all',
                enforce: true,
                type: 'css/mini-extract'
            }
        );
    }

    /**
     * Get the name of the style chunk.
     *
     * @returns {string}
     */
    styleChunkName() {
        // If the user set extractStyles: true, we'll try
        // to append the Vue styles to an existing CSS chunk.
        if (this.options.extractStyles === true) {
            let chunk = this.context.chunks.find((chunk, id) => id.startsWith('styles-'));

            if (chunk) {
                return chunk.name;
            }
        }

        return this.extractFile().relativePathWithoutExtension();
    }

    /**
     * Get a new File instance for the extracted file.
     *
     * @returns {File}
     */
    extractFile() {
        return new File(this.extractFileName());
    }

    /**
     * Determine the extract file name.
     *
     * @return {string}
     */
    extractFileName() {
        let fileName =
            typeof this.options.extractStyles === 'string'
                ? this.options.extractStyles
                : '/css/vue-styles.css';

        return fileName.replace(this.context.config.publicPath, '').replace(/^\//, '');
    }

    /**
     * Determine the extract file name.
     *
     * @internal
     */
    addDefines() {
        this.context.api.define({
            __VUE_OPTIONS_API__: 'true',
            __VUE_PROD_DEVTOOLS__: 'false',
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
        });
    }
};

const { Component } = require('./Component');

module.exports = class Svelte extends Component {
    /** @type {Record<string, any>} */
    options = {};

    /**
     * Register Svelte single-file component support.
     *
     * @param {Record<string, any>} options
     */
    register(options = {}) {
        this.options = options;
    }

    /**
     * Required dependencies for the component.
     */
    dependencies() {
        return ['svelte-loader@^3.2.4'];
    }

    /**
     * Add Svelte's Webpack loader rules.
     *
     * @returns {import('webpack').RuleSetRule[]}
     */
    webpackRules() {
        const loaderOptions = { ...this.options };
        const compilerOptions = { ...(loaderOptions.compilerOptions || {}) };

        if (compilerOptions.dev === undefined) {
            compilerOptions.dev = !this.context.config.production;
        }

        loaderOptions.compilerOptions = compilerOptions;

        return [
            {
                test: /\.(?:svelte|svelte\.js)$/,
                use: [
                    {
                        loader: this.context.resolve('svelte-loader'),
                        options: loaderOptions
                    }
                ]
            },
            {
                test: /node_modules[\\/]svelte[\\/].*\.mjs$/,
                resolve: { fullySpecified: false }
            }
        ];
    }

    /**
     * Add Svelte's package export conditions to Webpack resolution.
     *
     * @param {import('webpack').Configuration} config
     */
    webpackConfig(config) {
        config.resolve = config.resolve || {};
        config.resolve.extensions = config.resolve.extensions || [];
        config.resolve.extensions.push('.svelte');

        config.resolve.mainFields = config.resolve.mainFields || [
            'browser',
            'module',
            'main'
        ];
        config.resolve.mainFields = [
            'svelte',
            ...config.resolve.mainFields.filter(field => field !== 'svelte')
        ];

        config.resolve.conditionNames = config.resolve.conditionNames || ['webpack'];
        config.resolve.conditionNames = [
            'svelte',
            'browser',
            ...config.resolve.conditionNames.filter(
                condition => !['svelte', 'browser'].includes(condition)
            )
        ];

        return config;
    }
};

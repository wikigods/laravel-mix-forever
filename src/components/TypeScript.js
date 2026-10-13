const JavaScript = require('./JavaScript');

class TypeScript extends JavaScript {
    /** @type {Record<string, any>} */
    options = {};

    /**
     * The API name for the component.
     */
    name() {
        return ['typeScript', 'ts'];
    }

    /**
     * Register the component.
     *
     * @param {any} entry
     * @param {string} output
     * @param {Record<string, any>} options
     */
    register(entry, output, options = {}) {
        super.register(entry, output);
        this.options = options;
    }

    /**
     * Required dependencies for the component.
     */
    dependencies() {
        return ['@babel/preset-typescript'];
    }

    /**
     * webpack rules to be appended to the master config.
     */
    webpackRules() {
        const babelOptions = this.context.config.babel();
        const typescriptOptions = {
            ignoreExtensions: true,
            ...this.options
        };

        babelOptions.presets.push(['@babel/preset-typescript', typescriptOptions]);

        return [
            ...super.webpackRules(),
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: this.context.resolve('babel-loader'),
                options: babelOptions
            },
            {
                test: /\.vue$/,
                resourceQuery: /lang=ts/,
                loader: require.resolve('../loaders/typescript-vue'),
                options: babelOptions
            }
        ];
    }

    /**
     * Override the generated webpack configuration.
     *
     * @param {import('webpack').Configuration} config
     */
    webpackConfig(config) {
        config.resolve = config.resolve || {};
        config.resolve.extensions = config.resolve.extensions || [];
        config.resolve.extensions.push('.ts', '.tsx');

        return config;
    }
}

module.exports = TypeScript;

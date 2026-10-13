const Preprocessor = require('./Preprocessor');

module.exports = class Sass extends Preprocessor {
    /**
     * Required dependencies for the component.
     */
    dependencies() {
        this.requiresReload = true;

        const deps = ['sass-loader@^12.1.0', 'sass'];

        if (this.context.config.processCssUrls) {
            deps.push('resolve-url-loader@^5.0.0');
        }

        return deps;
    }

    /**
     * Register the component.
     *
     * @param {any} src
     * @param {string} output
     * @param {Record<string, any>} pluginOptions
     * @param {import('postcss').AcceptedPlugin[]}  postCssPlugins
     */
    register(src, output, pluginOptions = {}, postCssPlugins = []) {
        return this.preprocess(
            'sass',
            src,
            output,
            this.pluginOptions(pluginOptions),
            postCssPlugins
        );
    }

    /**
     * Build the plugin options for sass-loader.
     *
     * @param {Record<string, any>} pluginOptions
     * @returns {Object}
     */
    pluginOptions(pluginOptions) {
        const defaults = {
            precision: 8,
            outputStyle: 'expanded',
            silenceDeprecations: ['color-functions', 'global-builtin', 'import']
        };

        return {
            ...pluginOptions,
            sassOptions: {
                ...defaults,
                ...(pluginOptions.sassOptions || {})
            },
            sourceMap: true
        };
    }

    chunkRegex() {
        return /\.(css|s[ac]ss)$/;
    }
};

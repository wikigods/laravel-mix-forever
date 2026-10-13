const babel = require('@babel/core');

/**
 * @typedef {string|string[]} BabelTargetsBrowserslist
 * @typedef {Record<string,string> & {browsers: BabelTargetsBrowserslist}} BabelTargetsPerEngine
 * @typedef {BabelTargetsBrowserslist | BabelTargetsPerEngine} BabelTargets
 */

/**
 * @typedef {object} AdditionalBabelOptions
 * @property {boolean} [cacheDirectory]
 * @property {BabelTargets} [targets]
 */

/** @typedef {import("@babel/core").InputOptions & AdditionalBabelOptions} BabelOptions */

class BabelConfig {
    /**
     *
     * @param {import("./Mix")} [mix]
     */
    constructor(mix) {
        this.mix = mix || global.Mix;
    }

    /**
     * Generate the appropriate Babel configuration for the build.
     *
     * @deprecated
     */
    static generate() {
        return new BabelConfig().generate();
    }

    /**
     * Generate the appropriate Babel configuration for the build.
     */
    generate() {
        return this.mergeAll([
            this.default(),
            this.getCustomConfig(this.mix.config.babelConfig),
            {
                root: this.mix.paths.root(),
                babelrc: true,
                configFile: true,
                babelrcRoots: ['.', this.mix.paths.root()]
            }
        ]);
    }

    /**
     * Fetch the user's .babelrc config file, if any.
     *
     * @param {string} path
     * @deprecated
     */
    fetchBabelRc(path) {
        const File = require('./File');

        return File.exists(path) ? JSON.parse(File.find(path).read()) : {};
    }

    /**
     * Get the babel config setup when using mix.babelConfig()
     *
     * @internal
     * @param {import('@babel/core').InputOptions} customOptions
     */
    getCustomConfig(customOptions) {
        const config = babel.loadPartialConfigSync(customOptions);

        return config ? config.options : {};
    }

    /**
     * Merge babel configs
     *
     * @param {BabelOptions[]} configs
     */
    mergeAll(configs) {
        const options = configs.reduce((prev, current) => {
            const presets = [...(prev.presets || []), ...(current.presets || [])].map(
                preset => babel.createConfigItemSync(preset, { type: 'preset' })
            );

            const plugins = [...(prev.plugins || []), ...(current.plugins || [])].map(
                preset => babel.createConfigItemSync(preset, { type: 'plugin' })
            );

            return Object.assign(prev, current, { presets, plugins });
        });

        // @ts-ignore TODO: fix type
        options.plugins = this.filterConfigItems(options.plugins || []);

        // @ts-ignore TODO: fix type
        options.presets = this.filterConfigItems(options.presets || []);

        return options;
    }

    /**
     * Filter merged presets or plugins
     *
     * @internal
     * @param {import("@babel/core").ConfigItem<unknown>[]} items
     * @returns {import("@babel/core").ConfigItem<unknown>[]}
     */
    filterConfigItems(items) {
        /**
         *
         * @param {import("@babel/core").ConfigItem<unknown>[]} unique
         * @param {import("@babel/core").ConfigItem<unknown>} item
         */
        function dedupe(unique, item) {
            if (item.file != null) {
                const toDeleteIndex = unique.findIndex(
                    element =>
                        element.file &&
                        element.file.resolved === (item.file && item.file.resolved)
                );

                if (toDeleteIndex >= 0) {
                    unique.splice(toDeleteIndex, 1);
                }
            }

            return [...unique, item];
        }

        /** @type {import("@babel/core").ConfigItem<unknown>[]} */
        let unique = [];

        for (const configItem of items) {
            unique = dedupe(unique, configItem);
        }

        return unique;
    }

    /** @deprecated */
    static default() {
        return new BabelConfig().default();
    }

    /**
     * Fetch the default Babel configuration.
     *
     * @internal
     * @returns {BabelOptions}
     */
    default() {
        return {
            cacheDirectory: true,
            presets: [
                ['@babel/preset-env', { modules: false, forceAllTransforms: true }]
            ],
            plugins: [
                '@babel/plugin-transform-object-rest-spread',
                '@babel/plugin-transform-runtime'
            ]
        };
    }
}

module.exports = BabelConfig;

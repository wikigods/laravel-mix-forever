const path = require('path');
const { Component } = require('./Component');
const ZiggyPlugin = require('./ZiggyPlugin');

const DEFAULT_WATCH = ['routes/**/*.php'];

module.exports = class Ziggy extends Component {
    /** @type {{path: string, enabled: boolean|undefined, watch: string|string[]|false}} */
    options = {
        path: '',
        enabled: undefined,
        watch: DEFAULT_WATCH
    };

    /** @param {{path?: string, enabled?: boolean, watch?: string|string[]|false}} options */
    register(options = {}) {
        if (!options || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('mix.ziggy() expects an options object.');
        }

        const configured = { ...this.options, ...options };
        configured.enabled ??= !this.context.inProduction();

        if (typeof configured.path !== 'string') {
            throw new TypeError('mix.ziggy({ path }) expects a relative string path.');
        }

        const segments = configured.path.split(/[\\/]/);
        if (
            path.isAbsolute(configured.path) ||
            configured.path.startsWith('-') ||
            segments.includes('..') ||
            configured.path.includes('\0')
        ) {
            throw new Error(
                'Ziggy output path must be a safe relative path without parent segments.'
            );
        }

        if (
            configured.watch !== false &&
            typeof configured.watch !== 'string' &&
            !Array.isArray(configured.watch)
        ) {
            throw new TypeError(
                'mix.ziggy({ watch }) expects a glob, an array of globs, or false.'
            );
        }

        if (typeof configured.enabled !== 'boolean') {
            throw new TypeError('mix.ziggy({ enabled }) expects a boolean.');
        }

        const watchPatterns = Array.isArray(configured.watch)
            ? configured.watch
            : configured.watch === false
              ? []
              : [configured.watch];

        if (
            watchPatterns.some(
                pattern =>
                    typeof pattern !== 'string' ||
                    pattern.includes('\0') ||
                    path.isAbsolute(pattern) ||
                    pattern.split(/[\\/]/).includes('..')
            )
        ) {
            throw new Error(
                'Ziggy watch patterns must be safe relative paths inside the Laravel project.'
            );
        }

        this.options = configured;
        this.activated = true;

        if (this.options.enabled) {
            this.context.api.alias({
                'ziggy-js': {
                    raw: path.resolve(this.context.paths.root(), 'vendor/tightenco/ziggy')
                }
            });
        }
    }

    webpackPlugins() {
        if (!this.options.enabled) return [];

        const watchPatterns = this.context.isWatching() ? this.options.watch : false;
        const watch =
            watchPatterns === false
                ? false
                : Array.isArray(watchPatterns)
                  ? watchPatterns
                  : [watchPatterns];

        return [
            new ZiggyPlugin({
                root: this.context.paths.root(),
                output: this.options.path,
                watch
            })
        ];
    }
};

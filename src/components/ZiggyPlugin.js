const { execFile } = require('child_process');

/** @typedef {{root: string, output: string, watch: false|string[]}} PluginOptions */

/** Webpack plugin that generates Ziggy's route file before compilation. */
module.exports = class ZiggyPlugin {
    /** @param {PluginOptions} options */
    constructor({ root, output, watch }) {
        this.root = root;
        this.output = output;
        this.watch = watch;
        this.generated = false;
        /** @type {Promise<void>|null} */
        this.generation = null;
        /** @type {import('chokidar').FSWatcher|null} */
        this.watcher = null;
    }

    /** @param {import('webpack').Compiler} compiler */
    apply(compiler) {
        const generate = () => {
            if (!this.generation || !this.generated) {
                this.generation = this.run().then(() => {
                    this.generated = true;
                });
            }

            return this.generation;
        };

        compiler.hooks.beforeRun.tapPromise('ZiggyPlugin', generate);
        compiler.hooks.watchRun.tapPromise('ZiggyPlugin', generate);
        compiler.hooks.shutdown.tapPromise('ZiggyPlugin', async () => {
            if (this.watcher) await this.watcher.close();
        });

        if (this.watch && compiler.options.watch) {
            const chokidar = require('chokidar');
            this.watcher = chokidar.watch(this.watch, {
                cwd: this.root,
                ignoreInitial: true
            });

            /** @type {ReturnType<typeof setTimeout>|undefined} */
            let timer;
            this.watcher.on('all', event => {
                if (!['add', 'change', 'unlink'].includes(event)) return;

                clearTimeout(timer);
                timer = setTimeout(async () => {
                    this.generated = false;

                    try {
                        await generate();
                        compiler.watching?.invalidate();
                    } catch (error) {
                        compiler.getInfrastructureLogger('ZiggyPlugin').error(error);
                    }
                }, 100);
            });
        }
    }

    /** @returns {Promise<void>} */
    run() {
        const args = this.commandArguments();

        /** @type {Promise<void>} */
        return new Promise((resolve, reject) => {
            execFile(
                'php',
                args,
                { cwd: this.root, windowsHide: true },
                (error, stdout, stderr) => {
                    if (stdout) process.stdout.write(stdout);

                    if (error) {
                        reject(
                            new Error(
                                `Ziggy route generation failed: ${stderr || error.message}`
                            )
                        );
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    commandArguments() {
        const args = ['artisan', 'ziggy:generate'];
        if (this.output) args.push(this.output);

        return args;
    }
};

const babel = require('@babel/core');

/**
 * Strip TypeScript syntax from Vue SFC script blocks before vue-loader compiles them.
 * This loader also accepts the virtual script content emitted by vue-loader.
 *
 * @param {string} source
 * @returns {string}
 */
module.exports = function compileVueTypeScript(source) {
    const options = { ...this.getOptions() };
    delete options.cacheDirectory;
    const transform = code =>
        babel.transformSync(code, {
            ...options,
            filename: `${this.resourcePath}.ts`
        }).code;

    if (!source.includes('<script')) {
        return transform(source);
    }

    return source.replace(
        /(<script\b[^>]*\blang=["']ts["'][^>]*>)([\s\S]*?)(<\/script\s*>)/gi,
        (block, openingTag, script, closingTag) =>
            `${openingTag}${transform(script)}${closingTag}`
    );
};

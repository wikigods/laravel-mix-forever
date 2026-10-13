const { Component } = require('./Component');

module.exports = class BabelConfig extends Component {
    /**
     * @param {import('@babel/core').InputOptions} config
     */
    register(config) {
        this.context.config.babelConfig = config;
    }
};

const js = require('@eslint/js');
const globals = require('globals');
module.exports = [
    {
        ignores: [
            'test/fixtures/integration/dist/**/*',
            'test/integration/fixture/**/*',
            'test/disks/**/*'
        ]
    },
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.node
        },
        rules: {
            'no-const-assign': 'off',
            'padding-line-between-statements': [
                'error',
                { blankLine: 'always', prev: '*', next: 'return' }
            ],
            semi: 'error',
            'no-unreachable': 'error',
            'no-extra-semi': 'error',
            'no-unexpected-multiline': 'error',
            'comma-dangle': [
                'error',
                {
                    arrays: 'never',
                    objects: 'never',
                    imports: 'never',
                    exports: 'never',
                    functions: 'never'
                }
            ]
        }
    }
];

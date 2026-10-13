const js = require('@eslint/js');
const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');

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
            ecmaVersion: 2021,
            sourceType: 'module',
            parser: tsParser,
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

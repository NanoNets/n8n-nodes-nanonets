module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['./tsconfig.json'],
        sourceType: 'module',
        extraFileExtensions: ['.json'],
    },
    ignorePatterns: ['node_modules/**', 'dist/**', '*.js'],
    plugins: ['n8n-nodes-base'],
    extends: ['plugin:n8n-nodes-base/community'],
    rules: {},
};

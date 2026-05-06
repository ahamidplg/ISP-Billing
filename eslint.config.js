import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*']
  },
  {
    plugins: {
      '@firebase/security-rules': firebaseRulesPlugin,
    },
    files: ['*.rules'],
    rules: {
      ...firebaseRulesPlugin.configs['flat/recommended'].rules,
    },
  }
];

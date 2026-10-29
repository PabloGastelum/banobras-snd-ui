// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'out-tsc/**', '.angular/**', 'playwright-report/**', 'test-results/**'] },
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['projects/uki/**/*.ts'],
    rules: {
      '@angular-eslint/component-selector': ['error', { type: ['element', 'attribute'], prefix: 'uki', style: 'kebab-case' }],
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'uki', style: 'camelCase' }],
    },
  },
  {
    files: ['projects/demo/**/*.ts'],
    rules: {
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'demo', style: 'kebab-case' }],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
  },
);

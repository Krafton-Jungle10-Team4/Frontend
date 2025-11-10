import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import reactCompiler from 'eslint-plugin-react-compiler';

export default tseslint.config(
  reactHooks.configs.flat.recommended,
  // 1. 무시할 파일/폴더 설정
  {
    ignores: [
      'node_modules/**',     // npm 패키지
      'dist/**',             // 빌드 결과물
      'build/**',            // 빌드 결과물
      '*.config.js',         // 설정 파일들
      '*.config.ts',         // 설정 파일들
      '.vite/**',            // Vite 캐시
      'coverage/**',         // 테스트 커버리지
    ],
  },
  // 2. TypeScript 파일 규칙
  {
    files: ['**/*.{ts,tsx}'],
    
    // 기본 추천 설정 적용
    extends: [
      js.configs.recommended,                      // JavaScript 기본 규칙
      ...tseslint.configs.recommended,             // TypeScript 추천 규칙
    ],
    
    // 언어 설정
    languageOptions: {
      ecmaVersion: 2020,              // ECMAScript 2020 문법 지원
      globals: globals.browser,       // 브라우저 전역 변수 (window, document 등)
      parserOptions: {
        ecmaFeatures: {
          jsx: true,                  // JSX 문법 지원
        },
      },
    },
    
    // 플러그인 등록
    plugins: {
      'react-hooks': reactHooks,      // React Hooks 규칙
      'react-refresh': reactRefresh,  // React Fast Refresh 규칙
      'react': react,                 // React 규칙
      'jsx-a11y': jsxA11y,            // 웹 접근성 규칙
      'import': importPlugin,         // import 문 정리 규칙
      'react-compiler': reactCompiler, // React Compiler 규칙
    },
    
    // 상세 규칙 설정
    rules: {
      // React Hooks 규칙 적용
      ...reactHooks.configs.recommended.rules,

      // React Compiler 규칙 (React 규칙 준수 강제)
      'react-compiler/react-compiler': 'error',

      // React Fast Refresh 규칙
      'react-refresh/only-export-components': 'off', // 컴포넌트 외 export 허용

      // React 관련 규칙
      'react/react-in-jsx-scope': 'off',          // React 17+에서는 import React 불필요
      'react/prop-types': 'off',                  // TypeScript 사용 시 prop-types 불필요

      // TypeScript 관련 규칙
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }  // _로 시작하는 변수는 무시
      ],
      '@typescript-eslint/no-explicit-any': 'off',  // any 타입 사용 허용 (개발 중)

      // 일반 규칙
      'no-console': 'off',                        // console 사용 허용 (개발 중)

      // import 문 정렬 규칙 (비활성화 - 자유롭게 작성 가능)
      'import/order': 'off',
    },
    
    // React 버전 자동 감지
    settings: {
      react: {
        version: 'detect',
      },
    },
  }
);
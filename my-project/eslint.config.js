import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
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
    },
    
    // 상세 규칙 설정
    rules: {
      // React Hooks 규칙 적용
      ...reactHooks.configs.recommended.rules,
      
      // React Fast Refresh 규칙
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // React 관련 규칙
      'react/react-in-jsx-scope': 'off',          // React 17+에서는 import React 불필요
      'react/prop-types': 'off',                  // TypeScript 사용 시 prop-types 불필요
      
      // TypeScript 관련 규칙
      '@typescript-eslint/no-unused-vars': 'error',  // 사용하지 않는 변수 에러
      '@typescript-eslint/no-explicit-any': 'warn',  // any 타입 사용 경고
      
      // 일반 규칙
      'no-console': 'warn',                       // console.log 경고 (개발 중 삭제 권장)
      
      // import 문 정렬 규칙
      'import/order': [
        'error',
        {
          groups: [
            'builtin',    // Node.js 내장 모듈 (fs, path 등)
            'external',   // npm 패키지
            'internal',   // 내부 절대 경로 (@/* 등)
            'parent',     // 상위 폴더 (../)
            'sibling',    // 같은 폴더 (./)
            'index',      // index 파일
          ],
          'newlines-between': 'always',  // 그룹 사이 빈 줄 추가
          alphabetize: {
            order: 'asc',                // 알파벳 순 정렬
            caseInsensitive: true,       // 대소문자 구분 안함
          },
        },
      ],
    },
    
    // React 버전 자동 감지
    settings: {
      react: {
        version: 'detect',
      },
    },
  }
);
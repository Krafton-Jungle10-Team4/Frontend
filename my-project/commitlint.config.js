module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
      'type-enum': [
        2,
        'always',
        [
          'feat',     // 새로운 기능
          'fix',      // 버그 수정
          'docs',     // 문서 수정
          'style',    // 코드 포맷팅 (기능 변경 없음)
          'refactor', // 코드 리팩토링
          'test',     // 테스트 코드
          'chore',    // 빌드, 설정 변경
          'revert',   // 커밋 되돌리기
          'perf',     // 성능 개선
          'ci',       // CI 설정 변경
        ],
      ],
      'type-case': [2, 'always', 'lower-case'],
      'type-empty': [2, 'never'],
      'subject-empty': [2, 'never'],
      'subject-case': [0], // 한글 허용을 위해 비활성화
      'header-max-length': [2, 'always', 72],
    },
  };
/**
 * 두 개의 말풍선이 겹친 슬랙 메시지용 아이콘
 * 원본 UX에 가까운 심볼을 간단한 라인 아이콘으로 구현
 */
const SlackMessage = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M13 5h4a3 3 0 0 1 3 3v1.5a3 3 0 0 1-3 3h-.8v2.3l-2.6-2.3H13a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" />
    <path d="M6 9h5a3 3 0 0 1 3 3v1.5a3 3 0 0 1-3 3h-1.2L7 19.5v-3H6a3 3 0 0 1-3-3V12a3 3 0 0 1 3-3Z" />
  </svg>
);

export default SlackMessage;

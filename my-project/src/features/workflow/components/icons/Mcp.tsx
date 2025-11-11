/**
 * MCP (Model Context Protocol) 아이콘
 * 플러그 모양
 */
const Mcp = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 2v3m4-3v3M5 8h6m-8 2v2a2 2 0 002 2h6a2 2 0 002-2v-2m-10 0h10M7 5a1 1 0 011-1 1 1 0 011 1v3H7V5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Mcp;

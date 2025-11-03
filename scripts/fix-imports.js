const fs = require('fs');
const path = require('path');

const replacements = [
  // Store imports
  [/@\/store\/authStore/g, '@/features/auth'],
  [/@\/store\/botStore/g, '@/features/bot'],
  [/@\/store\/activityStore/g, '@/features/activity'],
  [/@\/store\/chatStore/g, '@/features/chat'],
  [/@\/store\/documentStore/g, '@/features/documents'],
  [/@\/store\/userStore/g, '@/features/auth'],
  [/@\/store\/uiStore/g, '@/shared/stores/uiStore'],

  // API imports
  [/@\/api\/authApi/g, '@/features/auth'],
  [/@\/api\/chat/g, '@/features/chat'],
  [/@\/api\/documents/g, '@/features/documents'],
  [/@\/api\/client/g, '@/shared/api/client'],
  [/@api\/authApi/g, '@/features/auth'], // alias 없는 import

  // Hooks imports
  [/@\/hooks\/useAuth/g, '@/features/auth'],
  [/@\/hooks\/useBotActions/g, '@/features/bot'],
  [/@\/hooks\/useFilteredBots/g, '@/features/bot'],

  // Pages imports
  [/@\/pages\/LoginPage/g, '@/features/auth'],
  [/@\/pages\/HomePage/g, '@/features/bot'],
  [/@\/pages\/BotSetupPage/g, '@/features/bot'],
  [/@\/pages\/BotPreviewPage/g, '@/features/bot'],
  [/@\/pages\/SetupCompletePage/g, '@/features/bot'],
  [/@\/pages\/DashboardPage/g, '@/features/dashboard'],
  [/@\/pages\/WorkflowBuilder/g, '@/features/workflow'],

  // Components imports
  [/@\/components\/LeftSidebar/g, '@/widgets/navigation'],
  [/@\/components\/RightSidebar/g, '@/widgets/navigation'],
  [/@\/components\/TopNavigation/g, '@/widgets/navigation'],
  [/@\/components\/WorkspaceHeader/g, '@/widgets/navigation'],
  [/@\/components\/WorkspaceSidebar/g, '@/widgets/navigation'],
  [/@\/components\/BotSetup/g, '@/features/bot'],
  [/@\/components\/EmptyState/g, '@/features/bot'],
  [/@\/components\/SetupComplete/g, '@/features/bot'],
  [/@\/components\/BotPreview/g, '@/features/bot'],
  [/@\/components\/ui\//g, '@/shared/components/'],
  [/@\/components\/common\/workflow/g, '@/features/workflow/components'],
  [/@\/components\/common\/icons\/workflow/g, '@/features/workflow/components/icons'],

  // Types imports
  [/@\/types\/auth/g, '@/features/auth'],
  [/@\/types\/workflow/g, '@/features/workflow'],
  [/@\/types\/icons/g, '@/shared/types/icons.types'],
  [/from ['"]@\/types['"]/g, "from '@/shared/types'"],

  // Constants imports
  [/@constants\//g, '@/shared/constants/'],
  [/@\/constants\//g, '@/shared/constants/'],

  // Utils imports
  [/@utils\//g, '@/shared/utils/'],
  [/@\/utils\//g, '@/shared/utils/'],

  // Additional component imports that were missed
  [/@components\/common\/icons\/IconBase/g, '@/shared/components/icons/IconBase'],
  [/@components\/SearchFilters/g, '@/shared/components/SearchFilters'],
  [/from ['"]\.\.\/(App|types)['"]/g, "from '@/shared/$1'"],
];

function updateImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  replacements.forEach(([pattern, replacement]) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      hasChanges = true;
      content = newContent;
    }
  });

  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }
  return false;
}

// 재귀적으로 파일 찾기
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// 모든 TypeScript/JavaScript 파일 처리
const projectPath = path.resolve(__dirname, '../my-project');
const srcPath = path.join(projectPath, 'src');

if (!fs.existsSync(srcPath)) {
  console.error('src 디렉토리를 찾을 수 없습니다:', srcPath);
  process.exit(1);
}

const files = getAllFiles(srcPath);
let updatedCount = 0;

files.forEach(file => {
  if (updateImports(file)) {
    updatedCount++;
  }
});

console.log(`\n✨ 총 ${files.length}개 파일 중 ${updatedCount}개 파일 업데이트 완료`);

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/alert-dialog';
import { useBotSetup } from '../BotSetupContext';
import type { Language } from '@/shared/types';

interface ExitDialogProps {
  onBack: () => void;
  language?: Language;
}

export function ExitDialog({ onBack, language: _language = 'ko' }: ExitDialogProps) {
  const { showExitDialog, setShowExitDialog, resetAllData } = useBotSetup();

  const translations = {
    ko: {
      title: '정말 종료하시겠습니까?',
      message: '업로드한 파일이나 웹사이트, 텍스트 정보가 삭제됩니다.',
      yes: '예',
      no: '아니오',
    },
  };

  const t = translations.ko;

  const handleConfirmExit = async () => {
    try {
      // TODO: Replace with real API call when ready
      // await ApiClient.cleanupKnowledge(sessionId);

      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch {
      // Non-blocking error - still navigate away
      // Error will be logged in production monitoring
    } finally {
      resetAllData();
      setShowExitDialog(false);
      onBack();
    }
  };

  return (
    <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            {t.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.no}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmExit}>
            {t.yes}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

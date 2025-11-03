import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';
import { useBotSetup } from '../BotSetupContext';
import { ApiClient } from '../../../utils/api';
import type { Language } from '@/types';

interface ExitDialogProps {
  onBack: () => void;
  language: Language;
}

export function ExitDialog({ onBack, language }: ExitDialogProps) {
  const { showExitDialog, setShowExitDialog, sessionId, resetAllData } = useBotSetup();

  const translations = {
    en: {
      title: 'Are you sure you want to exit?',
      message: 'Uploaded files, websites, and text information will be deleted.',
      yes: 'Yes',
      no: 'No',
    },
    ko: {
      title: '정말 종료하시겠습니까?',
      message: '업로드한 파일이나 웹사이트, 텍스트 정보가 삭제됩니다.',
      yes: '예',
      no: '아니오',
    },
  };

  const t = translations[language];

  const handleConfirmExit = async () => {
    try {
      // TODO: Replace with real API call when ready
      // await ApiClient.cleanupKnowledge(sessionId);
      
      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      console.log('Cleanup completed (mock)');
    } catch (error) {
      // Non-blocking error - still navigate away
      console.error('Cleanup error:', error);
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

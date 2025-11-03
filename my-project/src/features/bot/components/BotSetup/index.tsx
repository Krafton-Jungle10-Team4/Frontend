/**
 * BotSetup - Main container for 4-step bot creation wizard
 * 
 * Refactored structure:
 * - Context API for state management
 * - Separated step components
 * - Reusable utility functions
 * - Clean separation of concerns
 */

import { BotSetupProvider, useBotSetup } from './BotSetupContext';
import { LeftSidebar } from '@/widgets/navigation';
import { StepNavigation } from './components/StepNavigation';
import { ExitDialog } from './components/ExitDialog';
import { Step1Name } from './steps/Step1Name';
import { Step2Goal } from './steps/Step2Goal';
import { Step3Personality } from './steps/Step3Personality';
import { Step4Knowledge } from './steps/Step4Knowledge';
import type { Language } from '@/shared/types';

interface BotSetupProps {
  onBack: () => void;
  language: Language;
}

function BotSetupContent({ onBack, language }: BotSetupProps) {
  const { step } = useBotSetup();

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1Name language={language} />;
      case 2:
        return <Step2Goal language={language} />;
      case 3:
        return <Step3Personality language={language} />;
      case 4:
        return <Step4Knowledge language={language} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        {/* Step Content */}
        {renderStep()}
      </div>

      {/* Step Navigation (Progress Bar & Buttons) */}
      <StepNavigation
        onBack={onBack}
        language={language}
      />

      {/* Exit Confirmation Dialog */}
      <ExitDialog onBack={onBack} language={language} />
    </div>
  );
}

/**
 * Main export with Context Provider wrapper
 */
export function BotSetup(props: BotSetupProps) {
  return (
    <BotSetupProvider>
      <BotSetupContent {...props} />
    </BotSetupProvider>
  );
}

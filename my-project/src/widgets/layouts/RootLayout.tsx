import { Outlet } from 'react-router-dom';
import { Toaster } from '@/shared/components/sonner';
import { PricingModal } from '@/features/billing/components/PricingModal';

export function RootLayout() {
  return (
    <div className="h-screen bg-background font-pretendard">
      <Outlet />
      <Toaster />
      <PricingModal />
    </div>
  );
}

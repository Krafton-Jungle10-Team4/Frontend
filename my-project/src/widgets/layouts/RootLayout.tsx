import { Outlet } from 'react-router-dom';
import { Toaster } from '@/shared/components/sonner';
import { PricingModal } from '@/features/billing/components/PricingModal';

export function RootLayout() {
  return (
    <div className="h-screen font-pretendard bg-[#f5f7fb]">
      <Outlet />
      <Toaster position="top-center" />
      <PricingModal />
    </div>
  );
}
// @SnapShot/Frontend/my-project/src/features/billing/hooks/useBilling.ts

/**
 * @file useBilling.ts
 * @description Billing 관련 상태를 조회하고 관리하는 커스텀 훅입니다.
 * 현재는 Mock 데이터를 사용하여 스토어를 초기화하는 역할을 합니다.
 * 추후 실제 API 연동 로직으로 교체될 예정입니다.
 */

import { useEffect } from 'react';
import { useBillingStore } from '@/shared/stores/billingStore';
// 개발 단계에서는 Free 유저와 Pro 유저 시나리오를 쉽게 전환하기 위해 두 가지를 모두 import 합니다.
import { mockFreeUserBillingStatus } from '../mock/billingMock';

export function useBilling() {
  // useBillingStore에서 상태와 액션을 가져옵니다.
  const { status, isLoading, error, setStatus } = useBillingStore();

  // 컴포넌트 마운트 시 1회만 실행되는 useEffect
  useEffect(() => {
    // 스토어에 이미 상태가 있으면 다시 초기화하지 않음
    if (status) {
      return;
    }

    // 현재는 실제 API 호출 없이 Mock 데이터를 사용하여 스토어를 초기화합니다.
    // TODO: 추후 실제 API가 구현되면 아래 로직을 API 호출 코드로 대체해야 합니다.
    
    // --- Mock Logic ---
    try {
      // 1초의 가상 로딩 시간을 줍니다.
      const timer = setTimeout(() => {
        // 여기서 Free 유저 시나리오와 Pro 유저 시나리오를 선택할 수 있습니다.
        // HomePage의 업그레이드 플로우를 테스트하려면 `mockFreeUserBillingStatus`를 사용하세요.
        setStatus(mockFreeUserBillingStatus);
        // setStatus(mockBillingStatus); // Pro 유저 테스트 시 이 코드를 사용
      }, 1000);

      // 컴포넌트 언마운트 시 타이머를 정리합니다.
      return () => clearTimeout(timer);

    } catch (e) {
      // Mock 로직에서는 에러가 발생할 가능성이 낮지만, 형식상 남겨둡니다.
      console.error("Failed to load mock billing data", e);
    }
    // setStatus는 변경되지 않으므로 의존성 배열에 포함합니다.
  }, [status, setStatus]);

  // 훅을 사용하는 컴포넌트에 상태와 로딩 여부 등을 반환합니다.
  return {
    billingStatus: status,
    isLoading,
    error,
    // 편의를 위해 현재 플랜이 free인지 확인하는 boolean 값을 제공합니다.
    isFreePlan: status?.current_plan.plan_id === 'free',
  };
}

'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CustomerWorkspace } from '@/components/customer/CustomerWorkspace';
import { AdvisorWorkspace } from '@/components/advisor/AdvisorWorkspace';
import { TestDriveModal } from '@/components/test-drive/TestDriveModal';
import { UserProfileModal } from '@/components/customer/UserProfileModal';
import { CarComparisonModal } from '@/components/customer/CarComparisonModal';

export default function Home() {
  const currentRole = useAppStore((state) => state.currentRole);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden h-full">
      {currentRole === 'customer' ? (
        <CustomerWorkspace />
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <AdvisorWorkspace />
        </div>
      )}
      <TestDriveModal />
      <UserProfileModal />
      <CarComparisonModal />
    </div>
  );
}

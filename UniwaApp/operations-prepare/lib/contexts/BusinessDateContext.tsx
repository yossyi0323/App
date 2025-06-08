'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface BusinessDateContextType {
  businessDate: string;
  setBusinessDate: (date: string) => void;
}

const BusinessDateContext = createContext<BusinessDateContextType | undefined>(undefined);

export function BusinessDateProvider({ children }: { children: ReactNode }) {
  const [businessDate, setBusinessDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  return (
    <BusinessDateContext.Provider value={{ businessDate, setBusinessDate }}>
      {children}
    </BusinessDateContext.Provider>
  );
}

export function useBusinessDate() {
  const context = useContext(BusinessDateContext);
  if (context === undefined) {
    throw new Error('useBusinessDate must be used within a BusinessDateProvider');
  }
  return context;
} 
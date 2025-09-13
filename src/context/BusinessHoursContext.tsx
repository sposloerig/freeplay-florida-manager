import React, { createContext, useContext, ReactNode } from 'react';

interface BusinessHour {
  id: string;
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
}

interface BusinessHoursContextType {
  businessHours: BusinessHour[];
  announcements: Announcement[];
  loading: boolean;
}

const BusinessHoursContext = createContext<BusinessHoursContextType | undefined>(undefined);

export const BusinessHoursProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Placeholder implementation - returns empty data
  const value: BusinessHoursContextType = {
    businessHours: [],
    announcements: [],
    loading: false,
  };

  return (
    <BusinessHoursContext.Provider value={value}>
      {children}
    </BusinessHoursContext.Provider>
  );
};

export const useBusinessHours = () => {
  const context = useContext(BusinessHoursContext);
  if (context === undefined) {
    throw new Error('useBusinessHours must be used within a BusinessHoursProvider');
  }
  return context;
};

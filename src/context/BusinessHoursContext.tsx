import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface BusinessHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface SpecialHours {
  date: string;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
  reason: string | null;
}

interface Announcement {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

interface BusinessHoursContextType {
  isOpen: boolean;
  regularHours: BusinessHours[];
  specialHours: SpecialHours[];
  announcements: Announcement[];
  currentAnnouncement: Announcement | null;
  loading: boolean;
  error: string | null;
  updateBusinessHours: (hours: BusinessHours[]) => Promise<void>;
  addSpecialHours: (hours: Omit<SpecialHours, 'id'>) => Promise<void>;
  removeSpecialHours: (date: string) => Promise<void>;
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => Promise<void>;
  removeAnnouncement: (id: string) => Promise<void>;
}

const BusinessHoursContext = createContext<BusinessHoursContextType | undefined>(undefined);

export const BusinessHoursProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [regularHours, setRegularHours] = useState<BusinessHours[]>([]);
  const [specialHours, setSpecialHours] = useState<SpecialHours[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isManager } = useAuth();

  useEffect(() => {
    fetchBusinessHours();
    const interval = setInterval(checkOpenStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchBusinessHours = async () => {
    try {
      // Fetch regular hours
      const { data: regularData, error: regularError } = await supabase
        .from('business_hours')
        .select('*')
        .order('day_of_week');

      if (regularError) throw regularError;

      // Fetch special hours
      const { data: specialData, error: specialError } = await supabase
        .from('special_hours')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date');

      if (specialError) throw specialError;

      // Fetch announcements
      const { data: announcementData, error: announcementError } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('start_date');

      if (announcementError) throw announcementError;

      setRegularHours(regularData || []);
      setSpecialHours(specialData || []);
      setAnnouncements(announcementData || []);
      setCurrentAnnouncement(announcementData?.[0] || null);
      
      checkOpenStatus();
      setError(null);
    } catch (err) {
      console.error('Error fetching business hours:', err);
      setError('Failed to load business hours');
    } finally {
      setLoading(false);
    }
  };

  const checkOpenStatus = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Check for special hours first
    const specialHoursToday = specialHours.find(h => h.date === today);
    
    if (specialHoursToday) {
      if (specialHoursToday.isClosed) {
        setIsOpen(false);
        return;
      }
      
      if (specialHoursToday.openTime && specialHoursToday.closeTime) {
        const [openHour, openMinute] = specialHoursToday.openTime.split(':');
        const [closeHour, closeMinute] = specialHoursToday.closeTime.split(':');
        
        const openTime = new Date(now);
        openTime.setHours(parseInt(openHour), parseInt(openMinute), 0);
        
        const closeTime = new Date(now);
        closeTime.setHours(parseInt(closeHour), parseInt(closeMinute), 0);
        
        setIsOpen(now >= openTime && now < closeTime);
        return;
      }
    }
    
    // Check regular hours
    const dayOfWeek = now.getDay();
    const regularHoursToday = regularHours.find(h => h.dayOfWeek === dayOfWeek);
    
    if (regularHoursToday) {
      if (regularHoursToday.isClosed) {
        setIsOpen(false);
        return;
      }
      
      const [openHour, openMinute] = regularHoursToday.openTime.split(':');
      const [closeHour, closeMinute] = regularHoursToday.closeTime.split(':');
      
      const openTime = new Date(now);
      openTime.setHours(parseInt(openHour), parseInt(openMinute), 0);
      
      const closeTime = new Date(now);
      closeTime.setHours(parseInt(closeHour), parseInt(closeMinute), 0);
      
      setIsOpen(now >= openTime && now < closeTime);
    } else {
      setIsOpen(false);
    }
  };

  const updateBusinessHours = async (hours: BusinessHours[]) => {
    if (!isManager) {
      throw new Error('Unauthorized');
    }
    
    try {
      const { error } = await supabase
        .from('business_hours')
        .upsert(
          hours.map(h => ({
            day_of_week: h.dayOfWeek,
            open_time: h.openTime,
            close_time: h.closeTime,
            is_closed: h.isClosed
          }))
        );

      if (error) throw error;
      await fetchBusinessHours();
    } catch (err) {
      console.error('Error updating business hours:', err);
      throw err;
    }
  };

  const addSpecialHours = async (hours: Omit<SpecialHours, 'id'>) => {
    if (!isManager) {
      throw new Error('Unauthorized');
    }
    
    try {
      const { error } = await supabase
        .from('special_hours')
        .upsert({
          date: hours.date,
          open_time: hours.openTime,
          close_time: hours.closeTime,
          is_closed: hours.isClosed,
          reason: hours.reason
        });

      if (error) throw error;
      await fetchBusinessHours();
    } catch (err) {
      console.error('Error adding special hours:', err);
      throw err;
    }
  };

  const removeSpecialHours = async (date: string) => {
    if (!isManager) {
      throw new Error('Unauthorized');
    }
    
    try {
      const { error } = await supabase
        .from('special_hours')
        .delete()
        .eq('date', date);

      if (error) throw error;
      await fetchBusinessHours();
    } catch (err) {
      console.error('Error removing special hours:', err);
      throw err;
    }
  };

  const addAnnouncement = async (announcement: Omit<Announcement, 'id'>) => {
    if (!isManager) {
      throw new Error('Unauthorized');
    }
    
    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          message: announcement.message,
          type: announcement.type,
          start_date: announcement.startDate.toISOString(),
          end_date: announcement.endDate.toISOString(),
          is_active: announcement.isActive
        });

      if (error) throw error;
      await fetchBusinessHours();
    } catch (err) {
      console.error('Error adding announcement:', err);
      throw err;
    }
  };

  const removeAnnouncement = async (id: string) => {
    if (!isManager) {
      throw new Error('Unauthorized');
    }
    
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchBusinessHours();
    } catch (err) {
      console.error('Error removing announcement:', err);
      throw err;
    }
  };

  return (
    <BusinessHoursContext.Provider
      value={{
        isOpen,
        regularHours,
        specialHours,
        announcements,
        currentAnnouncement,
        loading,
        error,
        updateBusinessHours,
        addSpecialHours,
        removeSpecialHours,
        addAnnouncement,
        removeAnnouncement
      }}
    >
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
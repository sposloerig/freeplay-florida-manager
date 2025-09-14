import { User } from '@supabase/supabase-js';

export type GameType = 'Pinball' | 'Arcade' | 'Console' | 'Computer' | 'Handheld' | 'Other';

export type GameLocation = 'Main Hall' | 'Side Room' | 'Outdoor Area' | 'Other';

export type GameStatus = 'Operational' | 'In Repair' | 'Awaiting Parts';

export type GameApprovalStatus = 'pending' | 'approved' | 'rejected';

export type ServicePreference = 'owner_only' | 'allow_others' | 'no_service';

export interface Game {
  id: string;
  name: string;
  type: GameType;
  otherType?: string;
  location: GameLocation;
  otherLocation?: string;
  status: GameStatus;
  conditionNotes?: string;
  highScore?: number;
  yearMade?: number;
  images: string[];
  thumbnailUrl?: string;
  dateAdded: Date;
  lastUpdated: Date;
  
  // Approval workflow
  approvalStatus: GameApprovalStatus;
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  
  // Owner information (required for public submissions)
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  ownerAddress?: string;
  ownerNotes?: string;
  
  // Service preferences
  allowOthersToService: boolean;
  serviceNotes?: string;
  
  // Sales information
  forSale: boolean;
  askingPrice?: number;
  acceptOffers: boolean;
  saleConditionNotes?: string;
  missingParts?: string[];
  saleNotes?: string;
}

export interface Repair {
  id: string;
  gameId: string;
  comment: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string; // User ID who resolved the repair
  createdAt: string;
  updatedAt: string;
  game?: {
    id: string;
    name: string;
  };
}

export interface BuyerInquiry {
  id: string;
  gameId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  offerAmount?: number;
  message: string;
  status: 'pending' | 'responded' | 'accepted' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}

export const MANAGER_EMAILS = [
  // Add your Free Play Florida admin emails here
  'admin@freeplayflorida.com',
  'test@admin.com' // Temporary admin account
];
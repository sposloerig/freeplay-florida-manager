import { User } from '@supabase/supabase-js';

export type GameType = 'Pinball' | 'Arcade' | 'Other' | 'Skeeball';

export type GameLocation = 'Replay' | 'Warehouse' | 'Other';

export type GameStatus = 'Operational' | 'In Repair' | 'Awaiting Parts';

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
  // Sales-related fields
  askingPrice?: number;
  forSale?: boolean;
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
  'amy@straylite.com',
  'fred@replaymuseum.com',
  'play@replaymuseum.com',
  'brian@replaymuseum.com'
];
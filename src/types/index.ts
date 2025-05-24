import { User } from '@supabase/supabase-js';

export type GameType = 'Pinball' | 'Arcade' | 'Other' | 'Skeeball';

export type GameLocation = 'Replay' | 'Warehouse' | 'Other';

export type GameStatus = 'Operational' | 'In Repair' | 'Awaiting Parts';

export type RepairStatus = 'Open' | 'In Progress' | 'Completed' | 'On Hold' | 'Waiting for Parts';

export type RepairPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type PartStatus = 'Needed' | 'Ordered' | 'Received' | 'Installed';

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
  dateAdded: Date;
  lastUpdated: Date;
}

export interface Repair {
  id: string;
  gameId: string;
  requestDescription: string;
  repairNotes?: string;
  loggedBy: string;
  status: RepairStatus;
  priority: RepairPriority;
  repairDate?: Date;
  repairStartDate?: Date;
  repairCompletionDate?: Date;
  estimatedCompletionDate?: Date;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  parts?: Part[];
}

export interface Part {
  id: string;
  repairId: string;
  name: string;
  estimatedCost: number;
  vendorId?: string;
  status: PartStatus;
  createdAt: Date;
  updatedAt: Date;
  vendor?: Vendor;
}

export interface Vendor {
  id: string;
  name: string;
  contactInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}
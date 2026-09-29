export type ItemType = 'Lost' | 'Found';

export type ItemCategory =
  | 'ID & Cards'
  | 'Electronics'
  | 'Keys & Lanyards'
  | 'Bottles & Tumblers'
  | 'Bags & Backpacks'
  | 'Books & Notes'
  | 'Clothing & Accessories'
  | 'Other';

export type ItemStatus = 'Active' | 'In Verification' | 'Matched' | 'Recovered';

export interface CampusItem {
  id: string;
  name: string;
  type: ItemType;
  category: ItemCategory;
  status: ItemStatus;
  location: string;
  date: string;
  time?: string;
  description: string;
  imageUrl?: string;
  colorTheme?: string;
  reportedBy: {
    name: string;
    studentId?: string;
    avatar: string;
    email: string;
  };
  reward?: string;
  potentialMatches?: number;
  contactUnlocked?: boolean;
}

export interface CampusActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'report_lost' | 'report_found' | 'match_found' | 'item_recovered';
}

export interface CampusStats {
  myLostReports: number;
  myFoundReports: number;
  potentialMatches: number;
  itemsRecovered: number;
}

export type NavTab =
  | 'dashboard'
  | 'lost'
  | 'found'
  | 'report-lost'
  | 'report-found'
  | 'messages'
  | 'profile'
  | 'settings';

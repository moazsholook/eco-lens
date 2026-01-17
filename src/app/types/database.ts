// Database Types for EcoLens CO2 Tracker
// These types mirror the MongoDB collections

export interface User {
  _id: string;
  email: string;
  name?: string;
  passwordHash?: string;
  avatar?: string;
  dailyCO2Goal: number; // in grams, default 8000 (8kg)
  preferences: UserPreferences;
  stats: UserStats;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserPreferences {
  units: 'metric' | 'imperial';
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface UserStats {
  totalScans: number;
  totalCO2: number; // cumulative CO2 in grams
  streakDays: number;
}

export type EmissionCategory = 
  | 'food' 
  | 'beverage' 
  | 'clothing' 
  | 'electronics' 
  | 'transportation' 
  | 'household' 
  | 'packaging' 
  | 'other';

export interface Alternative {
  name: string;
  benefit: string;
  carbonSavings: string;
}

export interface Emission {
  _id: string;
  userId: string;
  imageUrl?: string;
  objectName: string;
  category: EmissionCategory;
  carbonValue: number; // in grams CO2e
  carbonFootprint: string; // formatted string like "82.8g CO₂e"
  lifecycle: string[];
  explanation: string;
  alternatives: Alternative[];
  quantity: number;
  notes?: string;
  scannedAt: Date;
  date: string; // YYYY-MM-DD format for daily aggregation
}

// API Request/Response types
export interface CreateUserRequest {
  email: string;
  name?: string;
  password: string;
}

export interface CreateEmissionRequest {
  userId: string;
  imageUrl?: string;
  objectName: string;
  category: EmissionCategory;
  carbonValue: number;
  carbonFootprint: string;
  lifecycle: string[];
  explanation: string;
  alternatives: Alternative[];
  quantity?: number;
  notes?: string;
}

export interface DailySummary {
  date: string;
  totalCO2: number;
  itemCount: number;
  goal: number;
  percentOfGoal: number;
}

export interface CategorySummary {
  category: EmissionCategory;
  totalCO2: number;
  count: number;
  percentOfTotal: number;
}

export interface WeeklyHistory {
  date: string;
  totalCO2: number;
  items: string[];
}

// For the frontend state management
export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface EmissionsState {
  todayEmissions: Emission[];
  todayTotal: number;
  history: WeeklyHistory[];
  isLoading: boolean;
}

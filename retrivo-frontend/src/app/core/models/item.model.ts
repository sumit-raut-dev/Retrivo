export interface Item {
  id: number;
  title: string;
  description: string;
  categoryName: string;
  location: string;
  photoUrl?: string | null;
  itemType: string;
  status: string;
  createdAt: string;
  reporterName: string;
}

export interface PublicStats {
  totalItems: number;
  resolvedItems: number;
  activeUsers: number;
  avgRecoveryHours: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface CreateClaim {
  itemId: number;
  claimantName: string;
  claimantEmail: string;
  claimantPhone?: string;
  message: string;
  photoUrl?: string;
}

export interface ClaimSuccess {
  message: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
}

export interface AdminLoginPayload {
  username: string;
  password: string;
}

export interface AdminAuthResponse {
  id: number;
  username: string;
  fullName: string;
  token: string;
}

export interface AdminStats {
  totalItems: number;
  pendingItems: number;
  openItems: number;
  resolvedItems: number;
  totalUsers: number;
  totalClaims: number;
}

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string;
  reportedItemsCount: number;
}

export interface AdminItem {
  id: number;
  title: string;
  description: string;
  categoryName: string;
  location: string;
  photoUrl?: string;
  itemType: string;
  status: string;
  createdAt: string;
  reporterName: string;
  reporterEmail: string;
  claimCount: number;
}

export interface StatusCount { status: string; count: number; }
export interface TypeCount { type: string; count: number; }
export interface CategoryCount { category: string; count: number; }
export interface MonthlyActivity { year: number; month: number; count: number; }

export interface MyItem {
  id: number;
  title: string;
  description: string;
  categoryName: string;
  location: string;
  photoUrl?: string;
  itemType: string;
  status: string;
  createdAt: string;
  claimCount: number;
}

export interface ItemClaim {
  id: number;
  claimantName: string;
  claimantEmail: string;
  claimantPhone?: string;
  message: string;
  photoUrl?: string;
  createdAt: string;
}
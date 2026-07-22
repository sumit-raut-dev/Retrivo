export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  isAdmin?: boolean;
}

export interface AuthResponse {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  token: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  fullName: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
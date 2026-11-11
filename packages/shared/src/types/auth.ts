export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

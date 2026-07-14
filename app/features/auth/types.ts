export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  fullname: string;
  level: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: AuthUser;
}

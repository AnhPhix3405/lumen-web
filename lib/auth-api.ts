import { apiClient } from "./api-client";

// --- Types ---

export interface RegisterResponse {
  data: {
    id: string;
    email: string;
    isVerified: boolean;
    createdAt: string;
  };
  message: string;
  status: number;
}

export interface VerifyEmailResponse {
  data: {
    id: string;
    email: string;
    isVerified: boolean;
  };
  message: string;
  status: number;
}

export interface LoginResponse {
  data: {
    accessToken: string;
  };
  message: string;
}

export interface LogoutResponse {
  message: string;
}

export interface SendVerifyCodeResponse {
  message: string;
}

// --- API functions ---

export const register = (email: string, password: string) =>
  apiClient<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const verifyEmail = (email: string, code: string) =>
  apiClient<VerifyEmailResponse>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });

export const login = (email: string, password: string) =>
  apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const logout = () =>
  apiClient<LogoutResponse>("/auth/logout", { method: "POST" });

export const refreshToken = () =>
  apiClient<LoginResponse>("/auth/refresh", { method: "POST" });

export const sendVerifyCode = (email: string) =>
  apiClient<SendVerifyCodeResponse>("/auth/send-verify-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

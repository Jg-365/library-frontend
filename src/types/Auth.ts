import type { Perfil } from "./Usuario";

/**
 * Request de login
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Response de login
 */
export interface LoginResponse {
  token: string;
  role: Perfil;
  usuarioId: number;
}

/**
 * Request de registro
 */
export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  address: string;
  userType: "ALUNO" | "PROFESSOR" | "FUNCIONARIO";
  role: "ADMIN" | "BIBLIOTECARIO" | "USUARIO";
  courseCode?: number;
  ingressDate?: string;
  graduationDate?: string;
  hireDate?: string;
  workRegime?: "20" | "40" | "DE";
}

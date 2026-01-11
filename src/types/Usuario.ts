/**
 * Tipo de Usuário - O que a pessoa É na instituição
 */
export type TipoUsuario =
  | "ALUNO"
  | "PROFESSOR"
  | "FUNCIONARIO";

/**
 * Tipo de Acesso - O que a pessoa PODE FAZER no sistema (permissões)
 */
export type TipoAcesso =
  | "ADMIN"
  | "BIBLIOTECARIO"
  | "USUARIO";

/**
 * Regime de trabalho para professores
 */
export type RegimeTrabalho = "DE" | "INTEGRAL" | "PARCIAL";

/**
 * Interface de usuário (formato backend)
 */
export interface Usuario {
  // Identificação
  enrollment: number; // Matrícula única

  // Dados pessoais
  name: string; // Nome completo
  username: string; // Login/email
  address: string; // Endereço

  // Classificação
  userType?: TipoUsuario; // Tipo de usuário (ALUNO/PROFESSOR/FUNCIONARIO)
  role: TipoAcesso; // Nível de acesso (ADMIN/BIBLIOTECARIO/USUARIO)

  // Status
  active: boolean; // Ativo/Inativo

  // Campos opcionais de especialização
  courseCode?: number;
  ingressDate?: string;
  graduationDate?: string;
  hireDate?: string;
  workRegime?: RegimeTrabalho;

  // Campos legados (compatibilidade)
  id?: number;
  nome?: string;
  email?: string;
  perfil?: TipoAcesso;
  ativo?: boolean;
}

/**
 * Payload para criação de usuário
 */
export interface CreateUsuarioPayload {
  password: string;
  name: string;
  username: string;
  address: string;
  userType: TipoUsuario;
  role: TipoAcesso;
  courseCode?: number;
  ingressDate?: string;
  graduationDate?: string;
  hireDate?: string;
  workRegime?: RegimeTrabalho;
}

/**
 * Credenciais de acesso do usuário
 */
export interface CredenciaisAcesso {
  usuarioId: number;
  perfil: TipoAcesso;
  email: string;
  senhaHash: string;
  ultimoLogin: Date | null;
}

// Alias para compatibilidade com código legado
/** @deprecated Use 'TipoAcesso' instead */
export type Perfil = TipoAcesso;

/** @deprecated Use 'TipoAcesso' instead */
export type PerfilUsuario = TipoAcesso;

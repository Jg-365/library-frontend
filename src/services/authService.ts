import { api } from "./api";
import type { LoginRequest, RegisterRequest } from "@/types/Auth";
import type {
  TipoAcesso,
  TipoUsuario,
  Usuario,
} from "@/types/Usuario";
import type { CreateUsuarioPayload } from "@/types";
import { API_ENDPOINTS, STORAGE_KEYS } from "@/config";

function normalizeRole(
  role: string | null | undefined
): TipoAcesso | null {
  if (!role) {
    return null;
  }

  const trimmedRole = role.trim();
  const normalized = trimmedRole.startsWith("ROLE_")
    ? trimmedRole.replace(/^ROLE_/, "")
    : trimmedRole;

  if (
    normalized === "ADMIN" ||
    normalized === "BIBLIOTECARIO" ||
    normalized === "USUARIO"
  ) {
    return normalized;
  }

  return null;
}

function extractRoleFromToken(decoded: any): TipoAcesso | null {
  if (!decoded) {
    return null;
  }

  if (Array.isArray(decoded.roles) && decoded.roles.length > 0) {
    return normalizeRole(decoded.roles[0]);
  }

  const rawRole =
    decoded.role ?? decoded.roles ?? decoded.authorities;

  if (Array.isArray(rawRole)) {
    return normalizeRole(rawRole[0]);
  }

  if (typeof rawRole === "string") {
    return normalizeRole(rawRole);
  }

  return null;
}

function parseEnrollmentValue(value: unknown): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const normalized = String(value).replace(/[^0-9]/g, "");
  if (!normalized) {
    return undefined;
  }
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function deriveUserTypeFromRole(
  role: TipoAcesso | null
): TipoUsuario | undefined {
  if (!role) {
    return undefined;
  }

  if (role === "ADMIN" || role === "BIBLIOTECARIO") {
    return "FUNCIONARIO";
  }

  if (role === "USUARIO") {
    return "ALUNO";
  }

  return undefined;
}

function buildUserFromToken(token: string): Usuario {
  const decoded = decodeJWT(token);
  console.log("🔓 JWT decodificado completo:", decoded);
  console.log(
    "🔑 Propriedades do token:",
    Object.keys(decoded || {})
  );

  if (!decoded) {
    throw new Error("Token JWT inválido ou não decodificável.");
  }

  const roleFromToken = extractRoleFromToken(decoded);
  const enrollment =
    parseEnrollmentValue(decoded.enrollment) ??
    parseEnrollmentValue(decoded.matricula) ??
    parseEnrollmentValue(decoded.matriculaAluno) ??
    parseEnrollmentValue(decoded.matriculaFuncionario) ??
    parseEnrollmentValue(decoded.userId) ??
    parseEnrollmentValue(decoded.id) ??
    0;
  const username = decoded.sub ?? decoded.username ?? "";
  const role = roleFromToken ?? "USUARIO";
  const userType = roleFromToken
    ? deriveUserTypeFromRole(roleFromToken)
    : undefined;

  return {
    enrollment,
    role,
    perfil: role,
    userType,
    name: decoded.name ?? decoded.nome ?? username,
    username,
    address: decoded.address ?? "",
    active: decoded.active ?? true,
  };
}

// Função para decodificar JWT
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(
          (c) =>
            "%" +
            ("00" + c.charCodeAt(0).toString(16)).slice(-2)
        )
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Erro ao decodificar JWT:", error);
    return null;
  }
}

export const authService = {
  login: async (
    credentials: LoginRequest
  ): Promise<{ user: Usuario; token: string }> => {
    console.log("🔐 Attempting login with:", {
      username: credentials.username,
      password: credentials.password,
      fullPayload: JSON.stringify(credentials),
    });

    const response = await api.post<{
      accessToken: string;
    }>(API_ENDPOINTS.AUTH.LOGIN, credentials);

    const { accessToken } = response.data;

    // Configura o token no header para as próximas requisições
    api.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${accessToken}`;

    const user = buildUserFromToken(accessToken);

    console.log("👤 Usuário final:", user);
    console.log(
      "📋 Enrollment (matrícula):",
      user.enrollment,
      "Tipo:",
      typeof user.enrollment
    );

    return { user, token: accessToken };
  },

  logout: async () => {
    // JWT logout é feito no frontend removendo o token
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  refresh: async (): Promise<{ accessToken: string }> => {
    const token = localStorage.getItem(
      STORAGE_KEYS.AUTH_TOKEN
    );

    if (!token) {
      throw new Error("Token não encontrado para refresh.");
    }

    api.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;

    return { accessToken: token };
  },

  saveAuth: (token: string, user: Usuario) => {
    const resolvedRole =
      normalizeRole(user.role ?? user.perfil) ?? "USUARIO";
    const normalizedUser = {
      ...user,
      role: resolvedRole,
      perfil: resolvedRole,
    };
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(
      STORAGE_KEYS.USER_DATA,
      JSON.stringify(normalizedUser)
    );
    api.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;
  },

  getStoredAuth: (): {
    token: string;
    user: Usuario;
  } | null => {
    const token = localStorage.getItem(
      STORAGE_KEYS.AUTH_TOKEN
    );
    const userData = localStorage.getItem(
      STORAGE_KEYS.USER_DATA
    );

    if (!token || !userData) {
      return null;
    }

    try {
      return { token, user: JSON.parse(userData) };
    } catch {
      return null;
    }
  },

  getUserFromToken: (token: string): Usuario => {
    return buildUserFromToken(token);
  },

  register: async (
    data: RegisterRequest
  ): Promise<void> => {
    console.log("📝 Registrando usuário:", {
      username: data.username,
      userType: data.userType,
      role: data.role,
    });

    const payload: CreateUsuarioPayload = {
      name: data.name,
      username: data.username,
      password: data.password,
      address: data.address,
      userType: data.userType,
      role: data.role,
    };

    if (data.userType === "ALUNO") {
      if (data.courseCode) {
        payload.courseCode = data.courseCode;
      }
      payload.ingressDate = data.ingressDate;
      payload.graduationDate = data.graduationDate;
    }

    if (
      data.userType === "PROFESSOR" ||
      data.userType === "FUNCIONARIO"
    ) {
      if (
        data.userType === "PROFESSOR" &&
        data.courseCode
      ) {
        payload.courseCode = data.courseCode;
      }
      payload.hireDate = data.hireDate;
      if (data.workRegime) {
        payload.workRegime = data.workRegime;
      }
    }

    await api.post(API_ENDPOINTS.USUARIOS.CREATE, payload);
  },
};


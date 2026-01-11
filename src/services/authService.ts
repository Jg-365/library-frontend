import { api } from "./api";
import type { LoginRequest, RegisterRequest } from "@/types/Auth";
import type {
  TipoAcesso,
  TipoUsuario,
  Usuario,
} from "@/types/Usuario";
import type { CreateUsuarioPayload } from "@/types";
import { API_ENDPOINTS, STORAGE_KEYS } from "@/config";

interface UserResponse {
  enrollment: number;
  role: TipoAcesso;
  userType: TipoUsuario;
  name: string;
  username: string;
  address: string;
  active: boolean;
  id?: number;
  nome?: string;
  email?: string;
  perfil?: TipoAcesso;
  ativo?: boolean;
}

function mapUserResponseToUsuario(
  userData: UserResponse
): Usuario {
  return {
    enrollment: userData.enrollment,
    role: userData.role,
    userType: userData.userType,
    name: userData.name,
    username: userData.username,
    address: userData.address,
    active: userData.active,
    id: userData.id,
    nome: userData.name ?? userData.nome,
    email: userData.email ?? userData.username,
    perfil: userData.role ?? userData.perfil,
    ativo: userData.active ?? userData.ativo,
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

    // Decodifica o JWT para extrair informações do usuário
    const decoded = decodeJWT(accessToken);
    console.log("🔓 JWT decodificado completo:", decoded);
    console.log(
      "🔑 Propriedades do token:",
      Object.keys(decoded || {})
    );

    // Normaliza o perfil baseado na role do JWT
    // Tenta pegar de roles, role, ou authorities
    let perfil = "ALUNO"; // Default

    if (decoded.roles && Array.isArray(decoded.roles)) {
      perfil =
        decoded.roles[0]?.replace("ROLE_", "") || "ALUNO";
    } else if (decoded.role) {
      perfil = decoded.role.replace("ROLE_", "");
    } else if (
      decoded.authorities &&
      Array.isArray(decoded.authorities)
    ) {
      perfil =
        decoded.authorities[0]?.replace("ROLE_", "") ||
        "ALUNO";
    }

    // Remove qualquer mapeamento - mantém as roles exatamente como vêm do backend
    // Backend usa: ADMIN, BIBLIOTECARIO, ALUNO, PROFESSOR

    console.log("👔 Perfil do JWT:", perfil);

    // Configura o token no header para as próximas requisições
    api.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${accessToken}`;

    // Busca dados completos do usuário via endpoint /users/me
    console.log(
      "🔍 Buscando dados do usuário autenticado..."
    );

    try {
      console.log(
        "🔄 Chamando GET",
        API_ENDPOINTS.USUARIOS.ME
      );
      const userResponse = await api.get<UserResponse>(
        API_ENDPOINTS.USUARIOS.ME
      );

      const userData = mapUserResponseToUsuario(
        userResponse.data
      );
      console.log(
        "✅ Dados do usuário recebidos:",
        userData
      );

      const user: Usuario = {
        ...userData,
        id: userData.id ?? decoded.sub,
        nome: userData.name ?? decoded.sub,
        email: userData.email ?? decoded.sub,
        perfil: userData.role ?? perfil,
        username: userData.username ?? decoded.sub,
      };

      console.log("👤 Usuário final:", user);
      console.log(
        "📋 Enrollment (matrícula):",
        user.enrollment,
        "Tipo:",
        typeof user.enrollment
      );

      return { user, token: accessToken };
    } catch (error) {
      console.error(
        "❌ Erro ao buscar dados do usuário:",
        error
      );

      // Fallback: usa apenas dados do JWT
      const user: Usuario = {
        id: decoded.sub,
        nome: decoded.name || decoded.sub,
        email: decoded.email || decoded.sub,
        perfil:
          perfil as import("@/types/Usuario").TipoAcesso,
        enrollment:
          typeof decoded.enrollment === "number"
            ? decoded.enrollment
            : 0,
        username: decoded.sub,
        name: decoded.name || decoded.sub,
        address: decoded.address || "",
        userType:
          perfil as import("@/types/Usuario").TipoUsuario,
        role: perfil as import("@/types/Usuario").TipoAcesso,
        active: true,
      };

      return { user, token: accessToken };
    }
  },

  getMe: async (): Promise<Usuario> => {
    const response = await api.get<UserResponse>(
      API_ENDPOINTS.USUARIOS.ME
    );
    return mapUserResponseToUsuario(response.data);
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
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(
      STORAGE_KEYS.USER_DATA,
      JSON.stringify(user)
    );
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

    if (data.userType === "PROFESSOR") {
      if (data.courseCode) {
        payload.courseCode = data.courseCode;
      }
      payload.hireDate = data.hireDate;
      payload.workRegime = data.workRegime;
    }

    await api.post(API_ENDPOINTS.USUARIOS.CREATE, payload);
  },
};

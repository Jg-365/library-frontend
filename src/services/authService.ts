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

    if (!decoded) {
      throw new Error("Token JWT inválido ou não decodificável.");
    }

    const enrollmentFromToken = (() => {
      const rawEnrollment =
        decoded.enrollment ?? decoded.sub;
      if (typeof rawEnrollment === "number") {
        return String(rawEnrollment);
      }
      if (typeof rawEnrollment === "string") {
        const trimmed = rawEnrollment.trim();
        if (/^\d+$/.test(trimmed)) {
          return trimmed;
        }
      }
      return null;
    })();

    if (!enrollmentFromToken) {
      throw new Error(
        "Token JWT não contém matrícula válida."
      );
    }

    // Configura o token no header para as próximas requisições
    api.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${accessToken}`;

    try {
      console.log("🔄 Chamando GET", API_ENDPOINTS.USUARIOS.ME);
      const userData = await authService.getMe();

      if (
        String(userData.enrollment) !==
        enrollmentFromToken
      ) {
        throw new Error(
          "Matrícula do token não confere com o usuário autenticado."
        );
      }

      const user: Usuario = userData;

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
      throw error;
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

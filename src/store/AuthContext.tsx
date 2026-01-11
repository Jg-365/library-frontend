import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import type { Usuario } from "@/types/Usuario";
import { authService } from "@/services/authService";

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

// Função para verificar se o token JWT expirou
function isTokenExpired(token: string): boolean {
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
    const decoded = JSON.parse(jsonPayload);

    if (!decoded.exp) {
      return false; // Se não tem expiração, considera válido
    }

    // exp está em segundos, Date.now() em milissegundos
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();

    return currentTime >= expirationTime;
  } catch (error) {
    console.error(
      "Erro ao verificar expiração do token:",
      error
    );
    return true; // Se der erro, considera expirado por segurança
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega autenticação salva ao iniciar e verifica expiração
  useEffect(() => {
    let isMounted = true;

    const loadAuth = async () => {
      const storedAuth = authService.getStoredAuth();
      if (!storedAuth) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      const needsEnrollment =
        !storedAuth.user?.enrollment ||
        storedAuth.user.enrollment <= 0;

      // Verifica se o token expirou
      if (isTokenExpired(storedAuth.token)) {
        console.warn(
          "⏰ Token JWT expirado! Fazendo logout automático..."
        );
        authService.logout();
        if (isMounted) {
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setToken(storedAuth.token);
      }

      try {
        const freshUser = await authService.getMe();
        if (isMounted) {
          setUser(freshUser);
          authService.saveAuth(storedAuth.token, freshUser);
        }
      } catch (error) {
        console.error(
          "Erro ao recarregar usuário em /users/me:",
          error
        );
        if (isMounted) {
          setUser(needsEnrollment ? null : storedAuth.user);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (
    username: string,
    password: string
  ) => {
    const response = await authService.login({
      username,
      password,
    });
    setUser(response.user);
    setToken(response.token);
    authService.saveAuth(response.token, response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user?.enrollment,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }
  return context;
}

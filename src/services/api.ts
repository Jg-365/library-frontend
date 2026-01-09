import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { API_CONFIG, STORAGE_KEYS } from "@/config";

export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
  // Força aceitar qualquer tipo de resposta para debug
  transformResponse: [
    (data) => {
      if (!data) return data;
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Resposta não é JSON:", data);
        return data;
      }
    },
  ],
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use((config) => {
  // Não adiciona token nas rotas de autenticação (login/register)
  const isAuthRoute =
    config.url?.includes("/auth/login") ||
    config.url?.includes("/auth/register");

  const token = localStorage.getItem(
    STORAGE_KEYS.AUTH_TOKEN
  );

  if (!isAuthRoute && token) {
    config.headers.Authorization = `Bearer ${token}`;

    // DEBUG: Log para POST /users/create
    if (
      config.method === "post" &&
      config.url?.includes("/users/create")
    ) {
      try {
        const parts = token.split(".");
        const payload = JSON.parse(atob(parts[1]));
        const now = Math.floor(Date.now() / 1000);
        console.log(
          "🔍 POST /users/create - Request Details:"
        );
        console.log(
          "📍 URL completa:",
          config.baseURL + config.url
        );
        console.log("📦 Payload:", config.data);
        console.log("📋 Headers:", config.headers);
        console.log("🔑 Token JWT:", {
          subject: payload.sub,
          roles: payload.roles,
          isExpired: payload.exp < now,
          expiresAt: new Date(
            payload.exp * 1000
          ).toLocaleString(),
        });
      } catch (e) {
        console.error("❌ Erro ao decodificar token:", e);
      }
    }
  }

  return config;
});

// Interceptor de resposta para tratamento de erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (
    error: AxiosError<{ message: string; error: string }>
  ) => {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message;

    // Tratamento específico por código de status
    switch (error.response?.status) {
      case 401:
        // Log especial para /users/create
        if (error.config?.url?.includes("/users/create")) {
          console.error("🚨 ERRO 401 em /users/create:");
          console.error(
            "📍 URL:",
            error.config.baseURL + error.config.url
          );
          console.error(
            "📦 Dados enviados:",
            error.config.data
          );
          console.error(
            "📋 Headers:",
            error.config.headers
          );
          console.error(
            "🔴 Resposta do backend:",
            error.response?.data
          );
          console.error(
            "⚠️ Este erro indica que o backend rejeitou a autenticação, não que os dados estão incorretos!"
          );
        }

        // Não exibe o toast se for a rota de login
        if (!error.config?.url?.includes("/auth/login")) {
          // Verificar se é erro de JWT inválido ou credenciais incorretas
          const isJWTSignatureError =
            errorMessage.includes("JWT") ||
            errorMessage.includes("signature") ||
            errorMessage.includes("Bad credentials") ||
            errorMessage.includes(
              "Username or password is incorrect"
            );

          if (isJWTSignatureError) {
            // Verificar se o token está expirado ou apenas com assinatura inválida
            const token = localStorage.getItem(
              STORAGE_KEYS.AUTH_TOKEN
            );
            let tokenExpired = true;

            if (token) {
              try {
                const parts = token.split(".");
                const payload = JSON.parse(atob(parts[1]));
                const now = Math.floor(Date.now() / 1000);
                tokenExpired = payload.exp < now;
              } catch (e) {
                console.error(
                  "Erro ao verificar expiração do token:",
                  e
                );
              }
            }

            if (tokenExpired) {
              toast.error("Sessão expirada", {
                description:
                  "Sua sessão expirou. Faça login novamente.",
              });
            } else {
              toast.error("Erro de autenticação", {
                description: errorMessage,
                duration: 10000, // 10 segundos para copiar a mensagem
              });
              console.error("❌ Erro 401 completo:", {
                url: error.config?.url,
                method: error.config?.method,
                errorMessage,
                responseData: error.response?.data,
                status: error.response?.status,
              });
            }
          } else {
            toast.error("Não autorizado", {
              description: errorMessage,
            });
          }

          // COMENTADO: Não redirecionar automaticamente para permitir debug
          // localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          // localStorage.removeItem(STORAGE_KEYS.USER_DATA);
          // setTimeout(() => {
          //   window.location.href = "/login";
          // }, 1500);
        }
        break;

      case 403:
        // Não redireciona, apenas mostra o erro
        // O componente já trata o erro 403
        console.warn("Acesso negado (403):", errorMessage);
        break;

      case 404:
        toast.error("Não encontrado", {
          description:
            errorMessage ||
            "O recurso solicitado não foi encontrado.",
        });
        break;

      case 422:
        toast.error("Dados inválidos", {
          description:
            errorMessage || "Verifique os dados enviados.",
        });
        break;

      case 500:
        toast.error("Erro no servidor", {
          description:
            "Ocorreu um erro interno. Tente novamente mais tarde.",
        });
        break;

      default:
        if (error.code === "ERR_NETWORK") {
          toast.error("Erro de conexão", {
            description:
              "Verifique sua conexão com a internet.",
          });
        } else if (errorMessage) {
          toast.error("Erro", {
            description: errorMessage,
          });
        }
    }

    return Promise.reject(error);
  }
);

export default api;

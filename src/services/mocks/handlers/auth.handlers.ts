import type MockAdapter from "axios-mock-adapter";
import { mockUsers } from "../data";
import { getAllUsuarios } from "./usuarios.handlers";

export function setupAuthHandlers(mock: MockAdapter) {
  // Mock do endpoint de login
  mock.onPost("/auth/login").reply((config) => {
    const { username, password } = JSON.parse(config.data);

    // Busca nos usuários atualizados (incluindo novos cadastros)
    const todosUsuarios = getAllUsuarios();

    // Busca por username OU email
    const user = todosUsuarios.find(
      (u) =>
        (u.username === username || u.email === username) &&
        u.password === password
    );

    if (!user) {
      return [
        401,
        { message: "Usuário ou senha inválidos" },
      ];
    }

    if (!user.ativo) {
      return [403, { message: "Usuário inativo" }];
    }

    const { username: _, password: __, ...userData } = user;
    const token = `mock-token-${user.id}-${Date.now()}`;

    return [200, { user: userData, token }];
  });

  // Mock do endpoint de logout
  mock
    .onPost("/auth/logout")
    .reply(200, { message: "Logout realizado" });

  // Mock para verificar token
  mock.onGet("/auth/me").reply((config) => {
    const token = config.headers?.Authorization?.replace(
      "Bearer ",
      ""
    );

    if (!token) {
      return [401, { message: "Token não fornecido" }];
    }

    const userData = localStorage.getItem("user-data");
    if (userData) {
      return [200, { user: JSON.parse(userData) }];
    }

    return [401, { message: "Token inválido" }];
  });
}

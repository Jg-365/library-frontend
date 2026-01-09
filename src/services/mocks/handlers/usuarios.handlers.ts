import MockAdapter from "axios-mock-adapter";
import { mockUsers } from "../data/users.mock";
import { usuarioFormSchema } from "@/schemas/UsuarioSchema";

let usuarios = [...mockUsers];

// Função para obter todos os usuários (incluindo novos cadastros)
export function getAllUsuarios() {
  return usuarios;
}

export function setupUsuariosHandlers(mock: MockAdapter) {
  // GET /usuarios - Listar todos os usuários (exceto admins)
  mock.onGet("/usuarios").reply(() => {
    // Filtra apenas usuários não administradores
    const usuariosNaoAdmins = usuarios.filter(
      (u) => u.perfil !== "ADMINISTRADOR"
    );
    return [200, usuariosNaoAdmins];
  });

  // GET /usuarios/:id - Buscar usuário por ID
  mock.onGet(/\/usuarios\/\d+/).reply((config) => {
    const id = Number(config.url?.split("/").pop());
    const usuario = usuarios.find((u) => u.id === id);

    if (!usuario) {
      return [404, { message: "Usuário não encontrado" }];
    }

    return [200, usuario];
  });

  // POST /usuarios - Criar novo usuário
  mock.onPost("/usuarios").reply((config) => {
    try {
      const dadosFormulario = JSON.parse(config.data);

      // Valida os dados usando o schema
      const dadosValidados =
        usuarioFormSchema.parse(dadosFormulario);

      // Verifica se o e-mail já existe
      const emailExiste = usuarios.some(
        (u) =>
          u.email.toLowerCase() ===
          dadosValidados.email.toLowerCase()
      );

      if (emailExiste) {
        return [
          400,
          { message: "E-mail já cadastrado no sistema" },
        ];
      }

      // Cria novo usuário
      const novoUsuario = {
        id: Math.max(...usuarios.map((u) => u.id)) + 1,
        nome: dadosValidados.nome,
        email: dadosValidados.email,
        perfil: dadosValidados.perfil,
        username: dadosValidados.email.split("@")[0],
        password: dadosValidados.senha || "123456", // senha padrão se não fornecida
        ativo: dadosValidados.ativo,
      };

      usuarios.push(novoUsuario);

      // Retorna sem a senha
      const { password, username, ...usuarioResponse } =
        novoUsuario;
      return [201, usuarioResponse];
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      if (error.errors) {
        return [
          400,
          {
            message: "Dados inválidos",
            errors: error.errors,
          },
        ];
      }
      return [400, { message: "Erro ao criar usuário" }];
    }
  });

  // PUT /usuarios/:id - Atualizar usuário
  mock.onPut(/\/usuarios\/\d+/).reply((config) => {
    try {
      const id = Number(config.url?.split("/").pop());
      const dadosFormulario = JSON.parse(config.data);

      const indice = usuarios.findIndex((u) => u.id === id);
      if (indice === -1) {
        return [404, { message: "Usuário não encontrado" }];
      }

      // Valida os dados (senha é opcional na edição)
      const dadosValidados =
        usuarioFormSchema.parse(dadosFormulario);

      // Verifica se o e-mail já existe em outro usuário
      const emailExiste = usuarios.some(
        (u) =>
          u.id !== id &&
          u.email.toLowerCase() ===
            dadosValidados.email.toLowerCase()
      );

      if (emailExiste) {
        return [
          400,
          {
            message:
              "E-mail já cadastrado por outro usuário",
          },
        ];
      }

      // Atualiza o usuário
      const usuarioAtualizado = {
        ...usuarios[indice],
        nome: dadosValidados.nome,
        email: dadosValidados.email,
        perfil: dadosValidados.perfil,
        ativo: dadosValidados.ativo,
        ...(dadosValidados.senha && {
          password: dadosValidados.senha,
        }),
      };

      usuarios[indice] = usuarioAtualizado;

      // Retorna sem a senha
      const { password, username, ...usuarioResponse } =
        usuarioAtualizado;
      return [200, usuarioResponse];
    } catch (error: any) {
      console.error("Erro ao atualizar usuário:", error);
      if (error.errors) {
        return [
          400,
          {
            message: "Dados inválidos",
            errors: error.errors,
          },
        ];
      }
      return [
        400,
        { message: "Erro ao atualizar usuário" },
      ];
    }
  });

  // DELETE /usuarios/:id - Excluir usuário
  mock.onDelete(/\/usuarios\/\d+/).reply((config) => {
    const id = Number(config.url?.split("/").pop());

    const indice = usuarios.findIndex((u) => u.id === id);
    if (indice === -1) {
      return [404, { message: "Usuário não encontrado" }];
    }

    // Verifica se não é um administrador
    if (usuarios[indice].perfil === "ADMINISTRADOR") {
      return [
        403,
        {
          message:
            "Não é permitido excluir administradores",
        },
      ];
    }

    usuarios.splice(indice, 1);
    return [204];
  });
}

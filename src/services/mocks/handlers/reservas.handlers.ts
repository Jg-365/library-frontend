import type MockAdapter from "axios-mock-adapter";
import { mockReservas } from "../data/reservas.mock";
import { mockBooks } from "../data/books.mock";
import type { Reserva } from "@/types/Reserva";

let reservas = [...mockReservas];
let nextId = Math.max(...reservas.map((r) => r.id)) + 1;

export function setupReservasHandlers(mock: MockAdapter) {
  // GET /api/reservas - Listar todas as reservas
  mock.onGet("/reservas").reply(200, reservas);

  // GET /api/reservas/:id - Buscar reserva por ID
  mock.onGet(/\/reservas\/\d+$/).reply((config) => {
    const id = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const reserva = reservas.find((r) => r.id === id);

    if (!reserva) {
      return [404, { message: "Reserva não encontrada" }];
    }

    return [200, reserva];
  });

  // GET /api/reservas/usuario/:usuarioId - Buscar reservas por usuário
  mock.onGet(/\/reservas\/usuario\/\d+/).reply((config) => {
    const usuarioId = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const reservasUsuario = reservas.filter(
      (r) => r.usuarioId === usuarioId
    );

    return [200, reservasUsuario];
  });

  // POST /api/reservas - Criar nova reserva
  mock.onPost("/reservas").reply((config) => {
    const novaReserva = JSON.parse(
      config.data
    ) as Partial<Reserva>;

    // Validações
    if (!novaReserva.usuarioId || !novaReserva.livroId) {
      return [
        400,
        { message: "Usuário e livro são obrigatórios" },
      ];
    }

    // Verificar se já existe reserva ativa para este livro por este usuário
    const reservaExistente = reservas.find(
      (r) =>
        r.usuarioId === novaReserva.usuarioId &&
        r.livroId === novaReserva.livroId &&
        r.status === "ATIVA"
    );

    if (reservaExistente) {
      return [
        400,
        {
          message:
            "Você já tem uma reserva ativa para este livro",
        },
      ];
    }

    // Buscar o livro para incluir na reserva
    const livro = mockBooks.find(
      (l) => l.id === novaReserva.livroId
    );

    // Calcular prazo de retirada (4 dias a partir de agora)
    const dataReserva = new Date();
    const prazoRetirada = new Date();
    prazoRetirada.setDate(prazoRetirada.getDate() + 4);

    const reservaCriada: Reserva = {
      id: nextId++,
      usuarioId: novaReserva.usuarioId,
      livroId: novaReserva.livroId,
      dataReserva: dataReserva.toISOString().split("T")[0],
      status: "ATIVA",
      prazoRetirada: prazoRetirada
        .toISOString()
        .split("T")[0],
      livro: livro,
    };

    reservas.push(reservaCriada);

    return [201, reservaCriada];
  });

  // PUT /api/reservas/:id/cancelar - Cancelar reserva
  mock
    .onPut(/\/reservas\/\d+\/cancelar/)
    .reply((config) => {
      const matches = config.url?.match(
        /\/reservas\/(\d+)\/cancelar/
      );
      const id = matches ? parseInt(matches[1]) : 0;
      const index = reservas.findIndex((r) => r.id === id);

      if (index === -1) {
        return [404, { message: "Reserva não encontrada" }];
      }

      if (reservas[index].status !== "ATIVA") {
        return [
          400,
          {
            message:
              "Apenas reservas ativas podem ser canceladas",
          },
        ];
      }

      reservas[index] = {
        ...reservas[index],
        status: "CANCELADA",
      };

      return [200, reservas[index]];
    });

  // PUT /api/reservas/:id/concluir - Concluir reserva (quando livro é retirado)
  mock
    .onPut(/\/reservas\/\d+\/concluir/)
    .reply((config) => {
      const matches = config.url?.match(
        /\/reservas\/(\d+)\/concluir/
      );
      const id = matches ? parseInt(matches[1]) : 0;
      const index = reservas.findIndex((r) => r.id === id);

      if (index === -1) {
        return [404, { message: "Reserva não encontrada" }];
      }

      if (reservas[index].status !== "ATIVA") {
        return [
          400,
          {
            message:
              "Apenas reservas ativas podem ser concluídas",
          },
        ];
      }

      reservas[index] = {
        ...reservas[index],
        status: "CONCLUIDA",
      };

      return [200, reservas[index]];
    });

  // DELETE /api/reservas/:id - Deletar reserva (admin)
  mock.onDelete(/\/reservas\/\d+/).reply((config) => {
    const id = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const index = reservas.findIndex((r) => r.id === id);

    if (index === -1) {
      return [404, { message: "Reserva não encontrada" }];
    }

    reservas.splice(index, 1);

    return [204];
  });
}

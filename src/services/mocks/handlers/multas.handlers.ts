import type MockAdapter from "axios-mock-adapter";
import { mockMultas } from "../data";
import type { ResumoMultasUsuario } from "@/types/Multa";

/**
 * Configura os handlers para multas
 */
export function setupMultasHandlers(mock: MockAdapter) {
  // GET /multas - Listar todas as multas
  mock.onGet("/multas").reply(200, mockMultas);

  // GET /multas/:id - Buscar multa por ID
  mock.onGet(/\/multas\/\d+$/).reply((config) => {
    const id = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const multa = mockMultas.find((m) => m.id === id);

    if (multa) {
      return [200, multa];
    }
    return [404, { message: "Multa não encontrada" }];
  });

  // GET /multas/usuario/:userId - Listar multas de um usuário
  mock.onGet(/\/multas\/usuario\/\d+$/).reply((config) => {
    const userId = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const multasUsuario = mockMultas.filter(
      (m) => m.usuarioId === userId
    );

    return [200, multasUsuario];
  });

  // GET /multas/usuario/:userId/resumo - Obter resumo de multas do usuário
  mock
    .onGet(/\/multas\/usuario\/\d+\/resumo/)
    .reply((config) => {
      const pathParts = config.url?.split("/") || [];
      const userIdIndex = pathParts.indexOf("usuario") + 1;
      const userId = parseInt(
        pathParts[userIdIndex] || "0"
      );

      const multasUsuario = mockMultas.filter(
        (m) => m.usuarioId === userId
      );
      const multasPagas = multasUsuario.filter(
        (m) => m.pago
      );
      const multasPendentes = multasUsuario.filter(
        (m) => !m.pago
      );

      const resumo: ResumoMultasUsuario = {
        usuarioId: userId,
        totalMultas: multasUsuario.length,
        multasPagas: multasPagas.length,
        multasPendentes: multasPendentes.length,
        valorTotal: multasUsuario.reduce(
          (acc, m) => acc + m.valor,
          0
        ),
        valorPago: multasPagas.reduce(
          (acc, m) => acc + m.valor,
          0
        ),
        valorPendente: multasPendentes.reduce(
          (acc, m) => acc + m.valor,
          0
        ),
        multas: multasUsuario,
      };

      return [200, resumo];
    });

  // PUT /multas/:id/pagar - Pagar uma multa
  mock.onPut(/\/multas\/\d+\/pagar/).reply((config) => {
    const id = parseInt(config.url?.split("/")[2] || "0");
    const multaIndex = mockMultas.findIndex(
      (m) => m.id === id
    );

    if (multaIndex !== -1) {
      const multa = mockMultas[multaIndex];

      if (multa.pago) {
        return [400, { message: "Esta multa já foi paga" }];
      }

      multa.pago = true;
      multa.dataPagamento = new Date()
        .toISOString()
        .split("T")[0];

      return [200, multa];
    }
    return [404, { message: "Multa não encontrada" }];
  });

  // --- Aliases em inglês para compatibilidade com API real (/fines/*)
  mock.onGet("/fines").reply(200, mockMultas);

  mock.onGet(/\/fines\/\d+$/).reply((config) => {
    const id = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const multa = mockMultas.find((m) => m.id === id);

    if (multa) return [200, multa];
    return [404, { message: "Fine not found" }];
  });

  mock.onGet(/\/fines\/user\/pending$/).reply(200, () => {
    // Return all pending fines for a fake current user (filter not applied here)
    const pending = mockMultas.filter((m) => !m.pago);
    return [200, pending];
  });

  mock.onGet(/\/fines\/user\/pending\/\d+$/).reply((config) => {
    const parts = config.url?.split("/") || [];
    const userId = parseInt(parts.pop() || "0");
    const pending = mockMultas.filter(
      (m) => !m.pago && m.usuarioId === userId
    );
    return [200, pending];
  });

  mock.onGet(/\/fines\/user\/paid$/).reply(200, () => {
    const paid = mockMultas.filter((m) => m.pago);
    return [200, paid];
  });

  mock.onGet(/\/fines\/user\/paid\/\d+$/).reply((config) => {
    const parts = config.url?.split("/") || [];
    const userId = parseInt(parts.pop() || "0");
    const paid = mockMultas.filter(
      (m) => m.pago && m.usuarioId === userId
    );
    return [200, paid];
  });

  mock.onPatch(/\/fines\/pay\/\d+$/).reply((config) => {
    const parts = config.url?.split("/") || [];
    const id = parseInt(parts.pop() || "0");
    const multaIndex = mockMultas.findIndex(
      (m) => m.id === id
    );
    if (multaIndex === -1)
      return [404, { message: "Fine not found" }];

    const multa = mockMultas[multaIndex];
    if (multa.pago)
      return [
        400,
        { message: "This fine is already paid" },
      ];

    multa.pago = true;
    multa.dataPagamento = new Date()
      .toISOString()
      .split("T")[0];
    return [200, multa];
  });
}

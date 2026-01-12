import type MockAdapter from "axios-mock-adapter";
import {
  mockEmprestimos,
  mockBooks,
  mockUsers,
  adicionarEmprestimo,
  calcularMulta,
} from "../data";
import type { Emprestimo } from "@/types/Emprestimo";

// Função helper para enriquecer empréstimo com dados do usuário
const enriquecerEmprestimo = (
  emprestimo: Emprestimo
): Emprestimo => {
  const usuario = mockUsers.find(
    (u) => u.id === emprestimo.usuarioId
  );
  return {
    ...emprestimo,
    usuario: usuario
      ? {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil,
        }
      : undefined,
  };
};

export function setupEmprestimosHandlers(
  mock: MockAdapter
) {
  // GET /emprestimos - Buscar todos os empréstimos
  mock.onGet("/emprestimos").reply(() => {
    const emprestimosEnriquecidos = mockEmprestimos.map(
      enriquecerEmprestimo
    );
    return [200, emprestimosEnriquecidos];
  });

  // GET /emprestimos/meus - Buscar empréstimos do usuário logado
  mock.onGet("/emprestimos/meus").reply(() => {
    const emprestimosEnriquecidos = mockEmprestimos.map(
      enriquecerEmprestimo
    );
    return [200, emprestimosEnriquecidos];
  });

  // GET /emprestimos/usuario/:userId - Buscar empréstimos de um usuário específico
  mock
    .onGet(/\/emprestimos\/usuario\/\d+/)
    .reply((config) => {
      const userId = parseInt(
        config.url?.split("/").pop() || "0"
      );
      const emprestimosUsuario = mockEmprestimos
        .filter((e) => e.usuarioId === userId)
        .map(enriquecerEmprestimo);
      return [200, emprestimosUsuario];
    });

  // GET /emprestimos/:id - Buscar empréstimo específico
  mock.onGet(/\/emprestimos\/\d+$/).reply((config) => {
    const id = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const emprestimo = mockEmprestimos.find(
      (e) => e.id === id
    );

    if (emprestimo) {
      return [200, enriquecerEmprestimo(emprestimo)];
    }
    return [404, { message: "Empréstimo não encontrado" }];
  });

  // POST /emprestimos - Criar empréstimo simples (1 livro)
  mock.onPost("/emprestimos").reply((config) => {
    const dados = JSON.parse(config.data);

    const livro = mockBooks.find(
      (l) => l.id === dados.livroId
    );
    if (!livro) {
      return [404, { message: "Livro não encontrado" }];
    }

    if (livro.quantidadeExemplares <= 0) {
      return [
        400,
        { message: "Livro não disponível para empréstimo" },
      ];
    }

    const dataInicio = new Date()
      .toISOString()
      .split("T")[0];
    const dataPrevista = new Date();
    dataPrevista.setDate(dataPrevista.getDate() + 14); // 14 dias de prazo

    const novoEmprestimo = adicionarEmprestimo({
      usuarioId: dados.usuarioId,
      livros: [livro],
      livro: livro,
      dataInicio,
      dataEmprestimo: dataInicio,
      dataPrevistaDevolucao: dataPrevista
        .toISOString()
        .split("T")[0],
      multa: 0,
      status: "ATIVO",
    });

    // Atualizar quantidade disponível
    livro.quantidadeExemplares--;

    return [201, enriquecerEmprestimo(novoEmprestimo)];
  });

  // POST /emprestimos/multiplo - Criar empréstimo com múltiplos livros
  mock.onPost("/emprestimos/multiplo").reply((config) => {
    const dados = JSON.parse(config.data);

    // Validar que todos os livros existem e estão disponíveis
    const livrosIds: number[] = dados.livrosIds || [];
    const livros = livrosIds
      .map((id) => mockBooks.find((l) => l.id === id))
      .filter(Boolean);

    if (livros.length !== livrosIds.length) {
      return [
        404,
        { message: "Um ou mais livros não encontrados" },
      ];
    }

    const livrosIndisponiveis = livros.filter(
      (l) => l!.quantidadeExemplares <= 0
    );
    if (livrosIndisponiveis.length > 0) {
      return [
        400,
        {
          message:
            "Um ou mais livros não estão disponíveis para empréstimo",
          livrosIndisponiveis: livrosIndisponiveis.map(
            (l) => l!.titulo
          ),
        },
      ];
    }

    const dataInicio = new Date()
      .toISOString()
      .split("T")[0];
    const dataPrevista = new Date();
    dataPrevista.setDate(dataPrevista.getDate() + 14); // 14 dias de prazo

    const novoEmprestimo = adicionarEmprestimo({
      usuarioId: dados.usuarioId,
      livros: livros as any[],
      livro: livros[0] as any, // Primeiro livro para compatibilidade
      dataInicio,
      dataEmprestimo: dataInicio,
      dataPrevistaDevolucao: dataPrevista
        .toISOString()
        .split("T")[0],
      multa: 0,
      status: "ATIVO",
    });

    // Atualizar quantidade disponível de todos os livros
    livros.forEach((livro) => {
      livro!.quantidadeExemplares--;
    });

    return [201, enriquecerEmprestimo(novoEmprestimo)];
  });

  // PUT /emprestimos/:id/devolver - Devolver empréstimo
  mock
    .onPut(/\/emprestimos\/\d+\/devolver/)
    .reply((config) => {
      const id = parseInt(config.url?.split("/")[2] || "0");
      const emprestimoIndex = mockEmprestimos.findIndex(
        (e) => e.id === id
      );

      if (emprestimoIndex === -1) {
        return [
          404,
          { message: "Empréstimo não encontrado" },
        ];
      }

      const emprestimo = mockEmprestimos[emprestimoIndex];

      if (emprestimo.dataDevolucaoReal) {
        return [
          400,
          { message: "Este empréstimo já foi devolvido" },
        ];
      }

      const dataDevolucao = new Date()
        .toISOString()
        .split("T")[0];
      const dataLimite = new Date(
        emprestimo.dataPrevistaDevolucao
      );
      const dataDev = new Date(dataDevolucao);

      // Calcular multa se houver atraso
      let multa = 0;
      if (dataDev > dataLimite) {
        const diasAtraso = Math.floor(
          (dataDev.getTime() - dataLimite.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        multa = calcularMulta(diasAtraso);
      }

      emprestimo.dataDevolucaoReal = dataDevolucao;
      emprestimo.multa = multa;
      emprestimo.status = "DEVOLVIDO";

      // Devolver livros ao acervo
      emprestimo.livros.forEach((livro) => {
        const livroNoAcervo = mockBooks.find(
          (l) => l.id === livro.id
        );
        if (livroNoAcervo) {
          livroNoAcervo.quantidadeExemplares++;
        }
      });

      return [200, enriquecerEmprestimo(emprestimo)];
    });

  // PUT /emprestimos/:id/renovar - Renovar empréstimo
  mock
    .onPut(/\/emprestimos\/\d+\/renovar/)
    .reply((config) => {
      const id = parseInt(config.url?.split("/")[2] || "0");
      const emprestimoIndex = mockEmprestimos.findIndex(
        (e) => e.id === id
      );

      if (emprestimoIndex === -1) {
        return [
          404,
          { message: "Empréstimo não encontrado" },
        ];
      }

      const emprestimo = mockEmprestimos[emprestimoIndex];

      if (emprestimo.dataDevolucaoReal) {
        return [
          400,
          {
            message:
              "Este empréstimo já foi devolvido e não pode ser renovado",
          },
        ];
      }

      // Adicionar mais 14 dias ao prazo
      const novaData = new Date(
        emprestimo.dataPrevistaDevolucao
      );
      novaData.setDate(novaData.getDate() + 14);
      emprestimo.dataPrevistaDevolucao = novaData
        .toISOString()
        .split("T")[0];

      return [200, enriquecerEmprestimo(emprestimo)];
    });

  // PUT /emprestimos/:id - Atualizar empréstimo (genérico)
  mock.onPut(/\/emprestimos\/\d+$/).reply((config) => {
    const id = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const emprestimoIndex = mockEmprestimos.findIndex(
      (e) => e.id === id
    );

    if (emprestimoIndex === -1) {
      return [
        404,
        { message: "Empréstimo não encontrado" },
      ];
    }

    const dadosAtualizados = JSON.parse(config.data);
    const emprestimoAtualizado = {
      ...mockEmprestimos[emprestimoIndex],
      ...dadosAtualizados,
    };

    mockEmprestimos[emprestimoIndex] = emprestimoAtualizado;
    return [
      200,
      enriquecerEmprestimo(emprestimoAtualizado),
    ];
  });
}


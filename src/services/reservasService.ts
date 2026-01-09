/**
 * Serviço de Reservas - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a reservas.
 * Integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type { Reserva } from "@/types";
import type { ReserveResponse } from "@/types/BackendResponses";

/**
 * Converte ReserveResponse do backend para Reserva do frontend
 */
async function mapReserveResponseToReserva(
  reserve: ReserveResponse
): Promise<Reserva> {
  const reserva: Partial<Reserva> = {
    id: reserve.id,
    usuarioId: reserve.userEnrollment,
    livroIsbn: reserve.bookIsbn,
    dataReserva: reserve.reserveDate,
    status: "ATIVA",
  };

  // Tentar popular o objeto `livro` para evitar undefined em componentes
  if (reserve.bookIsbn) {
    try {
      const resp = await api.get(
        API_ENDPOINTS.LIVROS.BY_ISBN(reserve.bookIsbn)
      );
      const book = resp.data;

      const autores: any[] = [];
      if (book?.emailAuthor) {
        autores.push({
          id: 0,
          nome: book.emailAuthor,
          email: book.emailAuthor,
          nacionalidade: "",
        });
      }
      if (Array.isArray(book?.coAuthorsEmails)) {
        for (const email of book.coAuthorsEmails) {
          autores.push({
            id: 0,
            nome: email,
            email,
            nacionalidade: "",
          });
        }
      }

      const livro = {
        id: 0,
        isbn: reserve.bookIsbn,
        titulo:
          book?.title ||
          `Livro (ISBN: ${reserve.bookIsbn})`,
        ano: book?.releaseYear || 0,
        editora: book?.publisher || "",
        imagemCapa: book?.imageUrl || undefined,
        categoriaId: book?.subCategoryId || 0,
        subcategoriaId: book?.subCategoryId || undefined,
        categoria: book?.category || undefined,
        subcategoria: undefined,
        descricao: book?.description || undefined,
        imagemUrl: book?.imageUrl || undefined,
        autores: autores,
        quantidadeExemplares:
          book?.numberOfCopies ??
          book?.availableCopies ??
          0,
      };

      reserva.livro = livro as any;
    } catch (error) {
      // Se falhar, continue com fallback simples (livro undefined é tratado nos componentes)
      console.error(
        "Erro ao popular livro da reserva:",
        error
      );
    }
  }

  return reserva as Reserva;
}

export const reservasService = {
  /**
   * Criar nova reserva
   * POST /reserves
   */
  async criar(dados: {
    userEnrollment: number;
    bookIsbn: string;
  }): Promise<Reserva> {
    const response = await api.post<ReserveResponse>(
      API_ENDPOINTS.RESERVAS.CREATE,
      dados
    );
    return await mapReserveResponseToReserva(response.data);
  },

  /**
   * Buscar reserva por ID
   * GET /reserves/{id}
   */
  async buscarPorId(id: number): Promise<Reserva> {
    const response = await api.get<ReserveResponse>(
      API_ENDPOINTS.RESERVAS.BY_ID(id)
    );
    return await mapReserveResponseToReserva(response.data);
  },

  /**
   * Listar reservas do usuário atual
   * GET /reserves/users
   */
  async listarPorUsuario(): Promise<Reserva[]> {
    const response = await api.get(
      API_ENDPOINTS.RESERVAS.BY_USER
    );

    // Verificar se é array ou paginado
    const reservesArray = Array.isArray(response.data)
      ? response.data
      : response.data?.content || [];

    return await Promise.all(
      reservesArray.map(mapReserveResponseToReserva)
    );
  },

  /**
   * Listar reservas por livro (ISBN)
   * GET /reserves/books/{isbn}
   */
  async listarPorLivro(isbn: string): Promise<Reserva[]> {
    const response = await api.get(
      API_ENDPOINTS.RESERVAS.BY_BOOK(isbn)
    );

    // Verificar se é array ou paginado
    const reservesArray = Array.isArray(response.data)
      ? response.data
      : response.data?.content || [];

    return await Promise.all(
      reservesArray.map(mapReserveResponseToReserva)
    );
  },

  /**
   * Deletar/Cancelar reserva
   * DELETE /reserves/{id}
   */
  async deletar(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.RESERVAS.DELETE(id));
  },

  /**
   * Cancelar reserva
   * DELETE /reserves/{id}
   */
  async cancelar(id: number): Promise<void> {
    await api.delete(
      API_ENDPOINTS.RESERVAS.CANCELAR(id)
    );
  },
};

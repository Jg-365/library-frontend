/**
 * Serviço de Livros - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a livros.
 * Agora integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type {
  Livro,
  FiltroLivros,
  ResultadoFiltroLivros,
} from "@/types";
import type {
  BookRequest,
  BookRequestUpdate,
} from "@/types/BackendRequests";
import type { BookResponse } from "@/types/BackendResponses";
import { mapBookResponseToLivro } from "./mappers/bookMapper";

export const livrosService = {
  /**
   * Listar/Buscar todos os livros
   * GET /books
   */
  async listarTodos(): Promise<Livro[]> {
    const response = await api.get(
      API_ENDPOINTS.LIVROS.BASE
    );

    console.log(
      "📚 Response raw from backend:",
      response.data
    );

    // Verificar se data é array ou se está dentro de content (paginação Spring Boot)
    const booksArray = Array.isArray(response.data)
      ? response.data
      : response.data?.content || [];

    console.log(
      "📚 Total de livros recebidos:",
      booksArray.length
    );
    if (booksArray.length > 0) {
      console.log(
        "📚 Primeiro livro mapeado:",
        booksArray[0]
      );
    }

    const mappedBooks = booksArray.map(
      mapBookResponseToLivro
    );

    console.log(
      "📚 Livros após mapeamento:",
      mappedBooks.length
    );
    if (mappedBooks.length > 0) {
      console.log("📚 Exemplo de livro mapeado:", {
        titulo: mappedBooks[0]?.titulo,
        autores: mappedBooks[0]?.autores,
        quantidadeExemplares:
          mappedBooks[0]?.quantidadeExemplares,
        editora: mappedBooks[0]?.editora,
        categoria: mappedBooks[0]?.categoria,
      });
    }

    return mappedBooks;
  },

  /**
   * Buscar livro por ISBN
   * GET /books/{isbn}
   */
  async buscarPorIsbn(isbn: string): Promise<Livro> {
    const response = await api.get<BookResponse>(
      API_ENDPOINTS.LIVROS.BY_ISBN(isbn)
    );
    return mapBookResponseToLivro(response.data);
  },

  /**
   * Buscar/Filtrar livros (usando query params)
   * GET /books
   */
  async filtrar(
    filtros: FiltroLivros
  ): Promise<ResultadoFiltroLivros> {
    const params = new URLSearchParams();

    if (filtros.categoriaId)
      params.append(
        "categoriaId",
        filtros.categoriaId.toString()
      );
    if (filtros.subcategoriaId)
      params.append(
        "subcategoriaId",
        filtros.subcategoriaId.toString()
      );
    if (filtros.autorId)
      params.append("autorId", filtros.autorId.toString());
    if (filtros.editora)
      params.append("editora", filtros.editora);
    if (filtros.anoMin)
      params.append("anoMin", filtros.anoMin.toString());
    if (filtros.anoMax)
      params.append("anoMax", filtros.anoMax.toString());
    if (filtros.disponivelApenas)
      params.append("disponivelApenas", "true");
    if (filtros.termo)
      params.append("termo", filtros.termo);

    const response = await api.get<ResultadoFiltroLivros>(
      `${API_ENDPOINTS.LIVROS.SEARCH}?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Criar novo livro
   * POST /books
   */
  async criar(payload: BookRequest): Promise<Livro> {
    const response = await api.post<BookResponse>(
      API_ENDPOINTS.LIVROS.CREATE,
      payload
    );
    return mapBookResponseToLivro(response.data);
  },

  /**
   * Atualizar livro existente
   * PATCH /books/{isbn}
   */
  async atualizar(
    isbn: string,
    payload: BookRequestUpdate
  ): Promise<Livro> {
    const response = await api.patch<BookResponse>(
      API_ENDPOINTS.LIVROS.UPDATE(isbn),
      payload
    );
    return mapBookResponseToLivro(response.data);
  },

  /**
   * Deletar livro
   * DELETE /books/{isbn}
   */
  async deletar(isbn: string): Promise<void> {
    await api.delete(API_ENDPOINTS.LIVROS.DELETE(isbn));
  },

  /**
   * Remover coautores de um livro
   * DELETE /books/{isbn}/co-authors
   */
  async removerCoautores(isbn: string): Promise<void> {
    await api.delete(
      API_ENDPOINTS.LIVROS.REMOVE_CO_AUTHORS(isbn)
    );
  },
};

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
  _cache: new Map<string, Livro[]>(),

  _cacheKey(options?: {
    page?: number;
    size?: number;
  }) {
    if (!options?.page && !options?.size) {
      return "all";
    }
    return `page=${options?.page ?? 0}&size=${
      options?.size ?? 10
    }`;
  },

  /**
   * Listar/Buscar todos os livros
   * GET /books
   */
  async listarTodos(options?: {
    page?: number;
    size?: number;
    force?: boolean;
  }): Promise<Livro[]> {
    const cacheKey = livrosService._cacheKey(options);
    if (!options?.force && livrosService._cache.has(cacheKey)) {
      return livrosService._cache.get(cacheKey) || [];
    }

    const response = await api.get(
      API_ENDPOINTS.LIVROS.BASE,
      {
        params:
          options?.page !== undefined ||
          options?.size !== undefined
            ? {
                page: options?.page,
                size: options?.size,
              }
            : undefined,
      }
    );

    // Verificar se data é array ou se está dentro de content (paginação Spring Boot)
    const booksArray = Array.isArray(response.data)
      ? response.data
      : response.data?.content || [];

    const mappedBooks = booksArray.map(
      mapBookResponseToLivro
    );

    livrosService._cache.set(cacheKey, mappedBooks);
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

    if (filtros.category)
      params.append(
        "category",
        filtros.category
      );
    if (filtros.subCategory)
      params.append(
        "subCategory",
        filtros.subCategory
      );
    if (filtros.author)
      params.append("author", filtros.author);
    if (filtros.publisher)
      params.append("publisher", filtros.publisher);
    if (filtros.title)
      params.append("title", filtros.title);
    if (filtros.isbn) params.append("isbn", filtros.isbn);
    if (filtros.releaseYearMin)
      params.append(
        "releaseYearMin",
        filtros.releaseYearMin.toString()
      );
    if (filtros.releaseYearMax)
      params.append(
        "releaseYearMax",
        filtros.releaseYearMax.toString()
      );
    if (filtros.availableOnly)
      params.append("availableOnly", "true");
    if (filtros.term) params.append("term", filtros.term);

    params.append(
      "page",
      (filtros.page ?? 0).toString()
    );
    params.append(
      "size",
      (filtros.size ?? 10).toString()
    );

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
    livrosService._cache.clear();
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
    livrosService._cache.clear();
    return mapBookResponseToLivro(response.data);
  },

  /**
   * Deletar livro
   * DELETE /books/{isbn}
   */
  async deletar(isbn: string): Promise<void> {
    await api.delete(API_ENDPOINTS.LIVROS.DELETE(isbn));
    livrosService._cache.clear();
  },

  /**
   * Remover coautores de um livro
   * DELETE /books/{isbn}/co-authors
   */
  async removerCoautores(
    isbn: string,
    emails: string[]
  ): Promise<void> {
    await api.delete(
      API_ENDPOINTS.LIVROS.REMOVE_CO_AUTHORS(isbn),
      {
        data: {
          coAuthorsEmails: emails,
        },
      }
    );
  },
};

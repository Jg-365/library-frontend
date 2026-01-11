import type { Livro } from "@/types/Livro";
import type { BookFilterValues } from "@/components/main/filter";

export function filterBooks(
  books: Livro[],
  filters: BookFilterValues
): Livro[] {
  return books.filter((book) => {
    // Filtro por título
    if (filters.titulo) {
      const titulo = (
        book.titulo ||
        (book as any).title ||
        ""
      ).toLowerCase();
      const filtroTitulo = (
        filters.titulo ?? ""
      ).toLowerCase();
      const match = titulo.includes(filtroTitulo);
      if (!match) return false;
    }

    // Filtro por autor
    if (filters.autor) {
      const autores = book.autores || [];
      const filtroAutor = (
        filters.autor ?? ""
      ).toLowerCase();
      const match = autores.some((autor) =>
        (autor?.nome ?? "")
          .toLowerCase()
          .includes(filtroAutor)
      );
      if (!match) return false;
    }

    // Filtro por editora
    if (filters.editora) {
      const editora = (book.editora ?? "").toLowerCase();
      const filtroEditora = (
        filters.editora ?? ""
      ).toLowerCase();
      const match = editora.includes(filtroEditora);
      if (!match) return false;
    }

    // Filtro por ISBN
    if (filters.isbn) {
      const isbn = (book.isbn ?? "").toLowerCase();
      const filtroIsbn = (filters.isbn ?? "").toLowerCase();
      const match = isbn.includes(filtroIsbn);
      if (!match) return false;
    }

    // Filtro por ano
    if (filters.ano) {
      if (filters.ano === "older") {
        if (book.ano >= 2015) return false;
      } else {
        if (book.ano.toString() !== filters.ano)
          return false;
      }
    }

    // Filtro por categoria
    if (filters.category) {
      const categoria = (book.categoria ?? "")
        .toLowerCase()
        .trim();
      const filtroCategoria = (
        filters.category ?? ""
      ).toLowerCase();
      if (!categoria || !categoria.includes(filtroCategoria))
        return false;
    }

    // Filtro por subcategoria
    if (filters.subCategory) {
      const subcategoria = (book.subcategoria ?? "")
        .toLowerCase()
        .trim();
      const filtroSubcategoria = (
        filters.subCategory ?? ""
      ).toLowerCase();
      if (
        !subcategoria ||
        !subcategoria.includes(filtroSubcategoria)
      )
        return false;
    }

    return true;
  });
}

export default filterBooks;

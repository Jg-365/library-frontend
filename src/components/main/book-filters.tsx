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
      const match = titulo.includes(
        filters.titulo.toLowerCase()
      );
      if (!match) return false;
    }

    // Filtro por autor
    if (filters.autor) {
      const autores = book.autores || [];
      const match = autores.some((autor) =>
        (autor?.nome || "")
          .toLowerCase()
          .includes(filters.autor!.toLowerCase())
      );
      if (!match) return false;
    }

    // Filtro por editora
    if (filters.editora) {
      const editora = (book.editora || "").toLowerCase();
      const match = editora.includes(
        filters.editora.toLowerCase()
      );
      if (!match) return false;
    }

    // Filtro por ISBN
    if (filters.isbn) {
      const match = book.isbn
        .toLowerCase()
        .includes(filters.isbn.toLowerCase());
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
      const categoria = (book.categoria || "")
        .toLowerCase()
        .trim();
      if (
        !categoria ||
        !categoria.includes(filters.category.toLowerCase())
      )
        return false;
    }

    // Filtro por subcategoria
    if (filters.subCategory) {
      const subcategoria = (book.subcategoria || "")
        .toLowerCase()
        .trim();
      if (
        !subcategoria ||
        !subcategoria.includes(
          filters.subCategory.toLowerCase()
        )
      )
        return false;
    }

    return true;
  });
}

export default filterBooks;

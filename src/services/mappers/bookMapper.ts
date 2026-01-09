import type { Livro, Autor } from "@/types";
import type { BookResponse } from "@/types/BackendResponses";

function addAutorIfMissing(
  autores: Autor[],
  nome: string | undefined,
  email: string | undefined
) {
  if (!nome && !email) {
    return;
  }

  const chave =
    email?.toLowerCase() ?? nome?.toLowerCase() ?? "";

  if (
    chave &&
    autores.some(
      (autor) =>
        autor.email?.toLowerCase() === chave ||
        autor.nome?.toLowerCase() === chave
    )
  ) {
    return;
  }

  autores.push({
    id: 0,
    nome: nome || email || "Autor desconhecido",
    email: email || "",
  });
}

/**
 * Converte BookResponse do backend para Livro do frontend.
 */
export function mapBookResponseToLivro(
  book: BookResponse
): Livro {
  const autores: Autor[] = [];

  addAutorIfMissing(
    autores,
    book.author,
    book.emailAuthor
  );

  if (book.emailAuthor && !book.author) {
    addAutorIfMissing(
      autores,
      book.emailAuthor,
      book.emailAuthor
    );
  }

  if (Array.isArray(book.coAuthorsEmails)) {
    book.coAuthorsEmails.forEach((email) =>
      addAutorIfMissing(autores, email, email)
    );
  }

  return {
    id: 0,
    isbn: book.isbn || "",
    titulo: book.title || "Título não informado",
    ano: book.releaseYear || 0,
    editora: book.publisher || "",
    categoriaId: book.categoryId || 0,
    subcategoriaId: book.subCategoryId || 0,
    categoria: book.category || undefined,
    subcategoria: book.subCategory || undefined,
    descricao: book.description || undefined,
    imagemCapa: book.imageUrl || undefined,
    imagemUrl: book.imageUrl || undefined,
    autores,
    quantidadeExemplares:
      book.availableCopies ??
      book.numberOfCopies ??
      0,
  };
}

/**
 * Serviço para integração com Google Books API
 * Busca capas de livros usando ISBN
 */

const GOOGLE_BOOKS_API =
  "https://www.googleapis.com/books/v1/volumes";

interface GoogleBookVolume {
  volumeInfo?: {
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}

interface GoogleBooksResponse {
  items?: GoogleBookVolume[];
}

/**
 * Busca a URL da capa do livro pelo ISBN
 * @param isbn ISBN do livro
 * @returns URL da imagem ou null se não encontrada
 */
export async function getBookCoverByISBN(
  isbn: string
): Promise<string | null> {
  if (!isbn) return null;

  try {
    // Remove hífens e espaços do ISBN
    const cleanISBN = isbn.replace(/[-\s]/g, "");

    const response = await fetch(
      `${GOOGLE_BOOKS_API}?q=isbn:${cleanISBN}`
    );

    if (!response.ok) return null;

    const data: GoogleBooksResponse = await response.json();

    // Pega a primeira imagem encontrada
    const thumbnail =
      data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail ||
      data.items?.[0]?.volumeInfo?.imageLinks
        ?.smallThumbnail;

    // Converte HTTP para HTTPS se necessário
    return thumbnail
      ? thumbnail.replace("http://", "https://")
      : null;
  } catch (error) {
    console.warn(
      `Falha ao buscar capa para ISBN ${isbn}:`,
      error
    );
    return null;
  }
}

/**
 * Busca a URL da capa do livro pelo título e autor
 * Fallback quando ISBN não está disponível
 * @param title Título do livro
 * @param author Autor do livro (opcional)
 * @returns URL da imagem ou null se não encontrada
 */
export async function getBookCoverByTitle(
  title: string,
  author?: string
): Promise<string | null> {
  if (!title) return null;

  try {
    const query = author
      ? `intitle:${title}+inauthor:${author}`
      : `intitle:${title}`;

    const response = await fetch(
      `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) return null;

    const data: GoogleBooksResponse = await response.json();

    const thumbnail =
      data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail ||
      data.items?.[0]?.volumeInfo?.imageLinks
        ?.smallThumbnail;

    return thumbnail
      ? thumbnail.replace("http://", "https://")
      : null;
  } catch (error) {
    console.warn(
      `Falha ao buscar capa para "${title}":`,
      error
    );
    return null;
  }
}

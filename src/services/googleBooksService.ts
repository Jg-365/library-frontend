/**
 * Serviço para integração com Google Books API
 * Busca capas de livros usando ISBN
 */

const GOOGLE_BOOKS_API =
  "https://www.googleapis.com/books/v1/volumes";

interface GoogleBookVolume {
  volumeInfo?: {
    imageLinks?: {
      extraLarge?: string;
      large?: string;
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

    const imageLinks =
      data.items?.[0]?.volumeInfo?.imageLinks;
    const thumbnail = getPreferredCoverUrl(imageLinks);

    return normalizeCoverUrl(thumbnail);
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

    const imageLinks =
      data.items?.[0]?.volumeInfo?.imageLinks;
    const thumbnail = getPreferredCoverUrl(imageLinks);

    return normalizeCoverUrl(thumbnail);
  } catch (error) {
    console.warn(
      `Falha ao buscar capa para "${title}":`,
      error
    );
    return null;
  }
}

function getPreferredCoverUrl(
  imageLinks: NonNullable<
    GoogleBookVolume["volumeInfo"]
  >["imageLinks"]
): string | undefined {
  return (
    imageLinks?.extraLarge ||
    imageLinks?.large ||
    imageLinks?.thumbnail ||
    imageLinks?.smallThumbnail
  );
}

function normalizeCoverUrl(
  thumbnail?: string
): string | null {
  if (!thumbnail) return null;

  const httpsUrl = thumbnail.replace("http://", "https://");

  return httpsUrl.replace(/zoom=1\b/, "zoom=2");
}

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

const fetchCoverFromQuery = async (
  query: string
): Promise<string | null> => {
  const response = await fetch(
    `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) return null;

  const data: GoogleBooksResponse = await response.json();
  const imageLinks = data.items?.[0]?.volumeInfo?.imageLinks;
  const thumbnail = getPreferredCoverUrl(imageLinks);

  return normalizeCoverUrl(thumbnail);
};

const toIsbn10 = (isbn13: string): string | null => {
  const digits = isbn13.replace(/[^0-9]/g, "");
  if (digits.length !== 13 || !digits.startsWith("978")) {
    return null;
  }
  const core = digits.slice(3, 12);
  let sum = 0;
  for (let i = 0; i < core.length; i += 1) {
    sum += (10 - i) * Number(core[i]);
  }
  const remainder = sum % 11;
  const check = (11 - remainder) % 11;
  const checkDigit = check === 10 ? "X" : String(check);
  return `${core}${checkDigit}`;
};

const toIsbn13 = (isbn10: string): string | null => {
  const digits = isbn10.replace(/[^0-9X]/gi, "");
  if (digits.length !== 10) {
    return null;
  }
  const core = `978${digits.slice(0, 9)}`;
  let sum = 0;
  for (let i = 0; i < core.length; i += 1) {
    sum += Number(core[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return `${core}${check}`;
};

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
    const queries = [`isbn:${cleanISBN}`];
    const isbn10 =
      cleanISBN.length === 13 ? toIsbn10(cleanISBN) : null;
    const isbn13 =
      cleanISBN.length === 10 ? toIsbn13(cleanISBN) : null;

    if (isbn10) queries.push(`isbn:${isbn10}`);
    if (isbn13) queries.push(`isbn:${isbn13}`);

    for (const query of queries) {
      const thumbnail = await fetchCoverFromQuery(query);
      if (thumbnail) {
        return thumbnail;
      }
    }

    return null;
  } catch (error) {
    console.warn(
      `Falha ao buscar capa para ISBN ${isbn}:`,
      error
    );
    return null;
  }
}

/**
 * Busca a capa do livro usando ISBN e fallback por título/autor.
 */
export async function getBookCoverWithFallback(
  isbn: string,
  title?: string,
  author?: string
): Promise<string | null> {
  const byIsbn = await getBookCoverByISBN(isbn);
  if (byIsbn) return byIsbn;
  if (!title) return null;
  return getBookCoverByTitle(title, author);
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


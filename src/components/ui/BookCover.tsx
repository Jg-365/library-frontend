import { useState, useEffect } from "react";
import { getBookCoverByISBN } from "@/services/googleBooksService";
import { BookOpen } from "lucide-react";

interface BookCoverProps {
  isbn: string;
  title: string;
  className?: string;
  fallbackClassName?: string;
}

/**
 * Componente que busca e exibe a capa do livro do Google Books
 */
export function BookCover({
  isbn,
  title,
  className = "w-full h-48 object-cover rounded-t-lg",
  fallbackClassName = "w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center rounded-t-lg",
}: BookCoverProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCover = async () => {
      setIsLoading(true);
      setHasError(false);

      const url = await getBookCoverByISBN(isbn);

      if (isMounted) {
        setCoverUrl(url);
        setIsLoading(false);
      }
    };

    if (isbn) {
      fetchCover();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isbn]);

  // Loading state
  if (isLoading) {
    return (
      <div className={fallbackClassName}>
        <div className="animate-pulse">
          <BookOpen className="h-16 w-16 text-gray-300" />
        </div>
      </div>
    );
  }

  // Se tem URL da capa e não deu erro ao carregar
  if (coverUrl && !hasError) {
    return (
      <img
        src={coverUrl}
        alt={`Capa do livro ${title}`}
        className={className}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    );
  }

  // Fallback: ícone de livro quando não há capa ou erro
  return (
    <div className={fallbackClassName}>
      <div className="text-center">
        <BookOpen className="h-16 w-16 text-indigo-400 mx-auto mb-2" />
        <p className="text-xs text-gray-500 px-4">
          {title}
        </p>
      </div>
    </div>
  );
}

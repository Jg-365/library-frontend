import { useState, useEffect } from "react";
import { getBookCoverWithFallback } from "@/services/googleBooksService";
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
  className = "w-full h-48 object-contain rounded-t-lg",
  fallbackClassName = "w-full h-48 bg-slate-100 text-gray-700 font-medium flex items-center justify-center rounded-t-lg dark:bg-slate-800 dark:text-slate-200",
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

      const url = await getBookCoverWithFallback(isbn, title);

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
  }, [isbn, title]);

  // Loading state
  if (isLoading) {
    return (
      <div className={fallbackClassName}>
        <div className="animate-pulse">
          <BookOpen className="h-16 w-16 text-gray-300 dark:text-slate-500" />
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
        style={{ imageRendering: "auto" }}
      />
    );
  }

  // Fallback: ícone de livro quando não há capa ou erro
  return (
    <div className={fallbackClassName}>
      <div className="text-center">
        <BookOpen className="h-16 w-16 text-indigo-400 mx-auto mb-2" />
        <p className="text-xs text-gray-500 dark:text-slate-400 px-4">
          {title}
        </p>
      </div>
    </div>
  );
}

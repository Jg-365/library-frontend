import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import type { Livro } from "@/types/index";
import { api } from "@/services/api";
interface BookDetailsProps {
  livro: Livro;
}

export function BookDetails({ livro }: BookDetailsProps) {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const carregarDetalhesLivro = async () => {
      try {
        const response = await api.get("/livros");
        setLivros(response.data);
      } catch (err: any) {
        setError("Erro livro");
      } finally {
        setLoading(false);
      }
    };
    carregarDetalhesLivro();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-4">Carregando...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl">
          {livro?.titulo ??
            (livro as any)?.title ??
            "Título não informado"}
        </CardTitle>
        <CardDescription className="text-base">
          {((livro?.autores || []) as any[])
            .map((autor) => autor?.nome || "")
            .filter(Boolean)
            .join(", ")}{" "}
          - {livro?.ano ?? "N/A"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-6">
        {livro?.imagemUrl && (
          <img
            src={livro.imagemUrl}
            alt={livro?.titulo ?? "Capa do livro"}
            className="w-40 h-60 object-cover rounded-lg shadow-md"
          />
        )}
        <div className="flex-1 space-y-3">
          <div>
            <strong className="text-sm font-semibold">
              ISBN:
            </strong>
            <p className="text-sm text-gray-600 dark:text-slate-300">
              {livro.isbn}
            </p>
          </div>
          <div>
            <strong className="text-sm font-semibold">
              Editora:
            </strong>
            <p className="text-sm text-gray-600 dark:text-slate-300">
              {livro.editora}
            </p>
          </div>
          {livro.descricao && (
            <div>
              <strong className="text-sm font-semibold">
                Descrição:
              </strong>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
                {livro.descricao}
              </p>
            </div>
          )}
          <div>
            <strong className="text-sm font-semibold">
              Exemplares disponíveis:
            </strong>
            <p className="text-sm text-gray-600 dark:text-slate-300">
              {livro.quantidadeExemplares}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default BookDetails;




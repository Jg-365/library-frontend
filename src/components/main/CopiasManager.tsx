import { useEffect, useState } from "react";
import { copiasService } from "@/services/copiasService";
import type { Copia } from "@/types/Copia";
import {
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/types/Copia";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorMessage";

interface CopiasManagerProps {
  isbn: string;
  tituloLivro?: string;
}

export function CopiasManager({
  isbn,
  tituloLivro,
}: CopiasManagerProps) {
  const [copias, setCopias] = useState<Copia[]>([]);
  const [loading, setLoading] = useState(true);
  const [adicionando, setAdicionando] = useState(false);
  const [quantidadeCopias, setQuantidadeCopias] =
    useState(1);
  const [copiaParaDeletar, setCopiaParaDeletar] =
    useState<Copia | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    useState(false);

  console.log(
    "📦 CopiasManager renderizado para ISBN:",
    isbn
  );

  useEffect(() => {
    carregarCopias();
  }, [isbn]);

  const carregarCopias = async () => {
    try {
      setLoading(true);
      console.log("📦 Carregando cópias para ISBN:", isbn);
      const dados = await copiasService.listarPorIsbn(isbn);
      console.log("📦 Cópias carregadas:", dados);
      setCopias(dados);
    } catch (error: any) {
      console.error("❌ Erro ao carregar cópias:", error);
      toast.error("Erro ao carregar cópias", {
        description:
          getErrorMessage(
            error.response?.data?.message,
            "Não foi possível carregar as cópias do livro."
          ),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarCopias = async () => {
    try {
      setAdicionando(true);

      // Criar múltiplas cópias em sequência
      for (let i = 0; i < quantidadeCopias; i++) {
        await copiasService.criar({ isbn });
      }

      const mensagem =
        quantidadeCopias === 1
          ? "Cópia adicionada com sucesso!"
          : `${quantidadeCopias} cópias adicionadas com sucesso!`;

      toast.success(mensagem);
      setQuantidadeCopias(1); // Reset para 1
      await carregarCopias();
    } catch (error: any) {
      toast.error("Erro ao adicionar cópia", {
        description:
          getErrorMessage(
            error.response?.data?.message,
            "Não foi possível adicionar a cópia."
          ),
      });
    } finally {
      setAdicionando(false);
    }
  };

  const handleAtualizarStatus = async (
    copia: Copia,
    novoStatus: string
  ) => {
    try {
      await copiasService.atualizar(copia.sequential, {
        status: novoStatus,
      });
      toast.success("Status atualizado com sucesso!");
      await carregarCopias();
    } catch (error: any) {
      toast.error("Erro ao atualizar status", {
        description:
          getErrorMessage(
            error.response?.data?.message,
            "Não foi possível atualizar o status da cópia."
          ),
      });
    }
  };

  const handleDeletarCopia = (copia: Copia) => {
    setCopiaParaDeletar(copia);
    setIsDeleteDialogOpen(true);
  };

  const confirmarDelecao = async () => {
    if (!copiaParaDeletar) return;

    try {
      await copiasService.deletar(
        copiaParaDeletar.sequential,
        copiaParaDeletar.isbn
      );
      toast.success("Cópia excluída com sucesso!");
      await carregarCopias();
    } catch (error: any) {
      toast.error("Erro ao excluir cópia", {
        description:
          getErrorMessage(
            error.response?.data?.message,
            "Não foi possível excluir a cópia."
          ),
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCopiaParaDeletar(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = STATUS_COLORS[status] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-300",
    };

    return (
      <Badge
        className={`${colors.bg} ${colors.text} ${colors.border} border`}
      >
        {STATUS_LABELS[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Exemplares Físicos
              </CardTitle>
              <CardDescription>
                {tituloLivro && `${tituloLivro} - `}
                {copias.length}{" "}
                {copias.length === 1
                  ? "cópia cadastrada"
                  : "cópias cadastradas"}
              </CardDescription>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={carregarCopias}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              <Select
                value={quantidadeCopias.toString()}
                onValueChange={(value) =>
                  setQuantidadeCopias(parseInt(value))
                }
                disabled={adicionando}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 10, 15, 20].map(
                    (num) => (
                      <SelectItem
                        key={num}
                        value={num.toString()}
                      >
                        {num}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              <Button
                onClick={handleAdicionarCopias}
                disabled={adicionando}
                size="sm"
              >
                {adicionando ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Adicionar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {copias.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">
                Nenhuma cópia cadastrada ainda
              </p>
              <p className="text-sm">
                Clique em "Adicionar Cópia" para criar o
                primeiro exemplar
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {copias.map((copia) => (
                  <TableRow key={copia.sequential}>
                    <TableCell className="font-medium">
                      #{copia.sequential}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={copia.status}
                        onValueChange={(novoStatus) =>
                          handleAtualizarStatus(
                            copia,
                            novoStatus
                          )
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue>
                            {getStatusBadge(copia.status)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(
                            STATUS_LABELS
                          ).map(([value, label]) => (
                            <SelectItem
                              key={value}
                              value={value}
                            >
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeletarCopia(copia)
                        }
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a cópia #
              {copiaParaDeletar?.sequential}? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarDelecao}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

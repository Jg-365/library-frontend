import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, User } from "lucide-react";
import { toast } from "sonner";
import { usuariosService } from "@/services";

interface Usuario {
  id: string;
  name?: string;
  enrollment?: number;
  email?: string;
}

interface SelectUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (userId: number) => void;
  title?: string;
  description?: string;
}

export function SelectUserDialog({
  open,
  onOpenChange,
  onSelectUser,
  title = "Selecionar Usuário",
  description = "Escolha um usuário para realizar a operação",
}: SelectUserDialogProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<
    Usuario[]
  >([]);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  useEffect(() => {
    if (open) {
      fetchUsuarios();
    }
  }, [open]);

  useEffect(() => {
    if (searchTerm) {
      const normalizedSearch =
        searchTerm.toLowerCase();
      const filtered = usuarios.filter(
        (u) =>
          String(u.name ?? "")
            .toLowerCase()
            .includes(normalizedSearch) ||
          String(u.enrollment ?? "").includes(searchTerm) ||
          String(u.email ?? "")
            .toLowerCase()
            .includes(normalizedSearch)
      );
      setFilteredUsuarios(filtered);
    } else {
      setFilteredUsuarios(usuarios);
    }
  }, [searchTerm, usuarios]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const page = await usuariosService.listarTodos();
      setUsuarios(page.content);
      setFilteredUsuarios(page.content);
      setTotalUsuarios(page.totalElements);
    } catch (error: any) {
      toast.error("Erro ao carregar usuários");
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedEnrollment) {
      toast.error("Selecione um usuário");
      return;
    }

    const usuario = usuarios.find(
      (u) => String(u.enrollment ?? "") === selectedEnrollment
    );
    if (usuario) {
      onSelectUser(usuario.enrollment);
      onOpenChange(false);
      setSelectedEnrollment("");
      setSearchTerm("");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedEnrollment("");
    setSearchTerm("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Campo de busca */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar Usuário</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Nome, matrícula ou email..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="pl-9"
              />
            </div>
            <p className="text-xs text-gray-500">
              Total de usuários: {totalUsuarios}
            </p>
          </div>

          {/* Seletor de usuário */}
          <div className="space-y-2">
            <Label htmlFor="usuario">Usuário</Label>
            {loading ? (
              <p className="text-sm text-gray-500">
                Carregando usuários...
              </p>
            ) : (
              <Select
                value={selectedEnrollment}
                onValueChange={setSelectedEnrollment}
              >
                <SelectTrigger id="usuario">
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {filteredUsuarios.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      Nenhum usuário encontrado
                    </div>
                  ) : (
                    filteredUsuarios.map((usuario) => (
                      <SelectItem
                        key={usuario.id}
                        value={String(usuario.enrollment ?? "")}
                      >
                        <div
                          key={usuario.id + "-content"}
                          className="flex flex-col"
                        >
                          <span className="font-medium">
                            {(usuario.name ?? "").trim() ||
                              "Usuário sem nome"}
                          </span>
                          <span className="text-xs text-gray-500">
                            Matrícula:{" "}
                            {String(
                              usuario.enrollment ?? ""
                            )}
                            {usuario.email &&
                              ` • ${usuario.email}`}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedEnrollment}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layouts";
import { PageBreadcrumb } from "@/components/layouts/PageBreadcrumb";
import { DataTable } from "@/components/main/data-table";
import { Button } from "@/components/ui/button";
import {
  CustomModal,
  CustomModalContent,
  CustomModalDescription,
  CustomModalHeader,
  CustomModalTitle,
} from "@/components/ui/custom-modal";
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
import { UsuarioForm } from "@/components/forms/UsuarioForm";
import { createUsuarioColumn } from "@/components/ui/columns/usuariosColumn";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { Usuario } from "@/types";
import { usuariosService } from "@/services";
import { getErrorMessage } from "@/lib/errorMessage";

interface UsuarioData extends Usuario {
  ativo?: boolean;
}

export function CadastroUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioData[]>(
    []
  );
  const [totalUsuarios, setTotalUsuarios] =
    useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);
  const [selectedUsuario, setSelectedUsuario] =
    useState<UsuarioData | null>(null);
  const [usuarioToDelete, setUsuarioToDelete] =
    useState<UsuarioData | null>(null);

  const fetchUsuarios = async () => {
    try {
      const page = await usuariosService.listarTodos();
      setUsuarios(page.content);
      setTotalUsuarios(page.totalElements);
    } catch (error: any) {
      toast.error("Erro ao carregar usuários");
      console.error("Erro ao buscar usuários:", error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleEdit = (usuario: UsuarioData) => {
    setSelectedUsuario(usuario);
    setDialogOpen(true);
  };

  const handleDelete = (usuario: UsuarioData) => {
    setUsuarioToDelete(usuario);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!usuarioToDelete) return;

    try {
      await usuariosService.deletar(
        usuarioToDelete.enrollment?.toString() || ""
      );
      toast.success("Usuário excluído com sucesso!");
      setUsuarios((prev) =>
        prev.filter(
          (usuario) =>
            (usuario.enrollment ?? usuario.id) !==
            (usuarioToDelete.enrollment ??
              usuarioToDelete.id)
        )
      );
      setTotalUsuarios((prev) =>
        Math.max(prev - 1, 0)
      );
    } catch (error: any) {
      const message = getErrorMessage(
        error.response?.data?.message,
        "Erro ao excluir usuário"
      );
      toast.error(message);
    } finally {
      setDeleteDialogOpen(false);
      setUsuarioToDelete(null);
    }
  };

  const handleSuccess = (
    savedUsuario: Usuario,
    mode: "create" | "update"
  ) => {
    setDialogOpen(false);
    setSelectedUsuario(null);
    setUsuarios((prev) => {
      const savedKey =
        savedUsuario.enrollment ?? savedUsuario.id;
      if (mode === "create") {
        const exists = prev.some(
          (usuario) =>
            (usuario.enrollment ?? usuario.id) ===
            savedKey
        );
        if (exists) {
          return prev.map((usuario) =>
            (usuario.enrollment ?? usuario.id) ===
            savedKey
              ? { ...usuario, ...savedUsuario }
              : usuario
          );
        }
        return [
          { ...savedUsuario, ativo: true },
          ...prev,
        ];
      }

      return prev.map((usuario) =>
        (usuario.enrollment ?? usuario.id) === savedKey
          ? { ...usuario, ...savedUsuario }
          : usuario
      );
    });
    if (mode === "create") {
      setTotalUsuarios((prev) => prev + 1);
    }
  };

  const handleNewUsuario = () => {
    setSelectedUsuario(null);
    setDialogOpen(true);
  };

  const columns = createUsuarioColumn({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <PageLayout perfil="ADMIN">
      <div className="px-4 md:px-6 lg:px-8">
        <PageBreadcrumb
          items={[
            { label: "Início", href: "/admin/dashboard" },
            { label: "Usuários" },
          ]}
          backTo="/admin/dashboard"
        />
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gerenciamento de Usuários
            </h1>
            <p className="text-gray-600 mt-1 dark:text-slate-300">
              Cadastre e gerencie professores, alunos e
              bibliotecários
            </p>
            <p className="text-sm text-gray-500 mt-1 dark:text-slate-400">
              Total de usuários: {totalUsuarios}
            </p>
          </div>
          <Button
            onClick={handleNewUsuario}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg hover:from-blue-700 hover:to-indigo-700 sm:w-auto"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Novo Usuário
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-lg dark:bg-slate-900 dark:text-slate-100">
          <DataTable columns={columns} data={usuarios} />
        </div>

        {/* Dialog de Cadastro/Edição */}
        <CustomModal
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        >
          <CustomModalContent
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
            showCloseButton
            onClose={() => setDialogOpen(false)}
          >
            <CustomModalHeader>
              <CustomModalTitle>
                {selectedUsuario
                  ? "Editar Usuário"
                  : "Novo Usuário"}
              </CustomModalTitle>
              <CustomModalDescription>
                {selectedUsuario
                  ? "Atualize as informações do usuário"
                  : "Preencha os dados para cadastrar um novo usuário"}
              </CustomModalDescription>
            </CustomModalHeader>
            <UsuarioForm
              usuario={selectedUsuario || undefined}
              onSuccess={handleSuccess}
            />
          </CustomModalContent>
        </CustomModal>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Confirmar Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o usuário{" "}
                <span className="font-semibold">
                  {usuarioToDelete?.nome}
                </span>
                ? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageLayout>
  );
}

import { useState } from "react";
import { PageLayout } from "@/components/layouts";
import { PageBreadcrumb } from "@/components/layouts/PageBreadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Bell,
  Palette,
  Globe,
  Mail,
  Save,
} from "lucide-react";
import { toast } from "sonner";

export function Configuracoes() {
  const [salvando, setSalvando] = useState(false);

  const handleSalvarConfiguracoes = async () => {
    setSalvando(true);

    try {
      // Simulação de salvamento
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      toast.success("Configurações salvas com sucesso!");

      // TODO: Integrar com backend para salvar configurações
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <PageLayout perfil={"USUARIO"}>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageBreadcrumb
          items={[
            { label: "Início", href: "/usuario" },
            { label: "Configurações" },
          ]}
          backTo="/usuario"
        />
        {/* Título da Página */}
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
            <Settings className="h-8 w-8 text-blue-600" />
            Configurações
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Personalize sua experiência no sistema de
            biblioteca
          </p>
        </div>

        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <CardTitle>Configurações Gerais</CardTitle>
            </div>
            <CardDescription>
              Configure preferências básicas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="idioma">Idioma</Label>
                <Select defaultValue="pt-br">
                  <SelectTrigger id="idioma">
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-br">
                      Português (BR)
                    </SelectItem>
                    <SelectItem value="en">
                      English
                    </SelectItem>
                    <SelectItem value="es">
                      Español
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuso">Fuso Horário</Label>
                <Select defaultValue="america-sao-paulo">
                  <SelectTrigger id="fuso">
                    <SelectValue placeholder="Selecione o fuso horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america-sao-paulo">
                      América/São Paulo (UTC-3)
                    </SelectItem>
                    <SelectItem value="america-new-york">
                      América/Nova York (UTC-5)
                    </SelectItem>
                    <SelectItem value="europe-london">
                      Europa/Londres (UTC+0)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aparência */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-blue-600" />
              <CardTitle>Aparência</CardTitle>
            </div>
            <CardDescription>
              Personalize a interface do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tema">Tema</Label>
              <Select defaultValue="light">
                <SelectTrigger id="tema">
                  <SelectValue placeholder="Selecione o tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    Claro
                  </SelectItem>
                  <SelectItem value="dark">
                    Escuro
                  </SelectItem>
                  <SelectItem value="auto">
                    Automático
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tamanho-fonte">
                Tamanho da Fonte
              </Label>
              <Select defaultValue="medium">
                <SelectTrigger id="tamanho-fonte">
                  <SelectValue placeholder="Selecione o tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">
                    Pequena
                  </SelectItem>
                  <SelectItem value="medium">
                    Média
                  </SelectItem>
                  <SelectItem value="large">
                    Grande
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <CardTitle>Notificações</CardTitle>
            </div>
            <CardDescription>
              Configure como você deseja receber
              notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">
                    Empréstimos e Devoluções
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Notificações sobre seus empréstimos
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  Ativo
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Reservas</p>
                  <p className="text-sm text-muted-foreground">
                    Alertas sobre suas reservas
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  Ativo
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">
                    Novidades do Acervo
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Novos livros adicionados
                  </p>
                </div>
                <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                  Inativo
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <CardTitle>Email</CardTitle>
            </div>
            <CardDescription>
              Configure suas preferências de email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Principal</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                defaultValue="usuario@biblioteca.com"
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">
                  Resumo Semanal
                </p>
                <p className="text-sm text-muted-foreground">
                  Receba um resumo semanal por email
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                Ativo
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button
            size="lg"
            className="gap-2"
            onClick={handleSalvarConfiguracoes}
            disabled={salvando}
          >
            {salvando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>

        {/* Informações */}
        <Card>
          <CardHeader>
            <CardTitle>Sobre o Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Versão:</strong> 1.0.0
            </p>
            <p>
              <strong>Última atualização:</strong>{" "}
              31/12/2025
            </p>
            <p>
              <strong>Suporte:</strong>{" "}
              suporte@biblioteca.com
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

export default Configuracoes;

/**
 * Índice centralizado de todos os serviços da aplicação
 *
 * Este arquivo exporta todos os serviços para facilitar as importações.
 * Exemplo de uso:
 *
 * import { livrosService, emprestimosService } from "@/services";
 */

export { default as api } from "./api";
export { authService } from "./authService";
export { livrosService } from "./livrosService";
export { emprestimosService } from "./emprestimosService";
export { multasService } from "./multasService";
export { professoresService } from "./professoresService";
export { subcategoriasService } from "./subcategoriasService";
export {
  autoresService,
  type AutorPayload,
} from "./autoresService";
export { categoriasService } from "./categoriasService";
export { cursosService } from "./cursosService";
export { reservasService } from "./reservasService";
export { copiasService } from "./copiasService";
export { usuariosService } from "./usuariosService";
export { telefonesService } from "./telefonesService";
export { reportsService } from "./reportsService";

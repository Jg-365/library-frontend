import MockAdapter from "axios-mock-adapter";
import { api } from "./api";
import {
  setupAuthHandlers,
  setupBooksHandlers,
  setupEmprestimosHandlers,
  setupReservasHandlers,
  setupAutoresHandlers,
  setupCategoriasHandlers,
  setupUsuariosHandlers,
  setupCursosHandlers,
  setupSubcategoriasHandlers,
  setupMultasHandlers,
  setupProfessoresHandlers,
} from "./mocks/handlers";

/**
 * Inicializa o Mock Adapter para interceptar requisições da API
 * Usado apenas em desenvolvimento para simular o backend
 */
export function initializeMocks() {
  console.log("🎭 Inicializando Mock Adapter...");

  // Cria instância do MockAdapter com latência simulada
  const mock = new MockAdapter(api, { delayResponse: 500 });

  // Configura todos os handlers de forma modular
  setupAuthHandlers(mock);
  setupBooksHandlers(mock);
  setupEmprestimosHandlers(mock);
  setupReservasHandlers(mock);
  setupAutoresHandlers(mock);
  setupCategoriasHandlers(mock);
  setupUsuariosHandlers(mock);
  setupCursosHandlers(mock);
  setupSubcategoriasHandlers(mock);
  setupMultasHandlers(mock);
  setupProfessoresHandlers(mock);

  console.log("✅ Mock Adapter configurado com sucesso!");

  return mock;
}

// Auto-inicializa em desenvolvimento
let mockInstance: MockAdapter | null = null;

if (import.meta.env.DEV) {
  mockInstance = initializeMocks();
}

export default mockInstance;


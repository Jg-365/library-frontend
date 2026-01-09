import type { Usuario } from "./Usuario";
import type { Curso } from "./Curso";

export interface Professor extends Usuario {
  cursoId?: number;
  departamento?: string;
  titulacao?:
    | "GRADUADO"
    | "ESPECIALISTA"
    | "MESTRE"
    | "DOUTOR"
    | "POS_DOUTOR";
  areaEspecializacao?: string;
  curso?: Curso;
}

export interface ProfessoresPorCurso {
  cursoId: number;
  curso?: Curso;
  professores: Professor[];
  total: number;
}

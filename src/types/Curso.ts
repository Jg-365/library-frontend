export interface Curso {
  courseCode: number;
  courseName: string;
  id?: number;
  codigo?: string;
  descricao?: string;
  duracao?: number;
  nivel?:
    | "GRADUACAO"
    | "TECNICO"
    | "POS_GRADUACAO"
    | "MESTRADO"
    | "DOUTORADO";
  ativo?: boolean;
}

export interface CourseCreateRequest {
  courseCode?: number;
  courseName: string;
}

export interface CourseUpdateRequest {
  courseCode: number;
  courseName: string;
}

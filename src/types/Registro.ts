import type { Estagio } from "./Estagio";
import type { Operacao } from "./Operacao";

export default interface Registro {
  readonly instante: number;
  readonly idAviao: number;
  readonly combustivelNoMomento: number;
  readonly estagio: Estagio;
  readonly operacao: Operacao;
  readonly pistaId: number;
  readonly prateleiraId: number;
}
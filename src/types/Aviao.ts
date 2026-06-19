import type { Operacao } from "./Operacao";

export interface AviaoConfig {
  id: number;
  combustivelInicial: number;
  operacao: Operacao;
}
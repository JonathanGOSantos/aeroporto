import type { Estagio } from "./Estagio";
import type { Operacao } from "./Operacao";

export interface AviaoConfig {
  id: number;
  combustivelInicial: number;
  operacao: Operacao;
}

export interface AviaoState {
  readonly id: number;
  combustivel: number;
  tempoDeEspera: number;
  readonly operacao: Operacao;
}

export interface Registro {
  readonly instante: number;
  readonly idAviao: number;
  readonly combustivelNoMomento: number;
  readonly estagio: Estagio;
  readonly operacao: Operacao;
  readonly pistaId: number;
  readonly prateleiraId: number;
}

export interface SimuladorConfig {
  probabilidadePouso: number;     // 0.0 a 1.0
  probabilidadeDecolagem: number; // 0.0 a 1.0
  combustivelMaximo: number;      // Padrão: 20
  intervaloTickMs: number;        // Velocidade da simulação
}

export interface MetricasSimulacao {
  totalPousos: number;
  totalDecolagens: number;
  tempoEsperaTotalPouso: number;
  tempoEsperaTotalDecolagem: number;
  totalQuedas: number;
  totalPousosSemCombustivel: number;
}